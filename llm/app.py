from flask import Flask, request, jsonify
from flask_cors import CORS
from encouragement import get_personalized_encouragement

app = Flask(__name__)
CORS(app) 

@app.route('/api/encourage', methods=['POST'])
def generate_encouragement():
    try:
        data = request.get_json()
        
        if not data or 'history_context' not in data:
            return jsonify({
                "error": "Missing 'history_context' in request body."
            }), 400
        
        history_context = data['history_context']
        print(f"Server received history context (first 50 chars): {history_context[:50]}...")
        
        encouragement_message = get_personalized_encouragement(history_context)
        
        print("Successfully generated and sending encouragement back.")
        return jsonify({
            "success": True,
            "message": encouragement_message
        })
    except Exception as e:
        print(f"Fatal error during API call: {e}")
        return jsonify({
            "error": "Internal server error. Check server logs."
        }), 500

if __name__ == '__main__':
    # UPDATED: Changed port to 5001 and host to 0.0.0.0 for Docker
    print("\nStarting Flask LLM API server on http://0.0.0.0:5001/")
    print("Ensure 'encouragement.py' is in the same directory.")
    app.run(debug=False, host='0.0.0.0', port=5001)
