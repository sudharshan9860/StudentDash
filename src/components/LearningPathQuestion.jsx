// LearningPathQuestion.jsx - Component for solving learning path questions
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, Button, Spinner, Alert, Row, Col, Badge, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faArrowLeft,
  faArrowRight,
  faBookOpen,
  faLightbulb,
  faCheck,
  faClock,
  faRoad,
  faChevronLeft,
  faChevronRight,
  faHome,
  faCaretDown,
  faBookOpenReader,
  faStar,
  faUpload,
  faImage,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import axiosInstance from "../api/axiosInstance";
import MarkdownWithMath from "./MarkdownWithMath";
import CameraCapture from "./CameraCapture";
import { useTimer } from "../contexts/TimerContext";
import StudyTimer from "./StudyTimer";
import { getImageSrc } from "../utils/imageUtils";
import "./LearningPathQuestion.css";

function LearningPathQuestion() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data from location state
  const {
    question,
    questionId,
    questionImage,
    questionLevel,
    topic,
    dayNumber,
    dayTopic,
    planId,
    examId,
    class_id,
    subject_id,
    topic_ids,
    totalQuestionsInDay,
    currentQuestionIndex,
    allDayQuestions,
    learningPathData,
    learningPathForm,
    completedQuestions: initialCompletedQuestions,
    activeDayIndex,
    nextDayData,
  } = location.state || {};

  // Timer context
  const { startTimer, stopTimer } = useTimer();

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // State
  const [images, setImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [processingButton, setProcessingButton] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [imageSourceType, setImageSourceType] = useState("file");
  const [currentIndex, setCurrentIndex] = useState(currentQuestionIndex || 0);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: question,
    questionId: questionId,
    image: questionImage,
    level: questionLevel,
    topic: topic,
  });
  const [completedQuestions, setCompletedQuestions] = useState(initialCompletedQuestions || {});

  // Ref to prevent duplicate navigation and timer operations
  const prevLocationStateRef = useRef(null);
  const timerStartedRef = useRef(false);
  const currentQuestionIdRef = useRef(null);

  // Cleanup function for image URLs
  const revokeImageUrls = useCallback((urls) => {
    urls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.debug("URL already revoked:", url);
      }
    });
  }, []);

  // Apply dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const darkModeEnabled = localStorage.getItem("darkMode") === "true";
      setIsDarkMode(darkModeEnabled);
      document.body.classList.toggle("dark-mode", darkModeEnabled);
    };

    checkDarkMode();
    window.addEventListener("storage", checkDarkMode);

    return () => {
      window.removeEventListener("storage", checkDarkMode);
    };
  }, []);

  // Start timer only on mount and when question actually changes
  useEffect(() => {
    const newQuestionId = currentQuestion.questionId;

    // Only start timer if question ID exists
    if (newQuestionId) {
      // Check if it's a new question
      if (newQuestionId !== currentQuestionIdRef.current) {
        currentQuestionIdRef.current = newQuestionId;
      }
      // Always start the timer when this effect runs
      startTimer(`lp-${newQuestionId}`);
      timerStartedRef.current = true;
    }

    // Cleanup only on unmount
    return () => {
      if (timerStartedRef.current) {
        stopTimer();
        timerStartedRef.current = false;
      }
    };
  }, [currentQuestion.questionId, startTimer, stopTimer]);

  // Handle question navigation
  const navigateToQuestion = useCallback(
    (index) => {
      if (!allDayQuestions || index < 0 || index >= allDayQuestions.length) return;

      const newQuestion = allDayQuestions[index];

      // Reset states - use functional update to get current preview URLs
      setImagePreviewUrls((prevUrls) => {
        prevUrls.forEach((url) => {
          try {
            URL.revokeObjectURL(url);
          } catch (e) {
            // Ignore
          }
        });
        return [];
      });
      setImages([]);
      setError(null);
      setUploadProgress(0);
      setProcessingButton(null);

      // Update current question
      setCurrentIndex(index);
      setCurrentQuestion({
        question: newQuestion.question || newQuestion.question_text || "",
        questionId: newQuestion.question_id,
        image: newQuestion.question_image || "",
        level: newQuestion.question_level || "medium",
        topic: newQuestion.topic || dayTopic,
      });

      // Update ref and restart timer
      const qId =  newQuestion.question_id;
      currentQuestionIdRef.current = qId;
      stopTimer();
      startTimer(`lp-${qId}`);
    },
    [allDayQuestions, dayTopic, startTimer, stopTimer]
  );

  // Handle image upload
  const handleImageChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);

    if (oversizedFiles.length > 0) {
      setError("Some files exceed the 5MB size limit. Please select smaller images.");
      return;
    }

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...files]);
    setImagePreviewUrls((prevUrls) => [...prevUrls, ...newPreviewUrls]);
    setError(null);
  }, []);

  // Handle captured image from camera
  const handleCapturedImage = useCallback((capturedImageBlob) => {
    const file = new File([capturedImageBlob], `captured-solution-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    const previewUrl = URL.createObjectURL(file);

    setImages((prevImages) => [...prevImages, file]);
    setImagePreviewUrls((prevUrls) => [...prevUrls, previewUrl]);
    setError(null);
  }, []);

  // Handle upload progress
  const handleUploadProgress = (percent) => {
    setUploadProgress(percent);
  };

  // Cancel image upload
  const handleCancelImage = useCallback((index) => {
    setImagePreviewUrls((prevUrls) => {
      if (prevUrls[index]) {
        try {
          URL.revokeObjectURL(prevUrls[index]);
        } catch (e) {
          // Ignore
        }
      }
      return prevUrls.filter((_, i) => i !== index);
    });

    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  }, []);

  // Get difficulty color
  const getDifficultyColor = (level) => {
    const normalizedLevel = level?.toLowerCase() || "";
    if (normalizedLevel === "easy") return "success";
    if (normalizedLevel === "medium") return "warning";
    if (normalizedLevel === "hard") return "danger";
    return "secondary";
  };

  // Is question completed
  const isQuestionCompleted = (questionId) => {
    const key = `${activeDayIndex}-${questionId}`;
    return completedQuestions[key] === true;
  };

  // Handle Explain (Concepts) button
  const handleExplain = async () => {
    setProcessingButton("explain");
    setError(null);

    const timeSpentMs = stopTimer();
    const timeSpentMinutes = Math.floor(timeSpentMs / 60000);
    const timeSpentSeconds = Math.floor((timeSpentMs % 60000) / 1000);

    const formData = new FormData();
    formData.append("plan_id", planId);
    formData.append("day_number", dayNumber);
    formData.append("question_id", currentQuestion.questionId);
    formData.append("answer_type", "explain");

    try {
      const response = await axiosInstance.post("/learning-path-submit-answer/", formData);

      // Navigate to result page
      navigate("/learning-path-result", {
        state: {
          ...response.data,
          actionType: "explain",
          question: currentQuestion.question,
          questionImage: currentQuestion.image,
          questionId: currentQuestion.questionId,
          dayNumber,
          dayTopic,
          planId,
          examId,
          class_id,
          subject_id,
          topic_ids,
          currentQuestionIndex: currentIndex,
          allDayQuestions,
          learningPathData,
          learningPathForm,
          completedQuestions,
          activeDayIndex,
          totalQuestionsInDay,
          nextDayData,
        },
      });
    } catch (error) {
      console.error("API Error:", error);
      setError(error.response?.data?.error || error.message || "Failed to get concepts. Please try again.");
      setProcessingButton(null);
      startTimer(`lp-${currentQuestion.questionId}`);
    }
  };

  // Handle Solve (AI Solution) button
  const handleSolve = async () => {
    setProcessingButton("solve");
    setError(null);

    const timeSpentMs = stopTimer();
    const timeSpentMinutes = Math.floor(timeSpentMs / 60000);
    const timeSpentSeconds = Math.floor((timeSpentMs % 60000) / 1000);

    const formData = new FormData();
    formData.append("plan_id", planId);
    formData.append("day_number", dayNumber);
    formData.append("question_id", currentQuestion.questionId);
    formData.append("answer_type", "solve");

    try {
      const response = await axiosInstance.post("/learning-path-submit-answer/", formData);

      navigate("/learning-path-result", {
        state: {
          ...response.data,
          actionType: "solve",
          question: currentQuestion.question,
          questionImage: currentQuestion.image,
          questionId: currentQuestion.questionId,
          dayNumber,
          dayTopic,
          planId,
          examId,
          class_id,
          subject_id,
          topic_ids,
          currentQuestionIndex: currentIndex,
          allDayQuestions,
          learningPathData,
          learningPathForm,
          completedQuestions,
          activeDayIndex,
          totalQuestionsInDay,
          nextDayData,
        },
      });
    } catch (error) {
      console.error("API Error:", error);
      setError(error.response?.data?.error || error.message || "Failed to get solution. Please try again.");
      setProcessingButton(null);
      startTimer(`lp-${currentQuestion.questionId}`);
    }
  };

  // Handle Correct (AI Correct) button
  const handleCorrect = async () => {
    if (images.length === 0) {
      setError("Please capture or upload your solution image first.");
      return;
    }

    setProcessingButton("correct");
    setError(null);

    const timeSpentMs = stopTimer();
    const timeSpentMinutes = Math.floor(timeSpentMs / 60000);
    const timeSpentSeconds = Math.floor((timeSpentMs % 60000) / 1000);

    const formData = new FormData();
    formData.append("plan_id", planId);
    formData.append("day_number", dayNumber);
    formData.append("question_id", currentQuestion.questionId);
    formData.append("answer_type", "correct");
    formData.append("study_time_minutes", timeSpentMinutes);
    formData.append("study_time_seconds", timeSpentSeconds);

    // Add images
    images.forEach((image) => {
      formData.append("ans_img", image);
    });

    try {
      setUploadProgress(0);
      const response = await axiosInstance.uploadFile(
        "/learning-path-submit-answer/",
        formData,
        handleUploadProgress
      );

      // Mark question as completed
      const key = `${activeDayIndex}-${currentQuestion.questionId}`;
      const updatedCompletedQuestions = {
        ...completedQuestions,
        [key]: true,
      };
      setCompletedQuestions(updatedCompletedQuestions);

      // Update localStorage
      if (planId) {
        localStorage.setItem(`lp_completed_${planId}`, JSON.stringify(updatedCompletedQuestions));
        const currentPoints = parseInt(localStorage.getItem(`lp_points_${planId}`) || "0", 10);
        localStorage.setItem(`lp_points_${planId}`, (currentPoints + (response.data.points || 0)).toString());
      }

      navigate("/learning-path-result", {
        state: {
          ...response.data,
          actionType: "correct",
          question: currentQuestion.question,
          questionImage: currentQuestion.image,
          questionId: currentQuestion.questionId,
          dayNumber,
          dayTopic,
          planId,
          examId,
          class_id,
          subject_id,
          topic_ids,
          currentQuestionIndex: currentIndex,
          allDayQuestions,
          learningPathData,
          learningPathForm,
          completedQuestions: updatedCompletedQuestions,
          activeDayIndex,
          totalQuestionsInDay,
          studentImages: images.map((img) => URL.createObjectURL(img)),
          nextDayData,
        },
      });
    } catch (error) {
      console.error("API Error:", error);
      if (error.code === "ECONNABORTED") {
        setError("Request timed out. Please try with a smaller image or check your connection.");
      } else {
        setError(error.response?.data?.error || error.message || "Failed to correct the solution. Please try again.");
      }
      setProcessingButton(null);
      setUploadProgress(0);
      startTimer(`lp-${currentQuestion.questionId}`);
    }
  };

  // Handle back to learning path session
  const handleBackToSession = () => {
    navigate("/learning-path-session", {
      state: {
        learningPathData,
        planId,
        examId,
        class_id,
        subject_id,
        topic_ids,
        learningPathForm,
        nextDayData,
      },
    });
  };

  // Determine if any button is processing
  const isAnyButtonProcessing = () => processingButton !== null;

  // Determine if a specific button is processing
  const isButtonProcessing = (buttonType) => processingButton === buttonType;

  // Cleanup on unmount - use ref to avoid stale closure
  const imagePreviewUrlsRef = useRef(imagePreviewUrls);
  imagePreviewUrlsRef.current = imagePreviewUrls;

  useEffect(() => {
    return () => {
      // Revoke all image URLs on unmount
      imagePreviewUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignore
        }
      });
    };
  }, []);

  // if (!question || !questionId) {
  //   return (
  //     <div className={`lp-question-wrapper ${isDarkMode ? "dark-mode" : ""}`}>
  //       <div className="loading-container">
  //         <Spinner animation="border" />
  //         <p>Loading question...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={`lp-question-wrapper ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="lp-question-container">
        {/* Header */}
        <div className="lp-question-header">
          <div className="header-top">
            <Button variant="outline-secondary" onClick={handleBackToSession} className="back-btn">
              <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
              Back to Day {dayNumber}
            </Button>

            <div className="day-info">
              <Badge className="day-badge">
                <FontAwesomeIcon icon={faRoad} className="me-1" />
                Day {dayNumber}: {dayTopic}
              </Badge>
            </div>

            <StudyTimer className={processingButton ? "stopped" : ""} />
          </div>

          {/* Question Navigation */}
          <div className="question-nav">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigateToQuestion(currentIndex - 1)}
              disabled={currentIndex === 0 || isAnyButtonProcessing()}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </Button>

            <div className="question-pills">
              {allDayQuestions.map((q, idx) => {
                const isCompleted = isQuestionCompleted(q.question_id);
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.question_id}
                    className={`question-pill ${isCurrent ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                    onClick={() => navigateToQuestion(idx)}
                    disabled={isAnyButtonProcessing()}
                  >
                    {isCompleted ? <FontAwesomeIcon icon={faCheck} /> : idx + 1}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigateToQuestion(currentIndex + 1)}
              disabled={currentIndex === allDayQuestions.length - 1 || isAnyButtonProcessing()}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </Button>
          </div>
        </div>

        {/* Question Display */}
        <div className="question-text-container">
          <div className="question-header-info">
            <span className="question-title">Question {currentIndex + 1}</span>
            <div className="question-badges">
              <Badge bg={getDifficultyColor(currentQuestion.level)} className="difficulty-badge">
                {currentQuestion.level || "Medium"}
              </Badge>
              {currentQuestion.topic && (
                <Badge bg="secondary" className="topic-badge">
                  {currentQuestion.topic}
                </Badge>
              )}
              {isQuestionCompleted(currentQuestion.questionId) && (
                <Badge bg="success" className="completed-badge">
                  <FontAwesomeIcon icon={faCheck} className="me-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>

          {currentQuestion.image && (
            <img
              src={getImageSrc(currentQuestion.image)}
              alt="Question"
              className="question-image"
            />
          )}

          <div className="question-text">
            <MarkdownWithMath content={currentQuestion.question} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="danger" className="my-3" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        {/* Image Upload Section */}
        <div className="image-upload-section">
          <Card className="upload-card">
            <Card.Body>
              <h6 className="upload-title">
                <FontAwesomeIcon icon={faImage} className="me-2" />
                Upload Your Solution
              </h6>
              <p className="upload-description text-muted">
                Upload images of your handwritten solution to get AI feedback. You can upload multiple images.
              </p>

              <div className="upload-methods">
                {/* File Upload */}
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={isAnyButtonProcessing()}
                    className="file-input-hidden"
                  />
                  <label htmlFor="image-upload" className={`file-upload-label ${isAnyButtonProcessing() ? 'disabled' : ''}`}>
                    <FontAwesomeIcon icon={faUpload} className="upload-icon" />
                    <span>Choose Files</span>
                    <small>or drag and drop</small>
                  </label>
                </div>

                {/* Camera Capture Option */}
                <div className="camera-option">
                  <Button
                    variant={imageSourceType === "camera" ? "primary" : "outline-primary"}
                    onClick={() => setImageSourceType(imageSourceType === "camera" ? "file" : "camera")}
                    disabled={isAnyButtonProcessing()}
                    className="camera-toggle-btn"
                  >
                    <FontAwesomeIcon icon={faCamera} className="me-2" />
                    {imageSourceType === "camera" ? "Hide Camera" : "Use Camera"}
                  </Button>
                </div>
              </div>

              {/* Camera Capture */}
              {imageSourceType === "camera" && (
                <div className="camera-container mt-3">
                  <CameraCapture
                    onImageCapture={handleCapturedImage}
                    videoConstraints={{
                      facingMode: { ideal: "environment" },
                      width: { ideal: 4096 },
                      height: { ideal: 3072 },
                      focusMode: { ideal: "continuous" },
                      exposureMode: { ideal: "continuous" },
                    }}
                  />
                  <p className="text-muted mt-2 text-center">
                    Click "Capture" to take a photo of your solution
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Upload Progress */}
        {isAnyButtonProcessing() && uploadProgress > 0 && (
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
            <p className="text-center mt-1">Uploading... Please don't close this page.</p>
          </div>
        )}

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="uploaded-images mt-3">
            <Card className="preview-card">
              <Card.Body>
                <div className="preview-header">
                  <h6>
                    <FontAwesomeIcon icon={faImage} className="me-2" />
                    Solution Images ({images.length})
                  </h6>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      revokeImageUrls(imagePreviewUrls);
                      setImages([]);
                      setImagePreviewUrls([]);
                    }}
                    disabled={isAnyButtonProcessing()}
                  >
                    <FontAwesomeIcon icon={faTrash} className="me-1" />
                    Clear All
                  </Button>
                </div>
                <div className="image-grid">
                  {images.map((image, index) => (
                    <div key={index} className="image-preview-container">
                      <img
                        src={imagePreviewUrls[index]}
                        alt={`Preview ${index + 1}`}
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="image-remove-btn"
                        onClick={() => handleCancelImage(index)}
                        disabled={isAnyButtonProcessing()}
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                      <span className="image-number">{index + 1}</span>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons mt-4">
          <Row>
            <Col xs={12} md={4} className="mb-2">
              <Button
                variant="info"
                onClick={handleExplain}
                className="w-100 action-btn explain-btn"
                disabled={isAnyButtonProcessing()}
              >
                {isButtonProcessing("explain") ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faLightbulb} className="me-2" />
                    Concepts Required
                  </>
                )}
              </Button>
            </Col>

            <Col xs={12} md={4} className="mb-2">
              <Button
                variant="primary"
                onClick={handleSolve}
                className={`w-100 action-btn solve-btn ${images.length > 0 ? 'btn-disabled-with-images' : ''}`}
                disabled={images.length > 0 || isAnyButtonProcessing()}
                title={images.length > 0 ? "Remove uploaded images to use AI Solution" : "Get AI-generated solution"}
              >
                {isButtonProcessing("solve") ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faBookOpen} className="me-2" />
                    AI Solution
                    {images.length > 0 && <small className="d-block mt-1">(Clear images first)</small>}
                  </>
                )}
              </Button>
            </Col>

            <Col xs={12} md={4} className="mb-2">
              <Button
                variant="success"
                onClick={handleCorrect}
                className={`w-100 action-btn correct-btn ${images.length > 0 ? 'btn-ready' : ''}`}
                disabled={images.length === 0 || isAnyButtonProcessing()}
                title={images.length === 0 ? "Upload images of your solution first" : "Submit your solution for AI correction"}
              >
                {isButtonProcessing("correct") ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheck} className="me-2" />
                    AI Correct
                    {images.length > 0 && <Badge bg="light" text="dark" className="ms-2">{images.length}</Badge>}
                  </>
                )}
              </Button>
            </Col>
          </Row>

          {/* Helper text based on state */}
          <div className="action-helper-text mt-2 text-center">
            {images.length === 0 ? (
              <small className="text-muted">
                <FontAwesomeIcon icon={faUpload} className="me-1" />
                Upload your solution images above to enable AI Correct
              </small>
            ) : (
              <small className="text-success">
                <FontAwesomeIcon icon={faCheck} className="me-1" />
                {images.length} image{images.length > 1 ? 's' : ''} ready for AI Correct
              </small>
            )}
          </div>
        </div>

        {/* Points Info */}
        <div className="points-info">
          <FontAwesomeIcon icon={faStar} className="me-2" />
          <span>Earn points by completing questions! AI Correct gives you the most points.</span>
        </div>
      </div>
    </div>
  );
}

export default LearningPathQuestion;
