import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Alert, Form, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faCamera, faArrowLeft, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../api/axiosInstance";
import CameraCapture from "./CameraCapture";
import MarkdownWithMath from "./MarkdownWithMath";
import "./SolveQuestion.css"; // Reusing existing styles

function WorksheetSubmission() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data from location state
  const { worksheetName, worksheetQuestions = [] } = location.state || {};

  // State management
  const [images, setImages] = useState([]);
  const [imageSourceType, setImageSourceType] = useState("upload");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // Validate required data
  useEffect(() => {
    if (!worksheetName) {
      setError("Worksheet name is missing. Please go back and select a worksheet.");
    }
  }, [worksheetName]);

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file size
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError("Some files exceed the 5MB size limit. Please select smaller images.");
      return;
    }

    setImages(prevImages => [...prevImages, ...files]);
    setError(null);
  };

  // Handle captured image from camera
  const handleCapturedImage = (capturedImageBlob) => {
    const file = new File(
      [capturedImageBlob], 
      `worksheet-${worksheetName}-${Date.now()}.jpg`, 
      { type: 'image/jpeg' }
    );
    setImages(prevImages => [...prevImages, file]);
    setError(null);
  };

  // Handle upload progress
  const handleUploadProgress = (percent) => {
    setUploadProgress(percent);
  };

  // Remove individual image
  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  // Clear all images
  const handleClearAllImages = () => {
    setImages([]);
    setError(null);
  };

  // Submit worksheet
  const handleSubmitWorksheet = async () => {
    if (images.length === 0) {
      setError("Please upload at least one image of your worksheet solutions.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("worksheet_name", worksheetName);
    
    // Append all images
    images.forEach((image) => {
      formData.append("image_response", image);
    });

    try {
      const response = await axiosInstance.uploadFile(
        "/worksheet-submission/",
        formData,
        handleUploadProgress
      );

      setSuccessMessage("Worksheet submitted successfully!");
      
      // Navigate back or to results after a short delay
      setTimeout(() => {
        navigate("/studentdash", {
          state: { worksheetSubmitted: true }
        });
      }, 2000);

    } catch (error) {
      console.error("Submission error:", error);
      if (error.code === "ECONNABORTED") {
        setError("Request timed out. Please try with smaller images or check your connection.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to submit worksheet. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="solve-question-wrapper">
      <Container className="py-4">
        <div className="solve-question-container">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Worksheet: {worksheetName}</h2>
            <Button 
              variant="secondary" 
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {successMessage && (
            <Alert variant="success">
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              {successMessage}
            </Alert>
          )}

          {/* Worksheet Questions Display */}
          {worksheetQuestions && worksheetQuestions.length > 0 && (
            <div className="worksheet-questions mb-4" style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <h4 className="mb-3">Worksheet Questions</h4>
              <div className="questions-preview">
                {worksheetQuestions.map((questionData, index) => (
                  <div key={index} className="question-item mb-3 p-3 border rounded bg-white">
                    <div className="d-flex align-items-start">
                      <div className="question-number me-3" style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </div>
                      <div className="question-details flex-grow-1">
                        {questionData.question && (
                          <div className="question-text mb-2">
                            <MarkdownWithMath content={questionData.question} />
                          </div>
                        )}
                        {questionData.level && (
                          <span className={`badge bg-${
                            questionData.level.toLowerCase() === 'easy' ? 'success' : 
                            questionData.level.toLowerCase() === 'medium' ? 'warning' : 
                            'danger'
                          } text-white`}>
                            {questionData.level}
                          </span>
                        )}
                        {questionData.question_image && (
                          <div className="question-image mt-2">
                            <img
                              src={`data:image/png;base64,${questionData.question_image}`}
                              alt={`Question ${index + 1}`}
                              style={{ 
                                maxWidth: '100%', 
                                height: 'auto',
                                borderRadius: '4px',
                                border: '1px solid #dee2e6' 
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload Section */}
          <div className="upload-section">
            <h4>Upload Your Solutions</h4>
            
            {/* Image Source Selection */}
            <div className="image-source-buttons mb-3">
              <Button
                variant={imageSourceType === "upload" ? "primary" : "outline-primary"}
                className="me-2"
                onClick={() => setImageSourceType("upload")}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon={faUpload} className="me-2" />
                Upload Images
              </Button>
              <Button
                variant={imageSourceType === "camera" ? "primary" : "outline-primary"}
                onClick={() => setImageSourceType("camera")}
                disabled={isSubmitting}
              >
                <FontAwesomeIcon icon={faCamera} className="me-2" />
                Take Photo
              </Button>
            </div>

            {/* Conditional Upload/Camera Interface */}
            {imageSourceType === "upload" ? (
              <Form.Group>
                <Form.Control
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
                <Form.Text className="text-muted">
                  You can select multiple images. Maximum 5MB per image.
                </Form.Text>
              </Form.Group>
            ) : (
              <div className="camera-capture-container p-3 border rounded">
                <CameraCapture
                  onImageCapture={handleCapturedImage}
                  videoConstraints={{ 
                    facingMode: { ideal: "environment" },
                    width: { ideal: 4096 },
                    height: { ideal: 3072 },
                    focusMode: { ideal: "continuous" },
                    exposureMode: { ideal: "continuous" }
                  }}
                />
                <p className="text-muted mt-2 text-center">
                  Click "Capture" to take photos of your worksheet solutions
                </p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="upload-progress mt-3">
              <div className="progress">
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: `${uploadProgress}%` }}
                  aria-valuenow={uploadProgress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {uploadProgress}%
                </div>
              </div>
              <p className="text-center mt-1">
                Uploading... Please don't close this page.
              </p>
            </div>
          )}

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="uploaded-images mt-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5>Solution Images ({images.length})</h5>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleClearAllImages}
                  disabled={isSubmitting}
                >
                  Clear All
                </Button>
              </div>
              <div className="image-previews-grid">
                {images.map((image, index) => (
                  <div key={index} className="image-preview-container position-relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Solution ${index + 1}`}
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isSubmitting}
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-4 d-flex justify-content-center">
            <Button
              variant="success"
              size="lg"
              onClick={handleSubmitWorksheet}
              disabled={images.length === 0 || isSubmitting}
              className="px-5"
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Submit Worksheet
                </>
              )}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default WorksheetSubmission;