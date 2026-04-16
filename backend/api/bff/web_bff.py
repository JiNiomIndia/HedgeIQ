"""Web BFF — ACTIVE. Shapes API responses for the React web dashboard.

BFF Pattern: each client surface gets its own BFF that tailors the
domain model to exactly what the frontend component needs.

  web_bff.py     ACTIVE  — React web app
  desktop_bff.py SCAFFOLD — Electron desktop (v2)
  mobile_bff.py  SCAFFOLD — iOS / Android (v3)
"""
from typing import List

from backend.domain.hedging.models import HedgeRecommendation
from backend.domain.positions.models import Portfolio


def shape_portfolio_response(portfolio: Portfolio) -> dict:
    """Shape a Portfolio aggregate for the React PositionsTable component.

    Converts Decimal fields to float so they serialise cleanly to JSON.

    Args:
        portfolio: Portfolio aggregate from PositionService.

    Returns:
        Dict with camelCase position fields plus portfolio totals.
    """
    positions = [
        {
            "broker": p.broker,
            "accountName": p.account_name,
            "symbol": p.symbol,
            "quantity": float(p.quantity),
            "entryPrice": float(p.entry_price),
            "currentPrice": float(p.current_price),
            "marketValue": float(p.market_value),
            "unrealisedPnl": float(p.unrealised_pnl),
            "unrealisedPnlPct": float(p.unrealised_pnl_pct),
        }
        for p in portfolio.positions
    ]
    return {
        "positions": positions,
        "total_value": float(portfolio.total_value),
        "total_unrealised_pnl": float(portfolio.total_unrealised_pnl),
    }


def shape_hedge_response(recommendations: List[HedgeRecommendation]) -> dict:
    """Shape HedgeRecommendations for the React EmergencyHedge component.

    Args:
        recommendations: Ranked list from HedgeService (best value first).

    Returns:
        Dict with ranked recommendation list and strategy name.
    """
    recs = [
        {
            "rank": i + 1,
            "expiry_date": r.contract.expiry_date,
            "strike": float(r.contract.strike),
            "ask": float(r.contract.ask),
            "open_interest": r.contract.open_interest,
            "contracts_to_buy": r.contracts_to_buy,
            "total_cost": float(r.total_cost),
            "breakeven_price": float(r.breakeven_price),
            "coverage_at_10pct_drop": float(r.coverage_at_10pct_drop),
            "value_score": float(r.value_score),
            "ai_explanation": r.ai_explanation,
        }
        for i, r in enumerate(recommendations)
    ]
    return {"recommendations": recs, "strategy": "Protective Put"}
