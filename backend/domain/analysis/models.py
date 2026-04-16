"""Analysis domain models.

AIExplanation wraps a Claude response with metadata and a mandatory disclaimer.
"""
from dataclasses import dataclass


@dataclass
class AIExplanation:
    """Result of a Claude AI analysis of an option contract or hedge recommendation.

    Args:
        content: The raw analysis text returned by Claude.
        model_used: The Claude model ID used (e.g. "claude-opus-4-6").
        cached: True if this response was served from ChromaDB cache.
        disclaimer: Regulatory disclaimer appended to all AI output.
    """

    content: str
    model_used: str
    cached: bool = False
    disclaimer: str = (
        "AI-generated analysis for informational purposes only, "
        "not investment advice. Options involve risk."
    )

    @property
    def full_content(self) -> str:
        """Content with disclaimer appended, separated by a blank line."""
        return f"{self.content}\n\n{self.disclaimer}"
