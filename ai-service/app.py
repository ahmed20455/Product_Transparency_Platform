# ai-service/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import requests
import os

app = Flask(__name__)
CORS(app)

API_KEY = "AIzaSyC-LzB_w3xQY2niO245xLX9e63UiSEM3as"
MODEL_ID = "gemini-2.5-flash"

def get_llm_questions(product_name, description):
    prompt_text = f"""
    You are an expert on product transparency and sustainability. A user is submitting a new product.
    Your task is to generate a list of 5-7 detailed, relevant, and specific follow-up questions
    that a company would need to answer to create a comprehensive transparency report.

    The user's product name is: '{product_name}'
    The user's product description is: '{description}'

    Generate questions covering topics like:
    - Materials and components
    - Manufacturing processes and location
    - Supply chain
    - Sustainability and environmental impact
    - Certifications

    The questions should be suitable for a multi-step form. Return the output as a JSON object
    containing a single key "questions" which is an array of question objects.
    Each question object must have the following keys:
    - "id": a unique snake_case string identifier (e.g., "q_main_materials")
    - "text": the full question text (e.g., "What are the primary materials used in this product?")
    - "type": the expected answer type, which must be one of "text", "number", or "boolean".
    - "options": an optional array of strings, only included for "boolean" types (e.g., ["Yes", "No"]).

    Example of the expected JSON format:
    {{
      "questions": [
        {{
          "id": "q_main_materials",
          "text": "What are the primary materials used?",
          "type": "text"
        }},
        {{
          "id": "q_recycled_content",
          "text": "What percentage of the material is recycled?",
          "type": "number"
        }},
        {{
          "id": "q_fair_trade_certified",
          "text": "Is this product Fair Trade certified?",
          "type": "boolean",
          "options": ["Yes", "No"]
        }}
      ]
    }}
    """
    
    headers = {
        'Content-Type': 'application/json',
    }
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt_text}
                ]
            }
        ]
    }
    
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_ID}:generateContent?key={API_KEY}"
    
    try:
        response = requests.post(api_url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        response_json = response.json()

        if response_json.get('candidates') and len(response_json['candidates']) > 0:
            content_part = response_json['candidates'][0]['content']['parts'][0]['text']
            cleaned_json_string = content_part.strip().lstrip('`').lstrip('json').rstrip('`')
            
            try:
                llm_response_data = json.loads(cleaned_json_string)
                if "questions" in llm_response_data:
                    return llm_response_data["questions"]
                else:
                    return []
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON from LLM response: {e}")
                print(f"LLM raw response: {cleaned_json_string}")
                return []
        else:
            print("LLM response did not contain a valid 'candidates' section.")
            return []
    except requests.exceptions.RequestException as e:
        print(f"Error during API call to Gemini: {e}")
        return []


@app.route('/')
def hello_ai():
    return "Hello from the AI service!"

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    data = request.json
    product_name = data.get('product_name', '')
    description = data.get('description', '')

    if not product_name or not description:
        return jsonify({"error": "Product name and description are required."}), 400

    questions = get_llm_questions(product_name, description)
    if not questions:
        questions = [
            {"id": "q_main_materials", "text": "What are the main materials used?", "type": "text"},
            {"id": "q_origin", "text": "What is the country of origin for the main components?", "type": "text"},
            {"id": "q_disposal", "text": "How should this product be disposed of at end-of-life?", "type": "text"},
        ]
        
    return jsonify(questions)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
