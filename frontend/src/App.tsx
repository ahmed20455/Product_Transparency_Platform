// frontend/src/App.tsx
import React, { useState } from 'react';
import './App.css'; // You can remove this if not using default styling or modify

function App() {
  // We'll manage current step here
  const [currentStep, setCurrentStep] = useState(1);
  // State to hold product data
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    // Add more fields as needed for future steps
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleNext = () => {
    // Basic validation before moving to next step
    if (currentStep === 1 && !productData.name) {
      alert('Product Name is required!');
      return;
    }
    setCurrentStep(prevStep => prevStep + 1);
  };

  const handleSubmit = async () => {
    // This will be for the final step to send data to backend
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
      // Reset form or navigate to a success page
      setProductData({ name: '', description: '' });
      setCurrentStep(1); // Go back to step 1
    } catch (error: any) {
      console.error('Error submitting product:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
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
            <button onClick={handleNext}>Next</button>
          </div>
        );
      case 2:
        return (
          <div>
            <h2>Add Product - Step 2/3: More Details (Placeholder)</h2>
            <p>This is where dynamic questions for materials, components etc., will appear.</p>
            {/* For now, just a placeholder and navigation */}
            <button onClick={() => setCurrentStep(prevStep => prevStep - 1)}>Back</button>
            <button onClick={handleNext}>Next</button>
          </div>
        );
      case 3:
        return (
          <div>
            <h2>Add Product - Step 3/3: Finalize (Placeholder)</h2>
            <p>This is where dynamic questions for sustainability, certifications etc., will appear.</p>
            {/* For now, just a placeholder and navigation */}
            <button onClick={() => setCurrentStep(prevStep => prevStep - 1)}>Back</button>
            <button onClick={handleSubmit}>Submit Product</button>
          </div>
        );
      default:
        return (
          <div>
            <h2>Welcome to the Product Transparency Platform</h2>
            <button onClick={() => setCurrentStep(1)}>Start New Submission</button>
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