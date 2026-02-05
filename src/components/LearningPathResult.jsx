// LearningPathResult.jsx - Result page for learning path question submissions
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Accordion, Alert, Badge, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faHome,
  faRoad,
  faTrophy,
  faStar,
  faLightbulb,
  faBookOpen,
  faCheckCircle,
  faExclamationTriangle,
  faChartBar,
  faClock,
  faGraduationCap,
  faTimesCircle,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import MarkdownWithMath from "./MarkdownWithMath";
import { getImageSrc } from "../utils/imageUtils";
import "./LearningPathResult.css";

function LearningPathResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    message,
    ai_data,
    points,
    actionType,
    question,
    questionImage,
    questionId,
    dayNumber,
    dayTopic,
    planId,
    examId,
    class_id,
    subject_id,
    topic_ids,
    currentQuestionIndex,
    allDayQuestions,
    learningPathData,
    learningPathForm,
    completedQuestions,
    activeDayIndex,
    totalQuestionsInDay,
    studentImages = [],
    nextDayData,
  } = location.state || {};

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

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

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      studentImages.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [studentImages]);

  // Extract AI data
  const {
    ai_explaination,
    student_answer,
    concepts,
    gap_analysis,
    error_type,
    mistakes_made,
    concepts_used,
    time_analysis,
    total_marks,
    obtained_marks,
    question_marks,
    videos = [],
    real_world_videos = [],
    key: responseKey,
  } = ai_data || {};

  // Format concepts used
  const formattedConceptsUsed = Array.isArray(concepts_used)
    ? concepts_used.join(", ")
    : concepts_used || "";

  // Handle navigation to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < allDayQuestions.length - 1) {
      const nextQuestion = allDayQuestions[currentQuestionIndex + 1];
      navigate("/learning-path-question", {
        state: {
          question: nextQuestion.question,
          questionId: nextQuestion.question_id,
          questionImage: nextQuestion.question_image || "",
          questionLevel: nextQuestion.question_level,
          topic: nextQuestion.topic || dayTopic,
          dayNumber,
          dayTopic,
          planId,
          examId,
          class_id,
          subject_id,
          topic_ids,
          totalQuestionsInDay,
          currentQuestionIndex: currentQuestionIndex + 1,
          allDayQuestions,
          learningPathData,
          learningPathForm,
          completedQuestions,
          activeDayIndex,
          nextDayData,
        },
        replace: true,
      });
    }
  };

  // Handle navigation to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevQuestion = allDayQuestions[currentQuestionIndex - 1];
      navigate("/learning-path-question", {
        state: {
          question: prevQuestion.question,
          questionId: prevQuestion.question_id,
          questionImage: prevQuestion.question_image || "",
          questionLevel: prevQuestion.question_level,
          topic: prevQuestion.topic || dayTopic,
          dayNumber,
          dayTopic,
          planId,
          examId,
          class_id,
          subject_id,
          topic_ids,
          totalQuestionsInDay,
          currentQuestionIndex: currentQuestionIndex - 1,
          allDayQuestions,
          learningPathData,
          learningPathForm,
          completedQuestions,
          activeDayIndex,
          nextDayData,
        },
        replace: true,
      });
    }
  };

  // Handle back to current question
  const handleBackToQuestion = () => {
    const currentQuestion = allDayQuestions[currentQuestionIndex];
    navigate("/learning-path-question", {
      state: {
        question: currentQuestion.question,
        questionId: currentQuestion.question_id,
        questionImage: currentQuestion.question_image || "",
        questionLevel: currentQuestion.question_level,
        topic: currentQuestion.topic || dayTopic,
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
        completedQuestions,
        activeDayIndex,
        nextDayData,
      },
      replace: true,
    });
  };

  // Handle back to learning session
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
      replace: true,
    });
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    navigate("/student-dash");
  };

  // Render solution steps
  const renderSolutionSteps = (steps) => {
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return <p>No solution steps available.</p>;
    }

    return (
      <div className="solution-steps">
        {steps.map((step, index) => {
          const stepMatch = step.match(/^Step\s+(\d+):\s+(.*)/i);

          if (stepMatch) {
            const [_, stepNumber, stepContent] = stepMatch;
            return (
              <div key={index} className="solution-step-container">
                <div className="step-title">Step {stepNumber}:</div>
                <div className="step-description">
                  <MarkdownWithMath content={stepContent} />
                </div>
              </div>
            );
          } else {
            return (
              <div key={index} className="solution-step-container">
                <div className="step-title">Step {index + 1}:</div>
                <div className="step-content">
                  <MarkdownWithMath content={step} />
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  // Render content based on action type
  const renderContentBasedOnAction = () => {
    switch (actionType) {
      case "explain":
        return (
          <>
            {concepts && concepts.length > 0 && (
              <Accordion defaultActiveKey={['0']} alwaysOpen className="concepts-accordion">
                {concepts.map((conceptItem, index) => (
                  <Accordion.Item eventKey={index.toString()} key={index}>
                    <Accordion.Header>
                      <strong>Concept {index + 1}: {conceptItem.concept}</strong>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="lpr-concept-block">
                        <h6 className="lpr-concept-heading">
                          <FontAwesomeIcon icon={faLightbulb} className="me-2" />
                          Explanation
                        </h6>
                        <div className="lpr-concept-text">
                          <MarkdownWithMath content={conceptItem.explanation} />
                        </div>
                      </div>

                      {conceptItem.example && (
                        <div className="lpr-concept-block lpr-concept-block--example">
                          <h6 className="lpr-concept-heading">
                            <FontAwesomeIcon icon={faBookOpen} className="me-2" />
                            Example
                          </h6>
                          <div className="lpr-concept-text">
                            {typeof conceptItem.example === "string" ? (
                              <MarkdownWithMath content={conceptItem.example} />
                            ) : (
                              <>
                                {conceptItem.example.problem && (
                                  <MarkdownWithMath content={conceptItem.example.problem} />
                                )}
                                {conceptItem.example.solution && (
                                  <div className="lpr-concept-solution">
                                    <strong>Solution:</strong>
                                    <MarkdownWithMath content={conceptItem.example.solution} />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {conceptItem.application && (
                        <div className="lpr-concept-block lpr-concept-block--application">
                          <h6 className="lpr-concept-heading">
                            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                            Application
                          </h6>
                          <div className="lpr-concept-text">
                            <MarkdownWithMath content={conceptItem.application} />
                          </div>
                        </div>
                      )}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </>
        );

      case "solve":
        return (
          <>
            <div className="result-section">
              <h5 className="section-title">
                <FontAwesomeIcon icon={faBookOpen} className="me-2" />
                AI Solution
              </h5>
              <div className="solution-content">
                {renderSolutionSteps(ai_explaination)}
              </div>
            </div>
          </>
        );

      case "correct":
        return (
          <>
            {/* Score Display */}
            <div className="score-section">
              <div className="score-display">
                <div className="score-circle">
                  <span className="score-value">{obtained_marks || 0}</span>
                  <span className="score-divider">/</span>
                  <span className="score-max">{total_marks || question_marks || 10}</span>
                </div>
                <div className="score-label">Score</div>
              </div>

              {/* {points !== undefined && (
                <div className="points-earned">
                  <FontAwesomeIcon icon={faStar} className="points-icon" />
                  <span>+{points} Points Earned!</span>
                </div>
              )} */}
            </div>

            {/* AI Solution */}
            <div className="result-section">
              <h5 className="section-title">
                <FontAwesomeIcon icon={faBookOpen} className="me-2" />
                AI Solution
              </h5>
              <div className="solution-content">
                {renderSolutionSteps(ai_explaination)}
              </div>
            </div>

            {/* Error Type */}
            {error_type && (
              <div className="result-section error-section">
                <h5 className="section-title text-danger">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                  Error Type
                </h5>
                <Badge bg="danger" className="error-badge">
                  {error_type}
                </Badge>
              </div>
            )}

            {/* Gap Analysis */}
            {gap_analysis && (
              <div className="result-section gap-section">
                <h5 className="section-title text-info">
                  <FontAwesomeIcon icon={faChartBar} className="me-2" />
                  Gap Analysis
                </h5>
                <div className="gap-content">
                  <MarkdownWithMath content={gap_analysis} />
                </div>
              </div>
            )}

            {/* Mistakes Made */}
            {mistakes_made && (
              <div className="result-section mistakes-section">
                <h5 className="section-title text-warning">
                  <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
                  Mistakes Made
                </h5>
                <div className="mistakes-content">
                  {typeof mistakes_made === "string" ? (
                    <MarkdownWithMath content={mistakes_made} />
                  ) : Array.isArray(mistakes_made) ? (
                    <ul className="mistakes-list">
                      {mistakes_made.map((mistake, idx) => (
                        <li key={idx}>{mistake}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            )}

            {/* Time Analysis */}
            {time_analysis && (
              <div className="result-section time-section">
                <h5 className="section-title">
                  <FontAwesomeIcon icon={faClock} className="me-2" />
                  Time Management
                </h5>
                <div className="time-content">
                  <MarkdownWithMath content={time_analysis} />
                </div>
              </div>
            )}

            {/* Concepts Used */}
            {formattedConceptsUsed && (
              <div className="result-section concepts-section">
                <h5 className="section-title text-primary">
                  <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                  Concepts Required
                </h5>
                <div className="concepts-content">
                  <MarkdownWithMath content={formattedConceptsUsed} />
                </div>
              </div>
            )}
          </>
        );

      default:
        return <p>No result data available.</p>;
    }
  };

  // Get action type label
  const getActionTypeLabel = () => {
    switch (actionType) {
      case "explain":
        return "Concepts";
      case "solve":
        return "AI Solution";
      case "correct":
        return "AI Correction";
      default:
        return "Result";
    }
  };

  return (
    <div className={`lp-result-wrapper ${isDarkMode ? "dark-mode" : ""}`}>
      {/* Fixed Header */}
      <div className="fixed-header">
        <Button variant="outline-secondary" onClick={handleBackToQuestion} className="back-btn">
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Question
        </Button>

        <div className="header-info">
          <Badge className="day-badge">
            <FontAwesomeIcon icon={faRoad} className="me-1" />
            Day {dayNumber}
          </Badge>
          <span className="question-indicator">
            Q{currentQuestionIndex + 1} of {totalQuestionsInDay}
          </span>
        </div>
      </div>

      <Container fluid className="lp-result-container">
        <Row>
          {/* Left Column - Student Images (if any) */}
          {studentImages.length > 0 && actionType === "correct" && (
            <Col lg={4} className="image-column">
              <Card className="student-images-card">
                <Card.Header>
                  <h5>Your Solution</h5>
                </Card.Header>
                <Card.Body>
                  <div className="student-images">
                    {studentImages.map((imageUrl, index) => (
                      <div key={index} className="student-image-wrapper">
                        <img
                          src={imageUrl}
                          alt={`Solution ${index + 1}`}
                          className="student-solution-image"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}

          {/* Main Content Column */}
          <Col lg={studentImages.length > 0 && actionType === "correct" ? 8 : 12} className="content-column">
            <Card className="result-card">
              <Card.Header className="result-header">
                <div className="result-header-content">
                  <h2 className="result-title">
                    <FontAwesomeIcon
                      icon={
                        actionType === "correct"
                          ? faTrophy
                          : actionType === "solve"
                          ? faBookOpen
                          : faLightbulb
                      }
                      className="me-2"
                    />
                    {getActionTypeLabel()}
                  </h2>
                  {/* {points !== undefined && actionType === "correct" && (
                    <Badge bg="success" className="points-badge-header">
                      <FontAwesomeIcon icon={faStar} className="me-1" />
                      +{points} Points
                    </Badge>
                  )} */}
                </div>
              </Card.Header>

              <Card.Body>
                {/* Question Display */}
                <div className="question-display">
                  <h6 className="section-label">Question:</h6>
                  {questionImage && (
                    <img
                      src={getImageSrc(questionImage)}
                      alt="Question"
                      className="question-image"
                    />
                  )}
                  <div className="question-text">
                    <MarkdownWithMath content={question} />
                  </div>
                </div>

                {/* Result Content */}
                <div className="result-content">{renderContentBasedOnAction()}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Fixed Bottom Navigation */}
      <div className="fixed-bottom-nav">
        <Button
          variant="outline-secondary"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="nav-btn"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
          Previous
        </Button>

        <Button variant="outline-primary" onClick={handleBackToSession} className="nav-btn session-btn">
          <FontAwesomeIcon icon={faRoad} className="me-2" />
          Day Overview
        </Button>

        <Button variant="outline-primary" onClick={handleBackToDashboard} className="nav-btn">
          <FontAwesomeIcon icon={faHome} className="me-2" />
          Dashboard
        </Button>

        <Button
          variant="primary"
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex >= allDayQuestions.length - 1}
          className="nav-btn next-btn"
        >
          Next Question
          <FontAwesomeIcon icon={faChevronRight} className="ms-2" />
        </Button>
      </div>
    </div>
  );
}

export default LearningPathResult;
