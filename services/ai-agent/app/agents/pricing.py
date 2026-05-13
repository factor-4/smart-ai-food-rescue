"""
Pricing Agent – calculates a dynamic discount for surplus bags.
Uses rule‑based logic (time urgency + supply + price tier).
Designed so an LLM fallback can be added later without changing the callers.
"""
from datetime import datetime, timezone
from app.core.db import get_bag_by_id

class PricingAgent:
    def __init__(self):
        # Thresholds — easy to adjust
        self.urgent_hours = 2        # if pickup < 2h away → urgent
        self.high_stock = 5          # more than this → overstocked
        self.base_discount = 0.10    # 10% minimum
        self.max_discount = 0.70     # never discount more than 70%

    async def suggest(self, bag_id: int) -> float:
        """
        Return a discount as a decimal (0.0 = 0%, 1.0 = 100%).
        """
        bag = get_bag_by_id(bag_id)
        if bag is None:
            return 0.0   # bag not found → no discount

        discount = self.base_discount

        # ── Rule 1: Time urgency ────────────────────────────
        now = datetime.now(timezone.utc)
        pickup = bag["pickup_time"]
        # If pickup_time is timezone‑naive, make it UTC
        if pickup.tzinfo is None:
            pickup = pickup.replace(tzinfo=timezone.utc)
        hours_left = (pickup - now).total_seconds() / 3600

        if hours_left <= self.urgent_hours:
            # 30% extra if very urgent
            discount += 0.30
        elif hours_left <= self.urgent_hours * 2:
            # 15% extra if moderately urgent
            discount += 0.15

        # ── Rule 2: High stock ──────────────────────────────
        if bag["quantity"] >= self.high_stock:
            discount += 0.15   # encourage bulk purchases
        elif bag["quantity"] >= 3:
            discount += 0.05   # small incentive

        # ── Rule 3: Price tier ──────────────────────────────
        if bag["original_price"] > 20:
            discount += 0.05   # expensive items can absorb more discount

        # ── Cap the discount ────────────────────────────────
        discount = min(discount, self.max_discount)
        discount = round(discount, 2)

        return discount