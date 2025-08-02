# ai-service/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS # Import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for all origins and routes

@app.route('/')
def hello_ai():
    return "Hello from the AI service!"

@app.route('/generate-questions', methods=['POST']) # Change to POST as we'll send data
def generate_questions():
    data = request.json
    product_name = data.get('product_name', '').lower() # Get product_name from request body

    # Simple conditional logic to simulate dynamic questions
    if "bottle" in product_name or "container" in product_name:
        questions = [
            {"id": "q_mat_bottle", "text": "What material is the bottle made from?", "type": "text"},
            {"id": "q_cap_bottle", "text": "What material is the cap made from?", "type": "text"},
            {"id": "q_recycled_content", "text": "What percentage of the material is recycled content?", "type": "number"},
            {"id": "q_recyclable_bottle", "text": "Is the entire bottle (including cap) recyclable?", "type": "boolean", "options": ["Yes", "No"]},
        ]
    elif "shirt" in product_name or "apparel" in product_name or "clothing" in product_name:
        questions = [
            {"id": "q_fabric_type", "text": "What is the primary fabric type?", "type": "text"},
            {"id": "q_org_cert", "text": "Is the fabric organically certified (e.g., GOTS)?", "type": "boolean", "options": ["Yes", "No"]},
            {"id": "q_dye_process", "text": "Describe the dyeing process used.", "type": "text"},
            {"id": "q_manufacturing_loc", "text": "Where was this product manufactured (country)?", "type": "text"},
        ]
    else:
        questions = [
            {"id": "q_main_materials", "text": "What are the main materials used?", "type": "text"},
            {"id": "q_origin", "text": "What is the country of origin for the main components?", "type": "text"},
            {"id": "q_disposal", "text": "How should this product be disposed of at end-of-life?", "type": "text"},
        ]

    return jsonify(questions)

if __name__ == '__main__':
    app.run(debug=True, port=5001)