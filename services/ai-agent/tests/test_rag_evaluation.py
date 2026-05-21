"""
Evaluation of RAG agent using LLM-as-Judge (Ollama phi3:mini).
Runs all test cases in a single async function to avoid event loop issues.
Uses regex extraction to handle chatty LLM outputs.
"""
import pytest
import json
import re
from app.agents.rag import RAGAgent
from app.agents.planner import PlannerAgent
from langchain_ollama import ChatOllama
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

# Load test cases
with open("tests/test_dataset.json", "r") as f:
    TEST_CASES = json.load(f)

# Create the judge LLM
judge_llm = ChatOllama(model="phi3:mini", temperature=0)

# Judge prompt – even stricter now, but we'll still use regex just in case
JUDGE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a scoring machine. Your ONLY output must be a single decimal number between 0.0 and 1.0.
Do NOT include any words, explanations, or punctuation. Just the number.

Scoring guide:
1.0 = perfectly matches dietary preference, food type, and price
0.7 = somewhat relevant
0.3 = loosely related
0.0 = completely irrelevant"""),
    ("user", "Query: {query}\nRecommended bag IDs: {recommendations}\nExpected bag IDs: {expected}")
])

judge_chain = JUDGE_PROMPT | judge_llm | StrOutputParser()

# Regex to pull the first float from a string (e.g. "Score: 0.3" → 0.3)
SCORE_PATTERN = re.compile(r"(\d+\.?\d*)")

def extract_score(text: str) -> float:
    """Extract the first decimal number from the LLM output."""
    match = SCORE_PATTERN.search(text)
    if match:
        return float(match.group(1))
    raise ValueError(f"No numeric score found in: {text}")

@pytest.mark.asyncio
async def test_rag_recommendations():
    """Test all cases in one async run to avoid event loop closure on Windows."""
    rag = RAGAgent()
    planner = PlannerAgent()

    for case in TEST_CASES:
        plan = await planner.plan(case["query"])
        recommendations = await rag.recommend(plan, case["user_id"])

        score_str = await judge_chain.ainvoke({
            "query": case["query"],
            "recommendations": recommendations,
            "expected": case["expected_recommendations"]
        })

        score = extract_score(score_str)

        print(f"\nQuery: {case['query']}")
        print(f"Expected: {case['expected_recommendations']}")
        print(f"Got: {recommendations}")
        print(f"Judge raw output: {score_str.strip()}")
        print(f"Extracted score: {score:.2f}")

        assert 0.0 <= score <= 1.0, f"Score out of range: {score}"
        assert score >= 0.2, f"Score too low for query '{case['query']}': {score}"