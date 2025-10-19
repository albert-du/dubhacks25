from flask import Blueprint, jsonify, request, current_app
from pydantic import ValidationError

from models.trace_data import GenerateRequest
from services.ai_generator import generate_outline_image


generate_bp = Blueprint("generate", __name__)


@generate_bp.route("/generate", methods=["POST"])
def generate():
    current_app.logger.info("/api/generate called")
    
    # Check if this is a multipart request (with file upload) or JSON
    if request.content_type and 'multipart/form-data' in request.content_type:
        # Handle file upload + form data
        try:
            prompt = request.form.get('prompt', '')
            if not prompt:
                return jsonify({"error": "prompt is required"}), 400
                
            # Get uploaded image file if present
            user_image_data = None
            if 'image' in request.files:
                uploaded_file = request.files['image']
                if uploaded_file and uploaded_file.filename:
                    user_image_data = uploaded_file.read()
                    current_app.logger.info(f"Received image upload: {len(user_image_data)} bytes")
            
            # Generate outline image using Gemini AI (or fallback to mock)
            result = generate_outline_image(prompt, user_image_data)
            return jsonify(result), 200
            
        except Exception as e:
            current_app.logger.error(f"Error processing multipart request: {e}")
            return jsonify({"error": str(e)}), 400
    else:
        # Handle JSON request (original functionality)
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
