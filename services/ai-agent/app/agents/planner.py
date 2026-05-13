"""
Planner Agent – powered by a  LLM (Ollama ).
Analyzes the user query and outputs a structured plan (JSON).
"""
from langchain_ollama import ChatOllama
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

# Define the expected output schema for the plan
class PlanOutput(BaseModel):
    query: str = Field(description="The original user query (for downstream retrieval)")
    steps: list[str] = Field(description="Ordered list of steps/tools to call")

class PlannerAgent:
    def __init__(self):
        # Use Ollama with Phi-3-mini; temperature=0 for deterministic, reliable plans
        self.llm = ChatOllama(model="phi3:mini", temperature=0)
        self.parser = PydanticOutputParser(pydantic_object=PlanOutput)
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """
You are a planning agent for a food rescue app. Your job is to create a plan to fulfill the user's request.
Available tools:
- get_user_history: retrieves past orders
- get_available_bags: finds bags near a location
- compute_similarity_rag: uses semantic search to find relevant bags
- estimate_pricing: suggests a discount

Output a JSON plan with exactly two keys:
- "query": the original user query
- "steps": an array of tool names in the order they should be called.

{format_instructions}
"""),
            ("user", "{user_query}")
        ])

    async def plan(self, user_query: str) -> dict:
        # Build the chain: prompt -> LLM -> parser
        chain = self.prompt | self.llm | self.parser
        # Invoke and get a PlanOutput object
        plan_output = await chain.ainvoke({
            "user_query": user_query,
            "format_instructions": self.parser.get_format_instructions()
        })
        # Convert to dict for downstream (RAG agent expects dict)
        return plan_output.model_dump()