"""Pydantic schemas for request/response validation and OpenAPI docs."""
from pydantic import BaseModel, Field
from typing import List, Optional


class PositionOut(BaseModel):
    broker: str
    accountName: str
    symbol: str
    quantity: float
    entryPrice: float
    currentPrice: float
    marketValue: float
    unrealisedPnl: float
    unrealisedPnlPct: float


class PortfolioResponse(BaseModel):
    positions: List[PositionOut]
    total_value: float
    total_unrealised_pnl: float


class OptionContractOut(BaseModel):
    symbol: str
    expiry_date: str
    strike: float
    option_type: str
    bid: float
    ask: float
    volume: int
    open_interest: int
    implied_volatility: float
    delta: Optional[float] = None
    days_to_expiry: int


class OptionsChainResponse(BaseModel):
    underlying: str
    expiry_date: str
    puts: List[OptionContractOut]
    calls: List[OptionContractOut]


class HedgeRequest(BaseModel):
    symbol: str = Field(..., examples=["AAL"])
    shares_held: int = Field(..., examples=[5000])
    entry_price: float = Field(..., examples=[11.30])
    current_price: float = Field(..., examples=[10.97])
    num_recommendations: int = Field(default=3, ge=1, le=5)


class HedgeRecommendationOut(BaseModel):
    rank: int
    expiry_date: str
    strike: float
    ask: float
    open_interest: int
    contracts_to_buy: int
    total_cost: float
    breakeven_price: float
    coverage_at_10pct_drop: float
    value_score: float
    ai_explanation: Optional[str] = None


class HedgeResponse(BaseModel):
    recommendations: List[HedgeRecommendationOut]
    strategy: str


class ExplainRequest(BaseModel):
    contract: dict


class ExplainResponse(BaseModel):
    explanation: str
    model_used: str
    cached: bool = False


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: List[ChatMessage] = []
    portfolio_context: Optional[dict] = None


class ChatResponse(BaseModel):
    reply: str
    model_used: str


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class WaitlistRequest(BaseModel):
    email: str = Field(..., examples=["trader@example.com"])


class WaitlistResponse(BaseModel):
    message: str
    position: int
