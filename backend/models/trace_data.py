from typing import List, Optional
from pydantic import BaseModel, Field


class Point(BaseModel):
    x: float = Field(..., description="X coordinate in pixels")
    y: float = Field(..., description="Y coordinate in pixels")
    time: Optional[float] = Field(None, description="Optional timestamp in ms")


class Stroke(BaseModel):
    points: List[Point] = Field(..., min_length=1, description="Ordered points for one stroke")


class TracePayload(BaseModel):
    strokes: List[Stroke] = Field(..., min_length=1, description="One or more strokes")


class ScoreRequest(BaseModel):
    imageId: str
    traceData: TracePayload


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="Text prompt for image generation")
