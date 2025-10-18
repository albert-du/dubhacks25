from flask import Blueprint, jsonify, request, current_app
from pydantic import ValidationError

from models.trace_data import ScoreRequest
from models.score_result import ScoreResult
from services.scoring_service import score_trace


score_bp = Blueprint("score", __name__)


@score_bp.route("/score", methods=["POST"])
def score():
    current_app.logger.info("/api/score called")
    try:
        data = request.get_json(force=True, silent=False) or {}
        req = ScoreRequest(**data)
    except ValidationError as ve:
        return jsonify({"error": ve.errors()}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # Delegate to scoring service (mock for now)
    result = score_trace(req.imageId, req.traceData.model_dump())
    # Validate and shape response via Pydantic before returning
    resp = ScoreResult(**result)
    return jsonify(resp.model_dump()), 200
