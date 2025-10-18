from flask import Blueprint, jsonify, request, current_app
from pydantic import ValidationError

from models.trace_data import GenerateRequest
from services.ai_generator import generate_outline_image


generate_bp = Blueprint("generate", __name__)


@generate_bp.route("/generate", methods=["POST"])
def generate():
    current_app.logger.info("/api/generate called")
    try:
        data = request.get_json(force=True, silent=False) or {}
        req = GenerateRequest(**data)
    except ValidationError as ve:
        return jsonify({"error": ve.errors()}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # Generate outline image using Gemini AI (or fallback to mock)
    result = generate_outline_image(req.prompt)
    return jsonify(result), 200
