from pydantic import BaseModel, Field


class ScoreResult(BaseModel):
    accuracy: float = Field(..., ge=0.0, le=1.0)
    smoothness: float = Field(..., ge=0.0, le=1.0)
    feedback: str
