# Product Transparency Platform

## Objective
This project is a full-stack web application designed to collect detailed information about products through dynamic follow-up questions, store the collected data, and generate comprehensive Product Transparency Reports in PDF format. [cite_start]The platform aims to be clean, intelligent, and user-friendly. [cite: 3, 4]

## Project Structure
The application is organized into distinct services to promote modularity and collaboration:
- [cite_start]`/frontend`: The React + TypeScript application for the user interface. 
- [cite_start]`/backend`: The Node.js (Express) server handling API requests, data storage, and PDF generation. 
- [cite_start]`/ai-service`: A Flask application providing AI capabilities for dynamic question generation. 
- [cite_start]`/design`: Contains UI/UX design assets (Figma files). 

## Tech Stack
- [cite_start]**Frontend**: React + TypeScript [cite: 7]
- [cite_start]**Backend**: Node.js (Express) [cite: 8]
- [cite_start]**Database**: PostgreSQL (managed by Supabase) [cite: 9]
- [cite_start]**AI/ML**: Python (Flask) [cite: 22] [cite_start]with simulated NLP/LLM logic [cite: 18]
- **PDF Generation**: `pdfkit` library

## Features Implemented
- [cite_start]**Multi-step Product Data Collection Form**: An intuitive form with conditional logic to guide users through data input. [cite: 11]
- [cite_start]**Dynamic Follow-Up Questions (AI-powered)**: Uses an AI service to generate relevant follow-up questions based on initial product details. [cite: 20, 41]
- [cite_start]**Product Data Storage**: APIs to securely store all collected product information in a PostgreSQL database (Supabase). [cite: 12]
- **Product Data Review Screen**: A dedicated step in the form to review all entered data before final submission.
- [cite_start]**PDF Report Generation**: A backend module generates detailed Product Transparency Reports in PDF format from the stored data. [cite: 13, 40]
- [cite_start]**Product Listing & Report Download**: A dedicated page to view all submitted products and download their corresponding transparency reports. [cite: 34]
- [cite_start]**Clean and Functional UI**: Designed for an intuitive and trustworthy user experience. [cite: 4, 42]

## Setup Steps

**Prerequisites:**
- Node.js (v18+) and npm (or yarn)
- Python (v3.8+) and pip
- Git
- A Supabase account and project.

**1. Clone the repository:**
```bash
git clone <YOUR_REPO_URL>
cd product-transparency-app]


**2. Supabase Setup:**

-Go to Supabase.com and create a new project.

-In your Supabase project, go to "Table Editor" and create a new table named products.

-Set id as uuid, Primary Key, with gen_random_uuid() as Default Value.

-Add name as text, Not Null.

-Add description as text.

-Add created_at as timestamp with time zone, with now() as Default Value.

-IMPORTANT: Ensure Row Level Security (RLS) is DISABLED for the products table for this project's setup.

-Navigate to "Project Settings" > "API" to find your Project URL and service_role (secret) key.


**3. Backend Setup:**

```bash
cd backend
npm install
# Create a .env file with your Supabase credentials
touch .env

-Add the following to backend/.env, replacing placeholders with your actual Supabase details:


-SUPABASE_URL="https://[YOUR_SUPABASE_PROJECT_REF].supabase.co"
-SUPABASE_SERVICE_KEY="[YOUR_SUPABASE_SERVICE_ROLE_KEY]"

```bash
# Run the backend server
npm run dev

-The backend server will run on http://localhost:5000.

**4. AI Service Setup:**

```bash
cd ../ai-service
python -m venv venv
# On Windows: .\venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate
pip install -r requirements.txt 
# Run the AI service
python app.py

-The AI service will run on http://localhost:5001.

**5. Frontend Setup:**

```bash
cd ../frontend
npm install
# Run the frontend application
npm run dev

-The frontend application will run on http://localhost:5173.

## AI API Documentation
-The AI service exposes the following primary endpoint:

**POST /generate-questions**
Description: Generates a list of dynamic follow-up questions based on the provided product name.

-Request Body:
{
    "product_name": "string"
}
-Response: A JSON array of question objects.
[
    {
        "id": "string",       // Unique identifier for the question
        "text": "string",     // The question text
        "type": "text" | "number" | "boolean", // Expected answer type
        "options"?: ["string"] // Optional: for 'boolean' type (e.g., ["Yes", "No"])
    }
]

-Example: If product_name contains "bottle", it returns questions related to bottle materials, recyclability, etc. If it contains "shirt", it returns questions about fabric, organic certification, etc.


##Sample Product + Generated Report
-To demonstrate:

-1. Go to http://localhost:5173.

-2. Click "Start New Submission".

-3. For "Product Name", enter Eco-Friendly Water Bottle. For "Product Description", enter A reusable water bottle made from recycled materials.

-4. Click "Next".

-5. Answer the dynamic questions generated (e.g., "What material is the bottle made from?", "Is the entire bottle (including cap) recyclable?").

-6. Click "Next" to review the summary.

-7. Click "Submit Product".

-8. You will be redirected to the "All Submitted Products" page. Find "Eco-Friendly Water Bottle" in the list.

-9. Click "Download Report" next to it. A PDF report will be downloaded, containing all the entered information, including answers to the dynamic questions.

