// LearningPathSession.jsx - Main component for learning path study sessions
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Badge, ProgressBar, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faRoad,
  faCalendarAlt,
  faClock,
  faBookOpen,
  faTasks,
  faCheckCircle,
  faPlay,
  faHome,
  faChartBar,
  faLightbulb,
  faTrophy,
  faFire,
  faArrowLeft,
  faStar,
  faLock,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";
import MarkdownWithMath from "./MarkdownWithMath";
import "./LearningPathSession.css";

function LearningPathSession() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data from location state
  const {
    learningPathData: initialLearningPathData,
    planId,
    examId,
    class_id,
    subject_id,
    topic_ids,
    learningPathForm,
    currentDay,
    nextDayData,
  } = location.state || {};

 console.log("pathid",planId)

  // Transform nextDayData from ExamMode into learningPathData format if needed
  const learningPathData = React.useMemo(() => {
    // If we have nextDayData from ExamMode, always use it to transform questions properly
    if (nextDayData) {
      return {
        daily_plans: [{
          day_number: nextDayData.next_day,
          topic: nextDayData.topic,
          what_to_study: nextDayData.what_to_study,
          expected_time: nextDayData.expected_time,
          checklist: nextDayData.checklist || [],
          questions: (nextDayData.questions || []).map(q => ({
            id: q.id || q.question_id,
            question_id: q.question_id || q.id,
            question: q.question_text || q.question || "",
            question_image: q.question_image || "",
            question_level: q.question_level || "medium",
            topic: q.topic || nextDayData.topic,
            points: q.points || 0,
            solved: q.solved || false,
          })),
        }],
      };
    }
    return initialLearningPathData;
  }, [initialLearningPathData, nextDayData]);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // Active day index
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Track completed questions per day
  const [completedQuestions, setCompletedQuestions] = useState(() => {
    const stored = localStorage.getItem(`lp_completed_${planId}`);
    return stored ? JSON.parse(stored) : {};
  });

  // Track earned points
  const [earnedPoints, setEarnedPoints] = useState(() => {
    const stored = localStorage.getItem(`lp_points_${planId}`);
    return stored ? parseInt(stored, 10) : 0;
  });

  // Redirect if no learning path data
  useEffect(() => {
    if (!learningPathData || !learningPathData.daily_plans) {
      navigate("/exam-mode");
    }
  }, [learningPathData, navigate]);

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

  // Save progress to localStorage
  useEffect(() => {
    if (planId) {
      localStorage.setItem(`lp_completed_${planId}`, JSON.stringify(completedQuestions));
      localStorage.setItem(`lp_points_${planId}`, earnedPoints.toString());
    }
  }, [completedQuestions, earnedPoints, planId]);

  // Get difficulty color
  const getDifficultyColor = (level) => {
    const normalizedLevel = level?.toLowerCase() || "";
    if (normalizedLevel === "easy") return "success";
    if (normalizedLevel === "medium") return "warning";
    if (normalizedLevel === "hard") return "danger";
    return "secondary";
  };

  // Navigate between days
  const goToPreviousDay = () => {
    if (activeDayIndex > 0) setActiveDayIndex(activeDayIndex - 1);
  };

  const goToNextDay = () => {
    if (learningPathData?.daily_plans && activeDayIndex < learningPathData.daily_plans.length - 1) {
      setActiveDayIndex(activeDayIndex + 1);
    }
  };

  // Check if a question is completed
  const isQuestionCompleted = (dayIndex, questionId) => {
    const key = `${dayIndex}-${questionId}`;
    return completedQuestions[key] === true;
  };

  // Get day completion percentage
  const getDayCompletionPercentage = (dayIndex) => {
    const day = learningPathData?.daily_plans?.[dayIndex];
    if (!day?.questions || day.questions.length === 0) return 0;

    const completedCount = day.questions.filter((q) =>
      isQuestionCompleted(dayIndex, q.id || q.question_id)
    ).length;

    return Math.round((completedCount / day.questions.length) * 100);
  };

  // Get overall completion percentage
  const getOverallCompletionPercentage = () => {
    if (!learningPathData?.daily_plans) return 0;

    let totalQuestions = 0;
    let completedCount = 0;

    learningPathData.daily_plans.forEach((day, dayIndex) => {
      if (day.questions) {
        totalQuestions += day.questions.length;
        completedCount += day.questions.filter((q) =>
          isQuestionCompleted(dayIndex, q.id || q.question_id)
        ).length;
      }
    });

    return totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;
  };

  // Handle question click - navigate to question solving page
  const handleQuestionClick = (question, questionIndex, dayIndex) => {
    const activeDay = learningPathData.daily_plans[dayIndex];

    navigate("/learning-path-question", {
      state: {
        question: question.question || question.question_text || "",
        questionId: question.question_id,
        questionImage: question.question_image || "",
        questionLevel: question.question_level || "medium",
        topic: question.topic || activeDay.topic,
        dayNumber: activeDay.day_number || dayIndex + 1,
        dayTopic: activeDay.topic,
        planId,
        examId,
        class_id,
        subject_id,
        topic_ids,
        totalQuestionsInDay: activeDay.questions.length,
        currentQuestionIndex: questionIndex,
        allDayQuestions: activeDay.questions,
        learningPathData,
        learningPathForm,
        completedQuestions,
        activeDayIndex: dayIndex,
        nextDayData,
      },
    });
  };

  // Handle update from question completion
  const handleUpdateProgress = useCallback((questionId, dayIndex, points) => {
    const key = `${dayIndex}-${questionId}`;
    setCompletedQuestions((prev) => ({
      ...prev,
      [key]: true,
    }));
    setEarnedPoints((prev) => prev + (points || 0));
  }, []);

  // Handle back - go to exam mode or previous page
  const handleBackToResults = () => {
    // If we came from ExamMode (via nextDayData), go back to exam-mode
    if (nextDayData) {
      navigate("/exam-mode");
    } else {
      navigate(-1);
    }
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    navigate("/student-dash");
  };

  // if (!learningPathData || !learningPathData.daily_plans) {
  //   return (
  //     <div className={`learning-session-wrapper ${isDarkMode ? "dark-mode" : ""}`}>
  //       <div className="loading-container">
  //         <Spinner animation="border" />
  //         <p>Loading learning path...</p>
  //       </div>
  //     </div>
  //   );
  // }

  const activeDay = learningPathData.daily_plans[activeDayIndex];
  const totalDays = learningPathData.daily_plans.length;

  return (
    <div className={`learning-session-wrapper ${isDarkMode ? "dark-mode" : ""}`}>
      {/* Header Section */}
      <div className="session-header">
        <div className="header-left">
          <Button variant="outline-secondary" onClick={handleBackToResults} className="back-btn">
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back
          </Button>
        </div>
        <div className="header-center">
          <h1 className="session-title">
            <FontAwesomeIcon icon={faRoad} className="me-2" />
            Your Learning Journey
          </h1>
          <p className="session-subtitle">
            {learningPathForm?.total_days || totalDays} Day Study Plan
          </p>
        </div>
        <div className="header-right">
          <div className="points-badge">
            <FontAwesomeIcon icon={faStar} className="me-1" />
            <span>{earnedPoints} Points</span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {/* <Card className="progress-overview-card">
        <Card.Body>
          <div className="progress-stats">
            <div className="stat-item">
              <FontAwesomeIcon icon={faChartBar} className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">{getOverallCompletionPercentage()}%</span>
                <span className="stat-label">Overall Progress</span>
              </div>
            </div>
            <div className="stat-item">
              <FontAwesomeIcon icon={faCalendarAlt} className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">Day {activeDayIndex + 1} of {totalDays}</span>
                <span className="stat-label">Current Day</span>
              </div>
            </div>
            <div className="stat-item">
              <FontAwesomeIcon icon={faTrophy} className="stat-icon trophy" />
              <div className="stat-info">
                <span className="stat-value">{earnedPoints}</span>
                <span className="stat-label">Points Earned</span>
              </div>
            </div>
          </div>
          <ProgressBar
            now={getOverallCompletionPercentage()}
            variant={getOverallCompletionPercentage() === 100 ? "success" : "primary"}
            className="overall-progress-bar"
            animated={getOverallCompletionPercentage() < 100}
          />
        </Card.Body>
      </Card> */}

      {/* Gap Analysis Summary */}
      {learningPathData.gap_analysis && (
        <Card className="gap-analysis-card">
          <Card.Body>
            <h5 className="gap-title">
              <FontAwesomeIcon icon={faLightbulb} className="me-2" />
              Areas to Improve
            </h5>
            {learningPathData.gap_analysis.summary && (
              <p className="gap-summary">{learningPathData.gap_analysis.summary}</p>
            )}
            {learningPathData.gap_analysis.weak_concepts &&
              learningPathData.gap_analysis.weak_concepts.length > 0 && (
                <div className="weak-concepts-list">
                  {learningPathData.gap_analysis.weak_concepts.map((concept, idx) => (
                    <Badge key={idx} bg="warning" text="dark" className="concept-badge">
                      {concept}
                    </Badge>
                  ))}
                </div>
              )}
          </Card.Body>
        </Card>
      )}

      {/* Day Navigation */}
      <div className="day-navigation-section">
        <div className="day-nav-controls">
          <Button
            variant="link"
            className="day-nav-arrow"
            onClick={goToPreviousDay}
            disabled={activeDayIndex === 0}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </Button>

          <div className="day-pills-wrapper">
            {learningPathData.daily_plans.map((day, idx) => {
              const dayCompletion = getDayCompletionPercentage(idx);
              const isCompleted = dayCompletion === 100;
              const isCurrent = idx === activeDayIndex;

              return (
                <button
                  key={idx}
                  className={`day-pill ${isCurrent ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                  onClick={() => setActiveDayIndex(idx)}
                  title={`Day ${idx + 1}: ${day.topic} (${dayCompletion}% complete)`}
                >
                  {isCompleted ? (
                    <FontAwesomeIcon icon={faCheckCircle} />
                  ) : (
                    idx + 1
                  )}
                </button>
              );
            })}
          </div>

          <Button
            variant="link"
            className="day-nav-arrow"
            onClick={goToNextDay}
            disabled={activeDayIndex === totalDays - 1}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </Button>
        </div>

        {/* <div className="day-progress-indicator">
          <span className="day-label">Day {activeDayIndex + 1} Progress:</span>
          <ProgressBar
            now={getDayCompletionPercentage(activeDayIndex)}
            variant={getDayCompletionPercentage(activeDayIndex) === 100 ? "success" : "info"}
            className="day-progress-bar"
          />
          <span className="day-percentage">{getDayCompletionPercentage(activeDayIndex)}%</span>
        </div> */}
      </div>

      {/* Day Content */}
      <Card className="day-content-card">
        <Card.Body>
          {/* Day Header */}
          <div className="day-header">
            <div className="day-title-section">
              <Badge className="day-number-badge">
                Day {activeDay.day_number || activeDayIndex + 1}
              </Badge>
              <h2 className="day-topic">{activeDay.topic}</h2>
            </div>
            {activeDay.expected_time && (
              <div className="expected-time-badge">
                <FontAwesomeIcon icon={faClock} className="me-2" />
                {activeDay.expected_time}
              </div>
            )}
          </div>

          {/* What to Study */}
          {activeDay.what_to_study && (
            <div className="study-section">
              <h6 className="section-title">
                <FontAwesomeIcon icon={faBookOpen} className="me-2" />
                What to Study
              </h6>
              <div className="study-content">
                <MarkdownWithMath content={activeDay.what_to_study} />
              </div>
            </div>
          )}

          {/* Checklist */}
          {activeDay.checklist && activeDay.checklist.length > 0 && (
            <div className="checklist-section">
              <h6 className="section-title">
                <FontAwesomeIcon icon={faTasks} className="me-2" />
                Today's Checklist
              </h6>
              <ul className="study-checklist">
                {activeDay.checklist.map((item, idx) => (
                  <li key={idx} className="checklist-item">
                    <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                    <MarkdownWithMath content={item} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Practice Questions */}
          {activeDay.questions && activeDay.questions.length > 0 && (
            <div className="questions-section">
              <h6 className="section-title">
                <FontAwesomeIcon icon={faFire} className="me-2" />
                Practice Questions ({activeDay.questions.length})
              </h6>
              <div className="questions-grid">
                {activeDay.questions.map((question, qIdx) => {
                  const qId = question.id || question.question_id;
                  const isCompleted = isQuestionCompleted(activeDayIndex, qId);
                  const questionText = question.question || question.question_text || "";

                  return (
                    <Card
                      key={qIdx}
                      className={`question-card ${isCompleted ? "completed" : ""}`}
                      onClick={() => handleQuestionClick(question, qIdx, activeDayIndex)}
                    >
                      <Card.Body>
                        <div className="question-card-header">
                          <div className="question-meta">
                            <span className="question-number">Q{qIdx + 1}</span>
                            <Badge
                              bg={getDifficultyColor(question.question_level)}
                              className="difficulty-badge"
                            >
                              {question.question_level || "Medium"}
                            </Badge>
                            {question.topic && (
                              <Badge bg="secondary" className="topic-badge">
                                {question.topic}
                              </Badge>
                            )}
                          </div>
                          <div className="question-status">
                            {isCompleted ? (
                              <Badge bg="success" className="status-badge">
                                <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge bg="primary" className="status-badge start-badge">
                                <FontAwesomeIcon icon={faPlay} className="me-1" />
                                Start
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="question-preview">
                          <MarkdownWithMath
                            content={questionText}
                          />
                        </div>
                        {question.question_image && (
                          <div className="question-has-image">
                            <Badge bg="info" className="image-badge">
                              Has Image
                            </Badge>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Bottom Navigation */}
      <div className="bottom-navigation">
        <Button
          variant="outline-secondary"
          onClick={goToPreviousDay}
          disabled={activeDayIndex === 0}
          className="nav-btn prev-btn"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="me-2" />
          Previous Day
        </Button>

        <Button
          variant="outline-primary"
          onClick={handleBackToDashboard}
          className="nav-btn home-btn"
        >
          <FontAwesomeIcon icon={faHome} className="me-2" />
          Dashboard
        </Button>

        <Button
          variant="primary"
          onClick={goToNextDay}
          disabled={activeDayIndex === totalDays - 1}
          className="nav-btn next-btn"
        >
          Next Day
          <FontAwesomeIcon icon={faChevronRight} className="ms-2" />
        </Button>
      </div>
    </div>
  );
}

export default LearningPathSession;
