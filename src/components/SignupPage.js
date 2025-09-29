import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './Signup.css'; 


function SignupPage() {
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!schoolName || !schoolCode || !file) {
      setError('Please fill out all fields and upload a file.');
      return;
    }

    // You would typically send the data to your backend API here
    // e.g., axios.post('/api/signup', formData)
    
    // Simulate a successful signup
    setSuccess('Signup successful! Redirecting to login...');
    
    setTimeout(() => {
      navigate('/');
    }, 2000); // Redirect after 2 seconds
  };
  const handleLoginClick = () => {
    navigate('/');
  };
  return (
    <div className="signup-wrapper">
      <div className="signup-form-container">
        <h2 className="signup-title">Signup</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formSchoolName">
            <Form.Label>School Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter school name"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formSchoolCode">
            <Form.Label>School Code</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter school code"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formFileUpload">
            <Form.Label>Upload File (Excel, PDF, or CSV)</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".csv, .xlsx, .xls, .pdf"
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Signup
          </Button>
        </Form>
        <div className="mt-3 text-center">
          <Button variant="link" onClick={handleLoginClick}>
           Login ?
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
