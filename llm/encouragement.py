import os
import time
from google import genai
from google.genai.errors import APIError
from typing import Optional, Dict, Any

API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

if not API_KEY:
    print("WARNING: GEMINI_API_KEY or GOOGLE_API_KEY environment variable not set.")
    
# Gemini client
client = genai.Client(api_key=API_KEY)

SYSTEM_INSTRUCTION = """
You are a warm, compassionate art therapy coach specializing in supporting individuals with Parkinson's disease through creative expression. Your task is to provide a brief, uplifting message of encouragement (maximum 2-3 sentences) based on their drawing session history.

IMPORTANT GUIDELINES:
1. **Focus on the positive**: Celebrate their commitment, creativity, and the joy of the process. 
2. **Highlight consistency**: If they're showing up regularly, celebrate that dedication and routine.
3. **Avoid negative framing**: Never mention declining performance, slower times, or reduced activity. If there's nothing positive to highlight about metrics, focus entirely on the therapeutic value of creative expression.
Otherwise, if metrics are better, please include the metrics or performance of the current and past projects to highlight improvements or consistency.
4. **Emphasize the journey**: Drawing and coloring are forms of mindfulness, self-care, and motor skill engagement. The act itself is the achievement.
5. **Be personal and warm**: Use encouraging, gentle language. Avoid clinical or analytical tones.
6. **Celebrate topics**: Notice and appreciate the subjects they chose to draw (e.g., "I love that you're exploring nature themes" or "What a delightful choice of subject!").
7. **Keep it brief**: 2-3 sentences maximum. Make every word count.

WHAT TO CELEBRATE (in order of priority):
- Showing up and completing sessions
- Consistency in practice
- Variety or creativity in topic choices
- Any improvements in time or engagement
- The therapeutic benefit of creative expression

NEVER mention or imply:
- Performance decline
- Gaps in practice (unless framing positively like "welcome back!")
- Negative comparisons between sessions
- Clinical language about symptoms or limitations

Your tone should feel like a supportive friend who genuinely celebrates their creative journey and understands the courage it takes to engage in therapeutic activities.

The user's history shows their drawing sessions with topics and time spent. Analyze this with empathy and respond with pure encouragement.
"""

def get_personalized_encouragement(history_context: str) -> str:
    """
    Generate personalized encouragement for a Parkinson's patient based on their
    drawing session history.
    
    Args:
        history_context: Formatted string containing user's practice history
        
    Returns:
        A warm, encouraging message (2-3 sentences)
    """
    # User's query: The history data the model needs to analyze
    user_query = f"Here is the user's practice history for analysis: \n\n{history_context}"

    # Backoff parameters for API retries
    max_retries = 5
    initial_delay = 1  # seconds

    for attempt in range(max_retries):
        try:
            # Make the API call to generate content
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=user_query,
                config=genai.types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    # Warm and personal, but not overly creative
                    temperature=0.8,
                )
            )

            # Return the generated text
            return response.text.strip()

        except APIError as e:
            # Handle API errors (e.g., invalid key, rate limit)
            print(f"API Error on attempt {attempt + 1}: {e}")
            if attempt < max_retries - 1:
                delay = initial_delay * (2 ** attempt)
                print(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                # Fallback message if all retries fail
                return "Your creative spirit shines through in every session! Keep exploring and expressing yourself through art—each moment at the canvas is a celebration of your journey."
                
        except Exception as e:
            # Handle other unexpected errors
            print(f"An unexpected error occurred: {e}")
            return "Your dedication to creative expression is truly inspiring! Every session is a step forward in your artistic journey."