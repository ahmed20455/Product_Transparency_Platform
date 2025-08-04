# Product Transparency Platform

## [Watch the demo](https://www.youtube.com/watch?v=DiZjf0zBhok)
- Video Link - https://www.youtube.com/watch?v=DiZjf0zBhok

## Objective
- This project is a full-stack web application designed to collect detailed information about products through dynamic follow-up questions, store the collected data in a normalized database, and generate comprehensive Product Transparency Reports in PDF format. The platform aims to be clean, intelligent, and user-friendly.

## Project Structure
- The application is organized into distinct services to promote modularity and collaboration:

- /frontend: The React + TypeScript application for the user interface.

- /backend: The Node.js (Express) server handling API requests, data storage, and PDF generation.

- /ai-service: A Flask application providing AI capabilities for dynamic question generation via an LLM.

- /design: Contains UI/UX design assets (Figma files).

## Tech Stack
- Frontend: React + TypeScript

- Backend: Node.js (Express)

- Database: PostgreSQL (managed by Supabase)

- AI/ML: Python (Flask) with the Gemini API for LLM-based logic

- PDF Generation: pdfkit library

## Features Implemented
- Multi-step Product Data Collection Form: An intuitive form with conditional logic to guide users through data input.

- Dynamic Follow-Up Questions (LLM-powered): Uses the Gemini API to generate relevant and specific follow-up questions based on initial product details.

- Normalized Product Data Storage: The application correctly uses a three-table schema (products, questions, answers) with foreign key relations to store all collected information, fulfilling a key requirement of the assignment.

- Product Data Review Screen: A dedicated step in the form to review all entered data before final submission.

- PDF Report Generation: A backend module generates detailed Product Transparency Reports in PDF format from the structured data.

- Product Listing & Report Download: A dedicated page to view all submitted products and download their corresponding transparency reports.

- Clean and Functional UI: Designed for an intuitive and trustworthy user experience.

## Setup Steps
### Prerequisites:

- Node.js (v18+) and npm (or yarn)

- Python (v3.8+) and pip

- Git

- A Supabase account and project.

1. **Clone the repository**:
 ```bash
git clone https://github.com/ahmed20455/Product_Transparency_Platform
cd product-transparency-app
```
2. **Supabase Setup**:

- Go to Supabase.com and create a new project.

- In your Supabase project, go to "Table Editor" and create the following tables:

- **products**:

1. id (uuid, Primary Key, Default: gen_random_uuid())

2. name (text, Not Null)

3. description (text)



- **questions**:

1. id (text, Primary Key)

2. text (text, Not Null)

3. type (text, Not Null)

4. options (text[], Nullable)

- **answers**:

1. id (uuid, Primary Key, Default: gen_random_uuid())

2. product_id (uuid, Not Null)

3. question_id (text, Not Null)

4. value (text)

- Add Foreign Key Relations on the answers table:

- product_id references products.id.

- question_id references questions.id.

- **IMPORTANT: Ensure Row Level Security (RLS) is DISABLED for all three tables for this project's setup.**

- Navigate to "Project Settings" > "API" to find your Project URL and service_role (secret) key.

3. **Backend Setup**:
```
cd backend
npm install
# Create a .env file with your Supabase credentials
touch .env

Add the following to backend/.env, replacing placeholders with your actual Supabase details:

SUPABASE_URL="https://[YOUR_SUPABASE_PROJECT_REF].supabase.co"
SUPABASE_SERVICE_KEY="[YOUR_SUPABASE_SERVICE_ROLE_KEY]"

# Run the backend server
npm run dev

The backend server will run on http://localhost:5000.
```

4. **AI Service Setup**:
```
cd ../ai-service
python -m venv venv
# On Windows: .\venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate
pip install Flask Flask-Cors requests
# Run the AI service
python app.py
```
- The AI service will run on http://localhost:5001.

5. **Frontend Setup**:
```
cd ../frontend
npm install
# Run the frontend application
npm run dev
```
- The frontend application will run on http://localhost:5173.

**AI API Documentation**
- The AI service exposes the following primary endpoint:

- **POST /generate-questions**
- Description: Generates a list of dynamic follow-up questions using the Gemini API based on the provided product name and description.

Request Body:

{
    "product_name": "string",
    "description": "string"
}

- Response: A JSON array of question objects.
```
[
    {
        "id": "string",       // Unique identifier for the question
        "text": "string",     // The question text
        "type": "text" | "number" | "boolean", // Expected answer type
        "options"?: ["string"] // Optional: for 'boolean' type (e.g., ["Yes", "No"])
    }
]
```
- Example: Providing "Eco-Friendly Water Bottle" and "A reusable bottle made from bamboo and recycled plastic" will generate specific questions about those materials and sustainability efforts.

**Sample Product + Generated Report**

- [Sample Report](https://github.com/ahmed20455/Product_Transparency_Platform/blob/main/Screenshot%20(467).png)

- To demonstrate:

- Go to http://localhost:5173.

- Click "Start New Submission".

- For "Product Name", enter Eco-Friendly Water Bottle. For "Product Description", enter A reusable water bottle made from recycled materials.

- Click "Next".

- Answer the dynamic questions generated (e.g., "What material is the bottle made from?", "Is the entire bottle (including cap) recyclable?").

- Click "Next" to review the summary.

- Click "Submit Product".

- You will be redirected to the "All Submitted Products" page. Find "Eco-Friendly Water Bottle" in the list.

- Click "Download Report" next to it. A PDF report will be downloaded, containing all the entered information, including answers to the dynamic questions.
