import os
import uuid
import hashlib
from typing import Dict, List, Optional
from io import BytesIO
import requests

from flask import current_app
from PIL import Image, ImageFilter, ImageEnhance
from google import genai
from google.genai import types


def enhance_prompt(prompt: str, accuracy_scores: List[float]) -> str:
    """Enhance the user's prompt using the Prompt Enhancer API.
    
    Args:
        prompt: The original user prompt
        accuracy_scores: Array of recent accuracy scores from past tracing attempts
    
    Returns:
        The adjusted/enhanced prompt, or the original prompt if enhancement fails
    """
    enhancer_api_url = "https://falling-snowflake-1c9b.albertdu369.workers.dev/"
    
    try:
        current_app.logger.info(f"Enhancing prompt with API: {prompt}")
        
        # Call the Prompt Enhancer API
        response = requests.post(
            enhancer_api_url,
            json={
                "prompt": prompt,
                "accuracy_scores": accuracy_scores
            },
            timeout=5  # 5 second timeout
        )
        
        response.raise_for_status()
        result = response.json()
        
        # Extract the adjusted prompt
        adjusted_prompt = result.get("adjusted_prompt", prompt)
        
        current_app.logger.info(f"✓ Prompt enhanced: {adjusted_prompt[:100]}...")
        return adjusted_prompt
        
    except requests.exceptions.Timeout:
        current_app.logger.warning("Prompt enhancer API timeout, using original prompt")
        return prompt
    except requests.exceptions.RequestException as e:
        current_app.logger.warning(f"Prompt enhancer API error: {e}, using original prompt")
        return prompt
    except Exception as e:
        current_app.logger.warning(f"Unexpected error in prompt enhancement: {e}, using original prompt")
        return prompt


def _extract_outline_from_image(img: Image.Image) -> Image.Image:
    """Convert a color image to a black-and-white outline suitable for tracing.
    
    This uses edge detection and contrast enhancement to create a coloring-page style outline.
    """
    # Convert to grayscale
    gray = img.convert('L')
    
    # Enhance contrast to make edges more pronounced
    enhancer = ImageEnhance.Contrast(gray)
    gray = enhancer.enhance(2.0)
    
    # Find edges using PIL's built-in edge detection
    edges = gray.filter(ImageFilter.FIND_EDGES)
    
    # Invert so edges are black on white background
    edges = edges.point(lambda x: 255 - x)
    
    # Enhance the edge contrast again
    enhancer = ImageEnhance.Contrast(edges)
    outlined = enhancer.enhance(1.5)
    
    # Convert to RGB mode (white background, black lines)
    result = Image.new('RGB', outlined.size, 'white')
    result.paste(outlined, (0, 0))
    
    return result


def generate_outline_image(prompt: str, user_image_data: Optional[bytes] = None) -> Dict[str, str]:
    """Generate a coloring page outline using Gemini 2.0 Flash Image Generation.
    
    Uses gemini-2.0-flash-preview-image-generation model which is available on free tier.
    
    Args:
        prompt: Text description of what to draw (e.g., "a cat in a field")
    
    Returns:
        Dict with 'id' and 'imageUrl' keys pointing to the generated outline
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        current_app.logger.warning("GEMINI_API_KEY not set, falling back to mock image")
        return get_or_create_mock_image()
    
    try:
        # Initialize Gemini client
        client = genai.Client(api_key=api_key)
        
        # Mock recent accuracy scores (TODO: Replace with actual user history)
        # These represent recent tracing performance scores
        mock_accuracy_scores = [0.1, 0.3, 0.2, 0.1]
        
        # Enhance the prompt using the Prompt Enhancer API
        enhanced_user_prompt = enhance_prompt(prompt, mock_accuracy_scores)
        
        # Create coloring book style prompt - ask for black and white outline directly
        # Request 4:3 aspect ratio in the prompt for landscape-oriented coloring pages
        enhanced_prompt = (
    f"Create a clean, high-contrast black and white coloring book page of {enhanced_user_prompt}. "
    "Use a 4:3 aspect ratio (landscape orientation). "
    "The illustration should consist only of solid black line art on a pure white background. "
    "Use clear, bold, consistent line widths throughout the entire drawing. "
    "Do NOT include color, shading, gray tones, gradients, textures, or filled areas. "
    "The style should be simple, friendly, and therapeutic—similar to a children’s coloring book or art therapy sheet. "
    "Ensure all shapes and figures are well-defined, easy to trace, and comfortably spaced with clear boundaries. "
    "Avoid visual clutter or excessive fine detail. "
    "Leave open white margins around the scene; do not draw a border or frame. "
    "Keep line weight uniform and make all contours fully connected (no broken paths). "
    "Focus on balanced composition and centered subjects suitable for tracing practice."
    "Favor larger shapes and smoother curves rather than small intricate patterns."
    "Output should resemble professional vector line art or SVG coloring book illustrations."
    "Avoid any text, watermarks, or signatures in the image."
    "Do not include any letters or words in the image."
    "Do not use any color—only black and white."
    "For parkinson's patient, keep simple."
    "This must be landscape."
)
        
        current_app.logger.info(f"Original prompt: '{prompt}' → Enhanced: '{enhanced_user_prompt[:50]}...'")
        if user_image_data:
            current_app.logger.info(f"Using multimodal input with uploaded image ({len(user_image_data)} bytes)")
        
        # Use Gemini 2.0 Flash Preview Image Generation (free tier)
        model_name = "gemini-2.0-flash-preview-image-generation"
        
        current_app.logger.info(f"Using model: {model_name}")
        
        # Prepare content for generation
        content_parts = [enhanced_prompt]
        
        # Add user image if provided
        if user_image_data:
            try:
                user_image = Image.open(BytesIO(user_image_data))
                if user_image.format.lower() in ['jpeg', 'jpg']:
                    mime_type = 'image/jpeg'
                elif user_image.format.lower() == 'png':
                    mime_type = 'image/png'
                elif user_image.format.lower() == 'webp':
                    mime_type = 'image/webp'
                else:
                    # Convert to PNG if unknown format
                    png_buffer = BytesIO()
                    user_image.save(png_buffer, format='PNG')
                    user_image_data = png_buffer.getvalue()
                    mime_type = 'image/png'
                
                current_app.logger.info(f"Adding user image: {mime_type}, {user_image.size}")
                
                # Add image as inline data
                content_parts.append(types.Part.from_bytes(
                    data=user_image_data,
                    mime_type=mime_type
                ))
                
            except Exception as e:
                current_app.logger.warning(f"Could not process user image, continuing with text-only: {e}")
        
        # Generate content with IMAGE and TEXT response modalities
        # 4:3 aspect ratio is requested in the prompt text
        response = client.models.generate_content(
            model=model_name,
            contents=content_parts,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"]
            )
        )
        
        current_app.logger.info(f"Response received from {model_name}")
        
        # Extract image from response parts
        generated_image = None
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                current_app.logger.info(f"Response text: {part.text[:100]}")
            elif part.inline_data is not None:
                # Found image data!
                current_app.logger.info("✓ Image data found in response")
                generated_image = Image.open(BytesIO(part.inline_data.data))
                break
        
        if generated_image is None:
            current_app.logger.warning("No image data in response, using mock")
            return get_or_create_mock_image()
        
        current_app.logger.info(f"✓ Successfully generated image: {generated_image.size}")
        
        # Apply multiple sharpen filters to make lines more crisp and clear
        sharpened_image = generated_image.filter(ImageFilter.SHARPEN)
        sharpened_image = sharpened_image.filter(ImageFilter.SHARPEN)
        sharpened_image = sharpened_image.filter(ImageFilter.SHARPEN)
        current_app.logger.info("✓ Applied 3x sharpen filter to image")
        
        # Save to static directory with unique ID
        static_dir = current_app.static_folder or "static"
        os.makedirs(static_dir, exist_ok=True)
        
        # Generate unique ID based on prompt
        image_id = f"img_{hashlib.md5(prompt.encode()).hexdigest()[:8]}"
        
        # Save the sharpened coloring book image
        coloring_filename = f"{image_id}.png"
        coloring_file_path = os.path.join(static_dir, coloring_filename)
        sharpened_image.save(coloring_file_path, format="PNG")
        current_app.logger.info(f"✓ Saved sharpened coloring book image to {coloring_file_path}")
        
        return {
            "id": image_id,
            "imageUrl": f"/static/{coloring_filename}"
        }
        
    except Exception as e:
        # Handle quota exceeded or other API errors gracefully
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            current_app.logger.warning(f"Gemini API quota exceeded, using mock image")
        elif "404" in error_msg or "NOT_FOUND" in error_msg:
            current_app.logger.warning(f"Gemini image model not available, using mock image")
        else:
            current_app.logger.error(f"Error generating image with Gemini: {e}", exc_info=True)
        return get_or_create_mock_image()


def get_or_create_mock_image() -> Dict[str, str]:
    """Return a mock outline image id and URL.

    Ensures a placeholder file exists in static/; fallback when API unavailable.
    """
    static_dir = current_app.static_folder or "static"
    os.makedirs(static_dir, exist_ok=True)

    # File path for mock outline image
    filename = "mock_outline.png"
    file_path = os.path.join(static_dir, filename)

    # If the mock image isn't present, create a simple placeholder PNG
    if not os.path.exists(file_path):
        try:
            from PIL import Image, ImageDraw

            img = Image.new("RGB", (512, 512), color=(255, 255, 255))
            draw = ImageDraw.Draw(img)
            # Simple line art: rectangle + circle + diagonal line
            draw.rectangle([(50, 50), (462, 462)], outline=(0, 0, 0), width=3)
            draw.ellipse([(180, 180), (332, 332)], outline=(0, 0, 0), width=3)
            draw.line([(60, 452), (452, 60)], fill=(0, 0, 0), width=3)
            img.save(file_path, format="PNG")
            current_app.logger.info("Created placeholder mock image at %s", file_path)
        except Exception as e:
            current_app.logger.warning("Could not create mock image: %s", e)

    return {"id": "img_001", "imageUrl": f"/static/{filename}"}
