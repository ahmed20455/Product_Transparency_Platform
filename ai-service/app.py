# ai-service/app.py
from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def hello_ai():
    return "Hello from the AI service!"

@app.route('/generate-questions', methods=['GET'])
def generate_questions():
    # This is a placeholder for now.
    # Later, this will contain our NLP/LLM logic.
    dummy_questions = [
        {"id": "q1", "text": "What are the main materials used in this product?", "type": "text"},
        {"id": "q2", "text": "Is this product recyclable?", "type": "boolean"},
        {"id": "q3", "text": "Where was this product manufactured?", "type": "text"}
    ]
    return jsonify(dummy_questions)

if __name__ == '__main__':
    app.run(debug=True, port=5001) # AI service will run on port 5001