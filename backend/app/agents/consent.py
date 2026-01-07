"""
Consent and auto-reallocation rules prototype.

This module models consented savings pots, priorities, and auto-transfer rules.
It does not perform transfers; it only evaluates whether a transfer would be
allowed and computes suggested amounts based on available balances and limits.
"""
from typing import Dict, Any, List


class ConsentConfig:
    def __init__(self):
        # user-configured pots and permissions
        # format: { pot_id: {name, allowed: bool, priority: int, max_percent: float} }
        self.pots: Dict[int, Dict[str, Any]] = {}

    def add_pot(self, pot_id: int, name: str, allowed: bool = True, priority: int = 100, max_percent: float = 0.5):
        self.pots[pot_id] = {"name": name, "allowed": allowed, "priority": priority, "max_percent": max_percent}

    def can_use(self, pot_id: int) -> bool:
        p = self.pots.get(pot_id)
        return bool(p and p.get("allowed"))

    def prioritized_pots(self) -> List[Dict[str, Any]]:
        return sorted([{"id": k, **v} for k, v in self.pots.items()], key=lambda x: x["priority"])


# global consent config for prototype
CONSENT = ConsentConfig()


def suggest_auto_allocation(available_amount: float) -> List[Dict[str, Any]]:
    """Return suggested allocations across allowed pots respecting priorities and max_percent."""
    out = []
    pots = [p for p in CONSENT.prioritized_pots() if p.get("allowed")]
    for p in pots:
        cap = p.get("max_percent", 0.5) * available_amount
        suggested = cap  # for prototype, assign cap; production may use dynamic logic
        out.append({"pot_id": p["id"], "suggested": suggested, "pot_name": p.get("name")})
    return out
