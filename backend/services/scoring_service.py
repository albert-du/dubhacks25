import random
from typing import Dict

from flask import current_app


def score_trace(image_id: str, trace_payload: Dict) -> Dict[str, float | str]:
    """Mock scoring implementation.

    In a future version, this will use OpenCV/numpy to compare the user's trace
    against the outline and compute real metrics (e.g., Hausdorff distance,
    path smoothness via velocity/jerk, etc.).
    """
    current_app.logger.info("Scoring trace for image_id=%s", image_id)

    # Mock values for now
    accuracy = round(random.uniform(0.6, 0.98), 2)
    smoothness = round(random.uniform(0.6, 0.98), 2)

    # Simple feedback placeholder
    if accuracy > 0.85 and smoothness > 0.85:
        feedback = "Great progress! Lines are more stable than before."
    elif accuracy > 0.75:
        feedback = "Nice work! Try to keep a steady hand for smoother lines."
    else:
        feedback = "Keep practicing. Focus on tracing slowly along the outline."

    return {
        "accuracy": float(accuracy),
        "smoothness": float(smoothness),
        "feedback": feedback,
    }
