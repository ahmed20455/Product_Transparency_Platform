// frontend/src/App.tsx
import React, { useState } from 'react';
import './App.css';

// Define interfaces for better type safety
interface Question {
  id: string;
  text: string;
  type: 'text' | 'number' | 'boolean';
  options?: string[]; // For boolean type questions
}

interface ProductData {
  name: string;
  description: string;
  [key: string]: any; // Allow for dynamic question answers
}

function App() {
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for landing page
  const [productData, setProductData] = useState<ProductData>({
    name: '',
    description: '',
  });
  const [dynamicQuestions, setDynamicQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [errorFetchingQuestions, setErrorFetchingQuestions] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleDynamicQuestionChange = (id: string, value: any) => {
    setProductData(prevData => ({ ...prevData, [id]: value }));
  };

  const handleNext = async () => {
    // Validation for Step 1
    if (currentStep === 1) {
      if (!productData.name.trim()) {
        alert('Product Name is required!');
        return;
      }
      // Fetch dynamic questions after basic info is provided
      setIsLoadingQuestions(true);
      setErrorFetchingQuestions(null);
      try {
        const response = await fetch('http://localhost:5001/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ product_name: productData.name }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const questions: Question[] = await response.json();
        setDynamicQuestions(questions);
        // Initialize answers for new questions
        const initialDynamicAnswers: { [key: string]: any } = {};
        questions.forEach(q => {
          // Set default values based on type, e.g., empty string for text, false for boolean
          initialDynamicAnswers[q.id] = q.type === 'boolean' ? 'No' : ''; // Default to 'No' for boolean as per Figma options
        });
        setProductData(prevData => ({ ...prevData, ...initialDynamicAnswers }));

        setCurrentStep(prevStep => prevStep + 1); // Move to next step only after questions are fetched
      } catch (error: any) {
        console.error('Error fetching dynamic questions:', error);
        setErrorFetchingQuestions('Failed to load dynamic questions. Please try again.');
      } finally {
        setIsLoadingQuestions(false);
      }
    } else {
      setCurrentStep(prevStep => prevStep + 1);
    }
  };

  const handleSubmit = async () => {
    console.log('Submitting Product Data:', productData);
    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit product');
      }

      const result = await response.json();
      console.log('Product submitted successfully:', result);
      alert('Product submitted successfully!');
      // Reset form
      setProductData({ name: '', description: '' });
      setDynamicQuestions([]);
      setCurrentStep(0); // Go back to landing page
    } catch (error: any) {
      console.error('Error submitting product:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const renderDynamicQuestions = () => {
    if (isLoadingQuestions) {
      return <p>Loading dynamic questions...</p>;
    }
    if (errorFetchingQuestions) {
      return <p style={{ color: 'red' }}>{errorFetchingQuestions}</p>;
    }
    if (dynamicQuestions.length === 0 && currentStep > 1) { // Only show message if past step 1 and no questions
      return <p>No specific follow-up questions for this product. Click Next to proceed.</p>;
    }

    return (
      <>
        {dynamicQuestions.map(q => (
          <div key={q.id} style={{ marginBottom: '1em' }}>
            <label htmlFor={q.id}>{q.text}</label>
            {q.type === 'text' && (
              <input
                type="text"
                id={q.id}
                name={q.id}
                value={productData[q.id] || ''}
                onChange={(e) => handleDynamicQuestionChange(q.id, e.target.value)}
              />
            )}
            {q.type === 'number' && (
              <input
                type="number"
                id={q.id}
                name={q.id}
                value={productData[q.id] || ''}
                onChange={(e) => handleDynamicQuestionChange(q.id, Number(e.target.value))}
              />
            )}
            {q.type === 'boolean' && q.options && (
              <select
                id={q.id}
                name={q.id}
                value={productData[q.id] || 'No'} // Default to 'No' if not set
                onChange={(e) => handleDynamicQuestionChange(q.id, e.target.value)}
              >
                {q.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Landing Page
        return (
          <div>
            <h2>Welcome to the Product Transparency Platform</h2>
            <button onClick={() => setCurrentStep(1)}>Start New Submission</button>
          </div>
        );
      case 1: // Basic Info
        return (
          <div>
            <h2>Add Product - Step 1/3: Basic Info</h2>
            <div>
              <label htmlFor="name">Product Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={productData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="description">Product Description:</label>
              <textarea
                id="description"
                name="description"
                value={productData.description}
                onChange={handleInputChange}
                rows={4}
              ></textarea>
            </div>
            <button onClick={handleNext} disabled={isLoadingQuestions}>
              {isLoadingQuestions ? 'Loading...' : 'Next'}
            </button>
          </div>
        );
      case 2: // Dynamic Questions - Part 1
        return (
          <div>
            <h2>Add Product - Step 2/3: Product Details</h2>
            {renderDynamicQuestions()}
            <button onClick={() => setCurrentStep(prevStep => prevStep - 1)}>Back</button>
            <button onClick={handleNext}>Next</button>
          </div>
        );
      case 3: // Review / Finalize Step
            return (
                <div>
                    <h2>Add Product - Step 3/3: Review & Submit</h2>
                    <p>Please review the collected product information before final submission.</p>
                    <div style={{ textAlign: 'left', border: '1px solid #eee', padding: '1em', borderRadius: '5px', backgroundColor: '#fff', marginBottom: '1em' }}>
                        <h3>Product Summary:</h3>
                        {Object.entries(productData).map(([key, value]) => (
                            <p key={key}>
                                <strong>{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:</strong> {
                                    typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                                    value === '' ? 'Not provided' : String(value)
                                }
                            </p>
                        ))}
                    </div>
                    <button onClick={() => setCurrentStep(prevStep => prevStep - 1)}>Back</button>
                    <button onClick={handleSubmit}>Submit Product</button>
                </div>
            );
      default:
        return (
          <div>
            <h2>Page Not Found</h2>
            <button onClick={() => setCurrentStep(0)}>Go to Home</button>
          </div>
        );
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Product Transparency Platform</h1>
      </header>
      <main>
        {renderStep()}
      </main>
    </div>
  );
}

export default App;