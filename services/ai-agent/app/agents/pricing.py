"""
Pricing Agent – calculates a dynamic discount for surplus bags.
Uses rule‑based logic (time urgency + supply + price tier) as default,
with an optional LLM fallback for complex/urgent scenarios.
"""
import os
import re
from datetime import datetime, timezone
from app.core.db import get_bag_by_id
from langsmith import traceable
from langchain_ollama import ChatOllama

class PricingAgent:
    def __init__(self):
        self.urgent_hours = 2
        self.high_stock = 5
        self.base_discount = 0.10
        self.max_discount = 0.70

        self.llm = ChatOllama(
            model="phi3:mini",
            temperature=0,
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
        )

    @traceable(name="PricingAgent.suggest", project_name="smart-food-rescue")
    async def suggest(self, bag_id: int) -> float:
        bag = get_bag_by_id(bag_id)
        if bag is None:
            return 0.0

        rule_discount = self._calculate_rule_discount(bag)

        now = datetime.now(timezone.utc)
        pickup = bag["pickup_time"]
        if pickup.tzinfo is None:
            pickup = pickup.replace(tzinfo=timezone.utc)
        hours_left = (pickup - now).total_seconds() / 3600
        quantity = bag["quantity"]

        if hours_left <= self.urgent_hours and quantity >= self.high_stock:
            try:
                llm_discount = await self._llm_suggest(bag)
                discount = max(rule_discount, llm_discount)
            except Exception as e:
                print(f"LLM fallback failed, using rule discount: {e}")
                discount = rule_discount
        else:
            discount = rule_discount

        discount = min(discount, self.max_discount)
        discount = round(discount, 2)
        return discount

    def _calculate_rule_discount(self, bag: dict) -> float:
        discount = self.base_discount

        now = datetime.now(timezone.utc)
        pickup = bag["pickup_time"]
        if pickup.tzinfo is None:
            pickup = pickup.replace(tzinfo=timezone.utc)
        hours_left = (pickup - now).total_seconds() / 3600

        if hours_left <= self.urgent_hours:
            discount += 0.30
        elif hours_left <= self.urgent_hours * 2:
            discount += 0.15

        if bag["quantity"] >= self.high_stock:
            discount += 0.15
        elif bag["quantity"] >= 3:
            discount += 0.05

        if bag["original_price"] > 20:
            discount += 0.05

        discount = min(discount, self.max_discount)
        return discount

    async def _llm_suggest(self, bag: dict) -> float:
        prompt = f"""
You are a dynamic pricing agent for a food rescue platform.
A surplus bag has these details:
- Name: {bag.get('name', 'Unknown')}
- Original price: ${bag.get('original_price', 0):.2f}
- Quantity left: {bag.get('quantity', 0)}
- Hours until pickup: {self.urgent_hours:.1f} (or less)

The goal is to prevent food waste. Recommend a discount percentage (as a decimal between 0 and 1) that maximises the chance of selling the bag immediately, while still being acceptable for the business.
Return only the number (e.g., 0.85).
"""
        response = await self.llm.ainvoke(prompt)
        match = re.search(r"(\d+\.?\d*)", response.content)
        if match:
            return float(match.group(1))
        return 0.0