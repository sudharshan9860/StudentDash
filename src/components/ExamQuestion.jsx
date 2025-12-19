// ExamQuestion.jsx - Component for solving exam questions with timer and navigation
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Row, Col, ProgressBar, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faArrowLeft,
  faArrowRight,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faListOl,
  faFlag,
  faPaperPlane,
  faCamera,
  faUpload,
  faStopwatch,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import CameraCapture from "./CameraCapture";
import MarkdownWithMath from "./MarkdownWithMath";
import { getImageSrc } from "../utils/imageUtils";
import axiosInstance from "../api/axiosInstance";
import "./ExamQuestion.css";

// Generate a unique exam session ID
const generateExamSessionId = (metadata, startTime) => {
  return `exam_${metadata.classId}_${metadata.subjectId}_${startTime}`;
};

function ExamQuestion() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data from navigation state
  const { questions = [], examSettings = {}, metadata = {}, startTime } = location.state || {};

  // Generate unique session ID for localStorage
  const examSessionId = generateExamSessionId(metadata, startTime);

  // Load persisted state from localStorage
  const loadPersistedState = () => {
    try {
      const savedState = localStorage.getItem(examSessionId);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (e) {
      console.error("Error loading exam state:", e);
    }
    return null;
  };

  const persistedState = loadPersistedState();

  // State - initialized from localStorage if available
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    persistedState?.currentQuestionIndex || 0
  );
  const [answers, setAnswers] = useState(persistedState?.answers || {});
  const [questionTimers, setQuestionTimers] = useState(
    persistedState?.questionTimers || {}
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState(
    new Set(persistedState?.flaggedQuestions || [])
  );
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showFullQuestionListModal, setShowFullQuestionListModal] = useState(false);
  const [uploadedImages, setUploadedImages] = useState({}); // { questionIndex: [{ file, previewUrl }, ...] }
  const [imageSourceType, setImageSourceType] = useState("upload");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Total exam time tracking
  const totalExamDurationSeconds = examSettings.totalDurationSeconds || 1800; // Default 30 min
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(
    persistedState?.totalTimeElapsed || 0
  );
  const [currentQuestionTimeElapsed, setCurrentQuestionTimeElapsed] = useState(0);

  // Refs
  const timerRef = useRef(null);
  const questionStartTimeRef = useRef(Date.now());
  const lastSaveTimeRef = useRef(Date.now());

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // Redirect if no questions
  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate("/exam-mode");
    }
  }, [questions, navigate]);

  // Apply dark mode
  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);

    const handleDarkModeChange = (e) => {
      setIsDarkMode(e.detail.isDarkMode);
    };

    window.addEventListener("darkModeChange", handleDarkModeChange);
    return () => {
      window.removeEventListener("darkModeChange", handleDarkModeChange);
    };
  }, [isDarkMode]);

  // Save state to localStorage
  const saveStateToLocalStorage = useCallback(() => {
    try {
      const stateToSave = {
        currentQuestionIndex,
        answers,
        questionTimers,
        flaggedQuestions: Array.from(flaggedQuestions),
        totalTimeElapsed,
        lastSaveTimestamp: Date.now(),
      };
      localStorage.setItem(examSessionId, JSON.stringify(stateToSave));
    } catch (e) {
      console.error("Error saving exam state:", e);
    }
  }, [examSessionId, currentQuestionIndex, answers, questionTimers, flaggedQuestions, totalTimeElapsed]);

  // Timer logic - tracks both total exam time and per-question time
  useEffect(() => {
    // Initialize question start time
    questionStartTimeRef.current = Date.now();

    // Load the already spent time for this question
    const alreadySpentOnThisQuestion = questionTimers[currentQuestionIndex] || 0;
    setCurrentQuestionTimeElapsed(alreadySpentOnThisQuestion);

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const sessionTimeSpent = Math.floor((now - questionStartTimeRef.current) / 1000);

      // Update current question elapsed time
      setCurrentQuestionTimeElapsed(alreadySpentOnThisQuestion + sessionTimeSpent);

      // Update total exam time
      setTotalTimeElapsed((prev) => {
        const newTotal = prev + 1;

        // Auto-submit when total time expires
        if (newTotal >= totalExamDurationSeconds) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
        }

        return newTotal;
      });

      // Save to localStorage every 5 seconds
      if (now - lastSaveTimeRef.current >= 5000) {
        lastSaveTimeRef.current = now;
        // We need to save with updated questionTimers
        const updatedQuestionTimers = {
          ...questionTimers,
          [currentQuestionIndex]: alreadySpentOnThisQuestion + sessionTimeSpent,
        };
        try {
          const stateToSave = {
            currentQuestionIndex,
            answers,
            questionTimers: updatedQuestionTimers,
            flaggedQuestions: Array.from(flaggedQuestions),
            totalTimeElapsed: totalTimeElapsed + 1,
            lastSaveTimestamp: now,
          };
          localStorage.setItem(examSessionId, JSON.stringify(stateToSave));
        } catch (e) {
          console.error("Error saving exam state:", e);
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex]); // Only re-run when question changes

  // Save time spent when leaving a question
  const saveTimeSpent = useCallback(() => {
    const sessionTimeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    const previousTime = questionTimers[currentQuestionIndex] || 0;
    const newTime = previousTime + sessionTimeSpent;

    setQuestionTimers((prev) => ({
      ...prev,
      [currentQuestionIndex]: newTime,
    }));

    return newTime;
  }, [currentQuestionIndex, questionTimers]);

  // Handle auto-submit when time expires
  const handleAutoSubmit = useCallback(() => {
    saveTimeSpent();
    // Clean up localStorage
    localStorage.removeItem(examSessionId);

    // Calculate results and navigate
    let correctAnswers = 0;
    const questionResults = questions.map((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correct_answer;
      if (isCorrect) correctAnswers++;

      return {
        questionId: q.question_id,
        question: q.question,
        userAnswer: userAnswer || "Not Attempted",
        correctAnswer: q.correct_answer,
        isCorrect,
        timeSpent: questionTimers[index] || 0,
        marks: isCorrect ? q.marks : 0,
        maxMarks: q.marks,
        topic: q.topic,
        uploadedImages: uploadedImages[index]?.map((img) => img.previewUrl) || [],
      };
    });

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    const obtainedMarks = questionResults.reduce((sum, r) => sum + r.marks, 0);
    const percentage = ((obtainedMarks / totalMarks) * 100).toFixed(1);

    navigate("/exam-result", {
      state: {
        questionResults,
        examStats: {
          totalQuestions: questions.length,
          correctAnswers,
          incorrectAnswers: questions.length - correctAnswers - (questions.length - Object.keys(answers).length),
          unanswered: questions.length - Object.keys(answers).length,
          totalMarks,
          obtainedMarks,
          percentage,
          totalTimeSpent: totalExamDurationSeconds,
          startTime,
          endTime: new Date().toISOString(),
          timeExpired: true,
        },
        metadata,
      },
    });
  }, [answers, examSessionId, metadata, navigate, questions, questionTimers, saveTimeSpent, startTime, totalExamDurationSeconds, uploadedImages]);

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format time remaining (shows remaining time from total)
  const timeRemaining = totalExamDurationSeconds - totalTimeElapsed;

  // Get timer color based on remaining time
  const getTimerColor = () => {
    const percentage = (timeRemaining / totalExamDurationSeconds) * 100;
    if (percentage > 50) return "success";
    if (percentage > 25) return "warning";
    return "danger";
  };

  // Get question time color (just for visual - no penalty)
  const getQuestionTimeColor = () => {
    if (currentQuestionTimeElapsed < 60) return "info"; // Under 1 min
    if (currentQuestionTimeElapsed < 120) return "primary"; // 1-2 min
    if (currentQuestionTimeElapsed < 180) return "warning"; // 2-3 min
    return "secondary"; // Over 3 min
  };

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: "__image_uploaded__" }));

  };

  // Handle image capture (appends to existing images)
  const handleCapturedImage = (imageBlob) => {
    const file = new File(
      [imageBlob],
      `answer-${currentQuestionIndex}-${Date.now()}.jpg`,
      { type: "image/jpeg" }
    );

    const previewUrl = URL.createObjectURL(file);

    setUploadedImages((prev) => ({
      ...prev,
      [currentQuestionIndex]: [...(prev[currentQuestionIndex] || []), { file, previewUrl }],
    }));

    // Mark question as answered when camera picture captured
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: "__image_uploaded__",
    }));
  };
  

  // Handle file upload (supports multiple images)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 5MB limit and was skipped`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const newImages = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setUploadedImages((prev) => ({
      ...prev,
      [currentQuestionIndex]: [...(prev[currentQuestionIndex] || []), ...newImages],
    }));

    // Mark question as answered when image uploaded
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: "__image_uploaded__",
    }));

    // Reset file input
    e.target.value = "";
  };
  
  // Remove specific uploaded image by index
  const handleRemoveImage = (imageIndex) => {
    setUploadedImages((prev) => {
      const currentImages = prev[currentQuestionIndex] || [];
      if (currentImages[imageIndex]?.previewUrl) {
        URL.revokeObjectURL(currentImages[imageIndex].previewUrl);
      }
      const newImages = currentImages.filter((_, idx) => idx !== imageIndex);

      if (newImages.length === 0) {
        const { [currentQuestionIndex]: _, ...rest } = prev;
        // Remove answer marker if no images left
        setAnswers((prevAnswers) => {
          const { [currentQuestionIndex]: __, ...restAnswers } = prevAnswers;
          return restAnswers;
        });
        return rest;
      }

      return { ...prev, [currentQuestionIndex]: newImages };
    });
  };

  // Toggle flag for current question
  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newFlags = new Set(prev);
      if (newFlags.has(currentQuestionIndex)) {
        newFlags.delete(currentQuestionIndex);
      } else {
        newFlags.add(currentQuestionIndex);
      }
      return newFlags;
    });
  };

  // Navigate to previous question
  const goToPrevious = () => {
    saveTimeSpent();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Navigate to next question
  const goToNext = () => {
    saveTimeSpent();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Go to specific question
  const goToQuestion = (index) => {
    saveTimeSpent();
    setCurrentQuestionIndex(index);
    setShowNavigationModal(false);
  };

  // Get question status for navigation
  const getQuestionStatus = (index) => {
    if (answers[index]) return "answered";
    if (flaggedQuestions.has(index)) return "flagged";
    if (index === currentQuestionIndex) return "current";
    return "unanswered";
  };

  // Calculate exam stats
  const getExamStats = () => {
    const answered = Object.keys(answers).length;
    const flagged = flaggedQuestions.size;
    const unanswered = questions.length - answered;
    return { answered, flagged, unanswered };
  };

  // Handle exam submission
  const handleSubmitExam = async () => {
    const finalQuestionTime = saveTimeSpent();

    // Get final question timers with current question updated
    const finalQuestionTimers = {
      ...questionTimers,
      [currentQuestionIndex]: finalQuestionTime,
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare FormData for API (matching backend ExamProcessAPIView structure)
      const formData = new FormData();

      // Add class_id from metadata
      if (metadata.class_id) {
        formData.append("class_id", metadata.class_id);
      }

      // Add subject_id from metadata
      if (metadata.subject_id) {
        formData.append("subject_id", metadata.subject_id);
      }

      // Add chapters - append each chapter separately (backend uses getlist)
      if (metadata.chapters && Array.isArray(metadata.chapters)) {
        metadata.chapters.forEach((chapter) => {
          formData.append("chapters", chapter);
        });
      }

      // Prepare questions array for API
      // Backend expects: question_text, difficulty (question_level maps to difficulty)
      const questionsPayload = questions.map((q, index) => ({
        question_text: q.question || "",
        difficulty: q.question_level || "Medium",
        question_image: q.question_image || null,
        topic: q.topic || null,
      }));

      // Add questions as JSON string (backend parses this with json.loads)
      formData.append("questions", JSON.stringify(questionsPayload));

      // Add answer_files - all uploaded images for all questions
      // Backend expects: request.FILES.getlist("answer_files")
      questions.forEach((_, index) => {
        const questionImages = uploadedImages[index] || [];
        questionImages.forEach((imageData) => {
          if (imageData.file) {
            formData.append("answer_files", imageData.file);
          }
        });
      });

      // Call POST /exam-process/ API
      const response = await axiosInstance.post("/exam-process/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Clean up localStorage after successful submission
      localStorage.removeItem(examSessionId);

      // Map API response to results
      // Backend returns: { results: [...], total_score, total_max_marks, exam_id }
      const apiResults = response.data.results || [];
      const apiTotalScore = response.data.total_score || 0;
      const apiTotalMaxMarks = response.data.total_max_marks || 0;
      const apiExamId = response.data.exam_id || null;

      // Helper function to normalize data - API may return string or array
      const normalizeToArray = (value) => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === "string") return [value]; // Convert string to single-item array
        return [];
      };

      // Helper function to normalize score breakdown - API may return string or object
      const normalizeScoreBreakdown = (value) => {
        if (!value) return null;
        if (typeof value === "object" && !Array.isArray(value)) return value;
        if (typeof value === "string") return value; // Keep as string for display
        return null;
      };

      // Create question results with evaluation data
      const questionResults = questions.map((q, index) => {
        // Backend returns: { question_text, difficulty, evaluation: {...} }
        const resultItem = apiResults[index] || {};
        const evaluation = resultItem.evaluation || {};
        const userAnswer = answers[index];


        return {
          questionId: q.question_id,
          question: q.question,
          questionLevel: q.question_level || resultItem.difficulty || "Medium",
          userAnswer: userAnswer || "Not Attempted",
          correctAnswer: q.correct_answer || "N/A",
          isCorrect: evaluation.score === evaluation.max_marks,
          timeSpent: finalQuestionTimers[index] || 0,
          marks: evaluation.score || 0,
          maxMarks: evaluation.max_marks || q.marks || 0,
          topic: q.topic,
          uploadedImages: uploadedImages[index]?.map((img) => img.previewUrl) || [],
          // Evaluation specific fields from API - normalized for consistent handling
          evaluation: {
            score: evaluation.score || 0,
            maxMarks: evaluation.max_marks || q.marks || 0,
            errorType: evaluation.error_type || null,
            mistakesMade: normalizeToArray(evaluation.mistakes_made),
            gapAnalysis: evaluation.gap_analysis || "",
            additionalComments: evaluation.additional_comments || "",
            conceptsRequired: normalizeToArray(evaluation.concepts_required),
            scoreBreakdown: normalizeScoreBreakdown(evaluation.score_breakdown),
          },
        };
      });

      // Use API totals if available, otherwise calculate
      const totalMarks = apiTotalMaxMarks || questions.reduce((sum, q) => sum + (q.marks || 0), 0);
      const obtainedMarks = apiTotalScore;
      const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(1) : "0.0";
      const totalTimeSpent = Object.values(finalQuestionTimers).reduce((sum, t) => sum + t, 0);

      // Count correct/incorrect/unanswered
      let correctAnswers = 0;
      let incorrectAnswers = 0;
      let unanswered = 0;

      questionResults.forEach((result, index) => {
        const hasAnswer = answers[index] || (uploadedImages[index]?.length > 0);
        if (!hasAnswer) {
          unanswered++;
        } else if (result.marks === result.maxMarks) {
          correctAnswers++;
        } else if (result.marks > 0) {
          // Partial marks - count as attempted but not fully correct
          incorrectAnswers++;
        } else {
          incorrectAnswers++;
        }
      });

      // Navigate to results page with evaluation data
      navigate("/exam-result", {
        state: {
          questionResults,
          examStats: {
            totalQuestions: questions.length,
            correctAnswers,
            incorrectAnswers,
            unanswered,
            totalMarks,
            obtainedMarks,
            percentage,
            totalTimeSpent,
            examDuration: totalExamDurationSeconds,
            startTime,
            endTime: new Date().toISOString(),
            timeExpired: false,
          },
          metadata,
          apiResponse: response.data, // Full API response for reference
        },
      });
    } catch (error) {
      console.error("Error submitting exam:", error);
      setSubmitError(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to submit exam. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="exam-question-loading">
        <p>Loading exam...</p>
      </div>
    );
  }

  const stats = getExamStats();

  return (
    <div className={`exam-question-wrapper ${isDarkMode ? "dark-mode" : ""}`}>
      {/* Header with Timer */}
      <div className="exam-header">
        <div className="exam-header-left">
          <span className="exam-title">{metadata.subjectName || "Exam"}</span>
          <span className="exam-chapter">
            {metadata.chapterNames?.join(", ") || "Multiple Chapters"}
          </span>
        </div>

        <div className="exam-timers-container">
          {/* Total Exam Time Remaining */}
          <div className="exam-timer1 total-timer">
            <FontAwesomeIcon icon={faClock} className="me-2" />
            <span className={`timer-value timer-${getTimerColor()}`}>
              {formatTime(Math.max(0, timeRemaining))}
            </span>
            <span className="timer-label">Remaining</span>
          </div>

          {/* Current Question Time Elapsed */}
          <div className="exam-timer1 question-timer">
            <FontAwesomeIcon icon={faStopwatch} className="me-2" />
            <span className={`timer-value timer-${getQuestionTimeColor()}`}>
              {formatTime(currentQuestionTimeElapsed)}
            </span>
            <span className="timer-label">This Q</span>
          </div>
        </div>

        <div className="exam-header-right">
          <Button
            variant="outline-info"
            className="btn-navigation me-2"
            onClick={() => setShowFullQuestionListModal(true)}
          >
            <FontAwesomeIcon icon={faEye} className="me-2" />
            View All
          </Button>
          <Button
            variant="outline-primary"
            className="btn-navigation"
            onClick={() => setShowNavigationModal(true)}
          >
            <FontAwesomeIcon icon={faListOl} className="me-2" />
            Questions
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="exam-progress-container">
        <ProgressBar
          now={Math.max(0, timeRemaining)}
          max={totalExamDurationSeconds}
          variant={getTimerColor()}
          className="exam-progress-bar"
        />
        <div className="progress-stats">
          <span className="stat-item">
            <span className="stat-value">{currentQuestionIndex + 1}</span>
            <span className="stat-label">/ {questions.length}</span>
          </span>
          <span className="stat-divider">|</span>
          <span className="stat-item answered">
            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
            {stats.answered} Answered
          </span>
          <span className="stat-divider">|</span>
          <span className="stat-item flagged">
            <FontAwesomeIcon icon={faFlag} className="me-1" />
            {stats.flagged} Flagged
          </span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="question-card">
        <Card.Body>
          {/* Question Header */}
          <div className="question-header1">
            <span className="question-number">Question {currentQuestionIndex + 1}</span>
            <span className={`question-level1 level-${(currentQuestion.question_level || "Medium").toLowerCase()}`}>
              {currentQuestion.question_level || "Medium"}
            </span>
            <Button
              variant={flaggedQuestions.has(currentQuestionIndex) ? "warning" : "outline-secondary"}
              className="btn-flag"
              onClick={toggleFlag}
            >
              <FontAwesomeIcon icon={faFlag} />
              {flaggedQuestions.has(currentQuestionIndex) ? " Flagged" : " Flag"}
            </Button>
          </div>

          {/* Question Content */}
          <div className="question-content">
            {currentQuestion.question_image && (
              <img
                src={getImageSrc(currentQuestion.question_image)}
                alt="Question"
                className="question-image"
              />
            )}
            <div className="question-text">
              <MarkdownWithMath content={currentQuestion.question} />
            </div>
          </div>

          {/* Options */}
          {/* {currentQuestion.options && currentQuestion.options.length > 0 && (
            <div className="options-container">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${
                    answers[currentQuestionIndex] === option ? "selected" : ""
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>
          )} */}

          {/* Image Upload Section */}
          <div className="image-upload-section">
            <h6>Upload Your Work (Optional)</h6>
            <div className="image-source-buttons">
            <Button
                variant={imageSourceType === "upload" ? "primary" : "outline-primary"}
                onClick={() => setImageSourceType("upload")}
                size="sm"
              >
                <FontAwesomeIcon icon={faUpload} className="me-2" />
                Upload
              </Button>
              <Button
                variant={imageSourceType === "camera" ? "primary" : "outline-primary"}
                onClick={() => setImageSourceType("camera")}
                size="sm"
              >
                <FontAwesomeIcon icon={faCamera} className="me-2" />
                Camera
              </Button>
             
            </div>

            {imageSourceType === "upload" ? (
              <div className="upload-container">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-label">
                  Click to upload images (multiple allowed)
                </label>
              </div>
            ) : (
              <div className="camera-container">
                <CameraCapture
                  onImageCapture={handleCapturedImage}
                  videoConstraints={{
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                  }}
                />
              </div>
            )  }

            {/* Preview uploaded images */}
            {uploadedImages[currentQuestionIndex]?.length > 0 && (
              <div className="uploaded-previews">
                <div className="preview-count">
                  {uploadedImages[currentQuestionIndex].length} image(s) uploaded
                </div>
                <div className="preview-grid">
                  {uploadedImages[currentQuestionIndex].map((image, index) => (
                    <div key={index} className="uploaded-preview">
                      <img
                        src={image.previewUrl}
                        alt={`Your work ${index + 1}`}
                        className="preview-image"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="remove-image-btn1 d-flex align-items-center justify-content-center"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <FontAwesomeIcon icon={faTimesCircle} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Navigation Buttons */}
      <div className="exam-navigation">
        <Button
          variant="outline-secondary"
          className="nav-btn btn-prev"
          onClick={goToPrevious}
          disabled={currentQuestionIndex === 0}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Previous
        </Button>

        {currentQuestionIndex < questions.length - 1 ? (
          <Button variant="primary" className="nav-btn btn-next" onClick={goToNext}>
            Next
            <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
          </Button>
        ) : (
          <Button
            variant="success"
            className="nav-btn btn-submit"
            onClick={() => setShowSubmitModal(true)}
          >
            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
            Submit Exam
          </Button>
        )}
      </div>

      {/* Question Navigation Modal */}
      <Modal
        show={showNavigationModal}
        onHide={() => setShowNavigationModal(false)}
        centered
        className={isDarkMode ? "dark-mode" : ""}
      >
        <Modal.Header closeButton>
          <Modal.Title>Question Navigator</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="question-grid">
            {questions.map((_, index) => (
              <button
                key={index}
                className={`question-nav-btn ${getQuestionStatus(index)}`}
                onClick={() => goToQuestion(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="nav-legend">
            <span className="legend-item current">
              <span className="legend-dot"></span> Current
            </span>
            <span className="legend-item answered">
              <span className="legend-dot"></span> Answered
            </span>
            <span className="legend-item flagged">
              <span className="legend-dot"></span> Flagged
            </span>
            <span className="legend-item unanswered">
              <span className="legend-dot"></span> Unanswered
            </span>
          </div>
        </Modal.Body>
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal
        show={showSubmitModal}
        onHide={() => setShowSubmitModal(false)}
        centered
        className={isDarkMode ? "dark-mode" : ""}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2 text-warning" />
            Submit Exam?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="submit-stats">
            <Row>
              <Col xs={4}>
                <div className="submit-stat answered">
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span className="stat-number">{stats.answered}</span>
                  <span className="stat-text">Answered</span>
                </div>
              </Col>
              <Col xs={4}>
                <div className="submit-stat flagged">
                  <FontAwesomeIcon icon={faFlag} />
                  <span className="stat-number">{stats.flagged}</span>
                  <span className="stat-text">Flagged</span>
                </div>
              </Col>
              <Col xs={4}>
                <div className="submit-stat unanswered">
                  <FontAwesomeIcon icon={faTimesCircle} />
                  <span className="stat-number">{stats.unanswered}</span>
                  <span className="stat-text">Unanswered</span>
                </div>
              </Col>
            </Row>
          </div>
          <p className="submit-warning">
            Are you sure you want to submit the exam? This action cannot be undone.
          </p>
        </Modal.Body>
        {submitError && (
          <div className="alert alert-danger mx-3 mb-3">
            {submitError}
          </div>
        )}
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowSubmitModal(false)}
            disabled={isSubmitting}
          >
            Continue Exam
          </Button>
          <Button
            variant="success"
            onClick={handleSubmitExam}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Evaluating...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                Submit Exam
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Full Question List Modal */}
      <Modal
        show={showFullQuestionListModal}
        onHide={() => setShowFullQuestionListModal(false)}
        centered
        size="lg"
        className={`full-question-list-modal ${isDarkMode ? "dark-mode" : ""}`}
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faEye} className="me-2 text-info" />
            All Questions ({questions.length})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="full-question-list-body">
          <div className="full-question-list">
            {questions.map((question, index) => {
              const status = getQuestionStatus(index);
              const timeSpent = questionTimers[index] || 0;
              const hasImages = uploadedImages[index]?.length > 0;

              return (
                <div
                  key={index}
                  className={`full-question-item ${status} ${index === currentQuestionIndex ? 'current-highlight' : ''}`}
                >
                  <div className="question-item-header">
                    <div className="question-item-left">
                      <span className={`question-item-number status-${status}`}>
                        Q{index + 1}
                      </span>
                      <span className={`question-item-level level-${(question.question_level || "Medium").toLowerCase()}`}>
                        {question.question_level || "Medium"}
                      </span>
                      {flaggedQuestions.has(index) && (
                        <span className="question-item-flag">
                          <FontAwesomeIcon icon={faFlag} />
                        </span>
                      )}
                      {hasImages && (
                        <span className="question-item-images">
                          <FontAwesomeIcon icon={faCamera} />
                          {uploadedImages[index].length}
                        </span>
                      )}
                    </div>
                    <div className="question-item-right">
                      <span className="question-item-time">
                        <FontAwesomeIcon icon={faStopwatch} className="me-1" />
                        {formatTime(timeSpent)}
                      </span>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="question-item-goto"
                        onClick={() => {
                          goToQuestion(index);
                          setShowFullQuestionListModal(false);
                        }}
                      >
                        Go to
                      </Button>
                    </div>
                  </div>
                  <div className="question-item-content">
                    {question.question_image && (
                      <img
                        src={getImageSrc(question.question_image)}
                        alt={`Question ${index + 1}`}
                        className="question-item-image"
                      />
                    )}
                    <div className="question-item-text">
                      <MarkdownWithMath content={question.question} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="full-question-legend">
            <span className="legend-item current">
              <span className="legend-dot"></span> Current
            </span>
            <span className="legend-item answered">
              <span className="legend-dot"></span> Answered
            </span>
            <span className="legend-item flagged">
              <span className="legend-dot"></span> Flagged
            </span>
            <span className="legend-item unanswered">
              <span className="legend-dot"></span> Unanswered
            </span>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFullQuestionListModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ExamQuestion;
