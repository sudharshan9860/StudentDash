// ExamMode.jsx - Exam creation and setup component
import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { Form, Button, Row, Col, Container, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSchool,
  faBookOpen,
  faListAlt,
  faClipboardList,
  faRocket,
  faClock,
  faFileAlt,
  faExclamationTriangle,
  faHistory,
  faCheckCircle,
  faTimesCircle,
  faTrophy,
  faArrowRight,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "./AuthContext";
import { useAlert } from "./AlertBox";
import axiosInstance from "../api/axiosInstance";
import "./ExamMode.css";

// API endpoints
const API_ENDPOINTS = {
  CLASSES: "/classes/",
  SUBJECTS: "/subjects/",
  CHAPTERS: "/chapters/",
  GENERATE_EXAM: "/generate-exam/",
  LEARNING_PATH_LIST: "/learning-plan-list/",
  LEARNING_PATH_NEXT_DAY: "/learning-path-next-day/",
};

function ExamMode() {
  const navigate = useNavigate();
  const { username, fullName } = useContext(AuthContext);
  const { showAlert, AlertContainer } = useAlert();

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // State for dropdown selections
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  // Selected values
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapters, setSelectedChapters] = useState([]);

  // Exam settings - duration in minutes (30 to 60)
  const [examDurationMinutes, setExamDurationMinutes] = useState(30);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Learning path history
  const [learningPathList, setLearningPathList] = useState([]);
  const [isLoadingLearningPath, setIsLoadingLearningPath] = useState(false);
  const [loadingJourneyId, setLoadingJourneyId] = useState(null);

  // Extract class from username (e.g., 10HPS24 -> 10, 12ABC24 -> 12)
  const extractClassFromUsername = (username) => {
    if (!username) return "";
    const firstTwo = username.substring(0, 2);
    if (!isNaN(firstTwo)) {
      return firstTwo;
    }
    const firstOne = username.charAt(0);
    if (!isNaN(firstOne)) {
      return firstOne;
    }
    return "";
  };

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

  // Fetch classes from API on mount
  useEffect(() => {
    async function fetchClasses() {
      try {
        setIsLoadingData(true);
        const response = await axiosInstance.get(API_ENDPOINTS.CLASSES);
        const classesData = response.data.data || [];
        setClasses(classesData);

        // Set default class based on username
        const defaultClass = extractClassFromUsername(username);
        if (defaultClass) {
          const matchingClass = classesData.find(
            (cls) => cls.class_name.includes(defaultClass) || cls.class_code === defaultClass
          );
          if (matchingClass) {
            setSelectedClass(matchingClass.class_code);
          }
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
        showAlert("Failed to load classes. Please refresh the page.", "error");
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchClasses();
  }, [username]);

  // Fetch subjects from API when class changes
  useEffect(() => {
    async function fetchSubjects() {
      if (!selectedClass) {
        setSubjects([]);
        setSelectedSubject("");
        setChapters([]);
        setSelectedChapters([]);
        return;
      }

      try {
        setIsLoadingData(true);
        const response = await axiosInstance.post(API_ENDPOINTS.SUBJECTS, {
          class_id: selectedClass,
        });
        const subjectsData = response.data.data || [];
        setSubjects(subjectsData);

        // Reset dependent fields
        setSelectedSubject("");
        setSelectedChapters([]);
        setChapters([]);

        // Auto-select Math if available
        const mathSubject = subjectsData.find((s) =>
          s.subject_name.toLowerCase().includes("math")
        );
        if (mathSubject) {
          setSelectedSubject(mathSubject.subject_code);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchSubjects();
  }, [selectedClass]);

  // Fetch chapters from API when subject changes
  useEffect(() => {
    async function fetchChapters() {
      if (!selectedSubject || !selectedClass) {
        setChapters([]);
        setSelectedChapters([]);
        return;
      }

      try {
        setIsLoadingData(true);
        const response = await axiosInstance.post(API_ENDPOINTS.CHAPTERS, {
          subject_id: selectedSubject,
          class_id: selectedClass,
        });

        const chaptersData = response.data.data || [];
        setChapters(chaptersData);
        setSelectedChapters([]);
      } catch (error) {
        console.error("Error fetching chapters:", error);
        setChapters([]);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchChapters();
  }, [selectedSubject, selectedClass]);

  // Fetch learning path list on mount
  useEffect(() => {
    async function fetchLearningPathList() {
      try {
        setIsLoadingLearningPath(true);
        const response = await axiosInstance.get(API_ENDPOINTS.LEARNING_PATH_LIST);
        const exams = response.data?.exams || [];
        setLearningPathList(exams);
      } catch (error) {
        console.error("Error fetching learning path list:", error);
      } finally {
        setIsLoadingLearningPath(false);
      }
    }
    fetchLearningPathList();
  }, []);

  // Format date for display
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Calculate score percentage
  const calculateScorePercentage = useCallback((obtained, total) => {
    if (total === 0) return 0;
    return Math.round((obtained / total) * 100);
  }, []);

  // Handle journey item click - fetch next day and navigate to learning path session
  const handleJourneyClick = useCallback(async (exam) => {
    // Only allow click if plan is created
    if (!exam.plan_created || !exam.plan_id) {
      showAlert("No learning plan exists for this exam. Complete an exam and generate a learning path first.", "warning");
      return;
    }

    setLoadingJourneyId(exam.exam_id);

    try {
      const formData = new FormData();
      formData.append("plan_id", exam.plan_id);

      const response = await axiosInstance.post(API_ENDPOINTS.LEARNING_PATH_NEXT_DAY, formData);

      if (response.data) {
        // Navigate to learning path session with the response data
        navigate("/learning-path-session", {
          state: {
            learningPathData: {
              daily_plans: [{
                day_number: response.data.next_day,
                topic: response.data.topic,
                what_to_study: response.data.what_to_study,
                expected_time: response.data.expected_time,
                checklist: response.data.checklist,
                questions: response.data.questions,
              }],
            },
            planId: response.data.plan_id,
            examId: exam.exam_id,
            class_id: exam.class_code,
            subject_id: exam.subject_code,
            topic_ids: exam.topic_ids,
            currentDay: response.data.next_day,
            nextDayData: response.data,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching learning path next day:", error);
      showAlert(
        error.response?.data?.error || "Failed to load learning path. Please try again.",
        "error"
      );
    } finally {
      setLoadingJourneyId(null);
    }
  }, [navigate, showAlert]);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return selectedClass && selectedSubject && selectedChapters.length > 0;
  }, [selectedClass, selectedSubject, selectedChapters]);

  // Transform API response to match expected question format
  const transformApiQuestions = useCallback((apiQuestions) => {
    if (!apiQuestions || !Array.isArray(apiQuestions)) {
      return [];
    }

    return apiQuestions.map((q, index) => ({
      id: q.id,
      question_id: `${String(q.id)}`,
      question: q.question,
      question_level: q.question_level || "Medium",
      question_image: null,
      context: null,
      options: [], // API returns subjective questions without options
      correct_answer: null, // No predefined answer for subjective questions
      marks: q.question_level === "Hard" ? 3 : q.question_level === "Medium" ? 2 : 1,
      topic: q.topic,
      isSubjective: true, // Flag to indicate this is a subjective question
    }));
  }, []);

  // Generate exam questions via API
  const generateExamQuestionsAPI = useCallback(async () => {
    const formData = new FormData();
    formData.append("class_id", selectedClass);
    formData.append("subject_id", selectedSubject);
    
    // chapters → append each value separately
    selectedChapters.forEach((ch) => {
      formData.append("chapters", ch);
    });
    
    // If you want exactly 5 questions per chapter – add if required
    // formData.append("questions_per_chapter", 5);
    
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.GENERATE_EXAM,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    

      if (response.data?.exam_questions) {
        return {
          success: true,
          questions: transformApiQuestions(response.data.exam_questions),
        };
      }

      return {
        success: false,
        error: "Invalid response format from server",
      };
    } catch (error) {
      console.error("Error generating exam questions:", error);
      return {
        success: false,
        error: error.message || "Failed to generate exam questions. Please try again.",
      };
    }
  }, [selectedClass, selectedSubject, selectedChapters, transformApiQuestions]);

  // Get metadata for exam
  const getExamMetadata = useCallback(() => {
    // Map chapter IDs to names (API returns topic_code and name fields)
    const chapterNames = selectedChapters.map((chapterId) => {
      const chapter = chapters.find((ch) => ch.topic_code === chapterId);
      return chapter ? chapter.name : "Unknown Chapter";
    });

    // Get subject name from subjects list
    const subjectName =
      subjects.find((s) => s.subject_code === selectedSubject)?.subject_name || "Unknown Subject";

    // Get class name from classes list
    const className =
      classes.find((c) => c.class_code === selectedClass)?.class_name || "Unknown Class";

    return {
      classId: selectedClass,
      className,
      subjectId: selectedSubject,
      subjectName,
      chapterIds: selectedChapters,
      chapterNames,
      // Include IDs for exam-process API
      class_id: selectedClass,
      subject_id: selectedSubject,
      chapters: selectedChapters,
    };
  }, [selectedClass, selectedSubject, selectedChapters, chapters, subjects, classes]);

  // Handle exam start
  const handleStartExam = async () => {
    // Validate form
    if (!isFormValid()) {
      showAlert("Please fill in all required fields", "error");
      return;
    }

    // Reset error state and set loading
    setApiError(null);
    setIsLoading(true);

    try {
      // Call API to generate questions
      const result = await generateExamQuestionsAPI();

      if (!result.success) {
        setApiError(result.error);
        showAlert(result.error, "error");
        return;
      }

      // Validate we have questions
      if (!result.questions || result.questions.length === 0) {
        const errorMsg = "No questions available for the selected chapters. Please try different chapters.";
        setApiError(errorMsg);
        showAlert(errorMsg, "error");
        return;
      }

      // Get metadata
      const metadata = getExamMetadata();

      // Navigate to exam question page
      navigate("/exam-question", {
        state: {
          questions: result.questions,
          examSettings: {
            examDurationMinutes: examDurationMinutes,
            totalDurationSeconds: examDurationMinutes * 60,
          },
          metadata,
          startTime: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Unexpected error starting exam:", error);
      const errorMsg = "An unexpected error occurred. Please try again.";
      setApiError(errorMsg);
      showAlert(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Select styles for dark mode
  const selectStyles = useMemo(
    () => ({
      control: (provided, state) => ({
        ...provided,
        backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
        borderColor: state.isFocused
          ? isDarkMode
            ? "#7c3aed"
            : "#667eea"
          : isDarkMode
          ? "#475569"
          : "#e2e8f0",
        color: isDarkMode ? "#f1f5f9" : "#2d3748",
        minHeight: "56px",
        border: `2px solid ${
          state.isFocused
            ? isDarkMode
              ? "#7c3aed"
              : "#667eea"
            : isDarkMode
            ? "#475569"
            : "#e2e8f0"
        }`,
        borderRadius: "12px",
        boxShadow: state.isFocused
          ? `0 0 0 4px ${isDarkMode ? "rgba(124, 58, 237, 0.1)" : "rgba(102, 126, 234, 0.1)"}`
          : "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          borderColor: isDarkMode ? "#6366f1" : "#5a67d8",
        },
      }),
      menuPortal: (provided) => ({
        ...provided,
        zIndex: 10000,
      }),
      menu: (provided) => ({
        ...provided,
        backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
        zIndex: 10000,
        borderRadius: "12px",
        border: `2px solid ${isDarkMode ? "#7c3aed" : "#667eea"}`,
        boxShadow: isDarkMode
          ? "0 25px 50px -12px rgba(0, 0, 0, 0.9)"
          : "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      }),
      menuList: (provided) => ({
        ...provided,
        maxHeight: "300px",
        padding: "8px",
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused
          ? isDarkMode
            ? "#7c3aed"
            : "#667eea"
          : state.isSelected
          ? isDarkMode
            ? "#6366f1"
            : "#5a67d8"
          : isDarkMode
          ? "#1e293b"
          : "#ffffff",
        color: state.isFocused || state.isSelected ? "#ffffff" : isDarkMode ? "#f1f5f9" : "#2d3748",
        padding: "12px 16px",
        cursor: "pointer",
        borderRadius: "8px",
        margin: "2px 0",
      }),
      multiValue: (provided) => ({
        ...provided,
        backgroundColor: isDarkMode ? "#6366f1" : "#667eea",
        borderRadius: "8px",
      }),
      multiValueLabel: (provided) => ({
        ...provided,
        color: "#ffffff",
        fontWeight: "600",
        padding: "4px 8px",
      }),
      multiValueRemove: (provided) => ({
        ...provided,
        color: "#ffffff",
        "&:hover": {
          backgroundColor: "#ef4444",
          color: "#ffffff",
        },
      }),
      placeholder: (provided) => ({
        ...provided,
        color: isDarkMode ? "#94a3b8" : "#6b7280",
      }),
      singleValue: (provided) => ({
        ...provided,
        color: isDarkMode ? "#f1f5f9" : "#2d3748",
      }),
    }),
    [isDarkMode]
  );

  return (
    <>
      <AlertContainer />
      <div className={`exam-mode-wrapper ${isDarkMode ? "dark-mode" : ""}`}>
        <Container className="py-4">
          {/* Header */}
          <div className="exam-mode-header">
            <h1>
              <FontAwesomeIcon icon={faClipboardList} className="me-3" />
              Create Exam
            </h1>
            <p>Select your class, subject, and chapters to generate an exam</p>
          </div>

          {/* Exam Setup Card */}
          <Card className="exam-setup-card">
            <Card.Body>
              <Form>
                <Row className="form-row">
                  {/* Class Selection */}
                  <Col md={6}>
                    <Form.Group controlId="formClass">
                      <Form.Label>
                        <FontAwesomeIcon icon={faSchool} className="me-2" />
                        Class
                      </Form.Label>
                      <Form.Control
                        as="select"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="form-control-enhanced"
                        disabled={isLoadingData && classes.length === 0}
                      >
                        <option value="">{isLoadingData && classes.length === 0 ? "Loading..." : "Select Class"}</option>
                        {classes.map((cls) => (
                          <option key={cls.class_code} value={cls.class_code}>
                            {cls.class_name}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>

                  {/* Subject Selection */}
                  <Col md={6}>
                    <Form.Group controlId="formSubject">
                      <Form.Label>
                        <FontAwesomeIcon icon={faBookOpen} className="me-2" />
                        Subject
                      </Form.Label>
                      <Form.Control
                        as="select"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="form-control-enhanced"
                        disabled={!selectedClass || (isLoadingData && subjects.length === 0)}
                      >
                        <option value="">{isLoadingData && subjects.length === 0 && selectedClass ? "Loading..." : "Select Subject"}</option>
                        {subjects.map((subject) => (
                          <option key={subject.subject_code} value={subject.subject_code}>
                            {subject.subject_name}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="form-row">
                  {/* Chapter Selection */}
                  <Col className="mx-2">
                    <Form.Group controlId="formChapters">
                      <Form.Label>
                        <FontAwesomeIcon icon={faListAlt} className="me-2" />
                        Chapters (Select Multiple) {chapters.length > 0 && `- ${chapters.length} Available`}
                      </Form.Label>
                      <Select
                        isMulti
                        value={selectedChapters.map((chapterCode) => {
                          const chapter = chapters.find((ch) => ch.topic_code === chapterCode);
                          return chapter
                            ? { value: chapter.topic_code, label: chapter.name }
                            : null;
                        }).filter(Boolean)}
                        onChange={(selectedOptions) => {
                          const values = selectedOptions
                            ? selectedOptions.map((option) => option.value)
                            : [];
                          setSelectedChapters(values);
                        }}
                        options={chapters.map((chapter) => ({
                          value: chapter.topic_code,
                          label: chapter.name,
                        }))}
                        placeholder={isLoadingData && chapters.length === 0 && selectedSubject ? "Loading chapters..." : "Select chapters..."}
                        isDisabled={!selectedSubject || (isLoadingData && chapters.length === 0)}
                        isLoading={isLoadingData && chapters.length === 0 && selectedSubject}
                        className="chapters-select"
                        classNamePrefix="select"
                        closeMenuOnSelect={false}
                        isSearchable={true}
                        isClearable={true}
                        menuPortalTarget={document.body}
                        styles={selectStyles}
                      />
                      {/* Clear selection button */}
                      {selectedChapters.length > 0 && (
                        <div className="mt-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setSelectedChapters([])}
                            style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px" }}
                          >
                            Clear ({selectedChapters.length})
                          </Button>
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Exam Duration Slider */}
                <Row className="form-row mt-4">
                  <Col md={12} className="px-3">
                    <Form.Group controlId="formDuration">
                      <Form.Label>
                        <FontAwesomeIcon icon={faClock} className="me-2" />
                        Exam Duration: <strong>{examDurationMinutes} minutes</strong>
                      </Form.Label>
                      <div className="duration-slider-container">
                        <Form.Range
                          value={examDurationMinutes}
                          onChange={(e) => setExamDurationMinutes(parseInt(e.target.value))}
                          min={30}
                          max={60}
                          step={5}
                          className="duration-slider"
                        />
                        <div className="duration-labels">
                          <span>30 min</span>
                          <span>35 min</span>
                          <span>40 min</span>
                          <span>45 min</span>
                          <span>50 min</span>
                          <span>55 min</span>
                          <span>60 min</span>
                        </div>
                      </div>
                      <Form.Text className="text-muted">
                        Slide to select exam duration (30 - 60 minutes)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Exam Info Summary */}
                {isFormValid() && (
                  <div className="exam-summary mt-4">
                    <h5>
                      <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                      Exam Summary
                    </h5>
                    <Row>
                      <Col md={6}>
                        <div className="summary-item">
                          <span className="summary-label">Total Duration</span>
                          <span className="summary-value">{examDurationMinutes} min</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="summary-item">
                          <span className="summary-label">Chapters Selected</span>
                          <span className="summary-value">{selectedChapters.length}</span>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Error Display */}
                {apiError && (
                  <div className="api-error-message mt-3">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                    {apiError}
                  </div>
                )}

                {/* Start Exam Button */}
                <div className="exam-actions mt-4">
                  <Button
                    className="btn-start-exam"
                    onClick={handleStartExam}
                    disabled={!isFormValid() || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faRocket} className="me-2" />
                        Start Exam
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Previous Learning Journeys Section */}
          <Card className="learning-journey-card mt-4">
            <Card.Body>
              <h4 className="learning-journey-title">
                <FontAwesomeIcon icon={faHistory} className="me-2" />
                Previous Learning Journeys
              </h4>

              {isLoadingLearningPath ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Loading your learning history...</p>
                </div>
              ) : learningPathList.length === 0 ? (
                <div className="no-journeys-message">
                  <FontAwesomeIcon icon={faClipboardList} className="no-journeys-icon" />
                  <p>No previous exams found. Start your first exam above!</p>
                </div>
              ) : (
                <div className="learning-journey-list">
                  {learningPathList.map((exam) => {
                    const scorePercentage = calculateScorePercentage(exam.obtained_marks, exam.total_marks);
                    const isLoading = loadingJourneyId === exam.exam_id;
                    const hasLearningPath = exam.plan_created && exam.plan_id;
                    return (
                      <div
                        key={exam.exam_id}
                        className={`journey-item ${hasLearningPath ? 'clickable' : 'disabled'} ${isLoading ? 'loading' : ''}`}
                        onClick={() => !isLoading && handleJourneyClick(exam)}
                        role={hasLearningPath ? "button" : undefined}
                        tabIndex={hasLearningPath ? 0 : undefined}
                        onKeyDown={(e) => {
                          if (hasLearningPath && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            handleJourneyClick(exam);
                          }
                        }}
                      >
                        {isLoading && (
                          <div className="journey-loading-overlay">
                            <Spinner animation="border" variant="primary" />
                            <span>Loading learning path...</span>
                          </div>
                        )}
                        <div className="journey-item-header">
                          <div className="journey-info">
                            <span className="journey-exam-id">Exam #{exam.exam_id}</span>
                            <span className="journey-date">
                              <FontAwesomeIcon icon={faClock} className="me-1" />
                              {formatDate(exam.submitted_at)}
                            </span>
                          </div>
                          <div className="journey-status">
                            {exam.plan_created ? (
                              <span className="status-badge plan-created">
                                <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                Plan Created
                              </span>
                            ) : (
                              <span className="status-badge no-plan">
                                <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                                No Plan
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="journey-item-body">
                          <Row>
                            <Col xs={6} md={3}>
                              <div className="journey-stat">
                                <span className="stat-label">Class</span>
                                <span className="stat-value">{exam.class_code}</span>
                              </div>
                            </Col>
                            <Col xs={6} md={3}>
                              <div className="journey-stat">
                                <span className="stat-label">Subject</span>
                                <span className="stat-value">{exam.subject_code}</span>
                              </div>
                            </Col>
                            <Col xs={6} md={3}>
                              <div className="journey-stat">
                                <span className="stat-label">Questions</span>
                                <span className="stat-value">{exam.total_questions}</span>
                              </div>
                            </Col>
                            <Col xs={6} md={3}>
                              <div className="journey-stat">
                                <span className="stat-label">Score</span>
                                <span className={`stat-value score ${scorePercentage >= 70 ? 'high' : scorePercentage >= 40 ? 'medium' : 'low'}`}>
                                  <FontAwesomeIcon icon={faTrophy} className="me-1" />
                                  {exam.obtained_marks}/{exam.total_marks} ({scorePercentage}%)
                                </span>
                              </div>
                            </Col>
                          </Row>

                          <div className="journey-topics mt-2">
                            <span className="topics-label">Topics:</span>
                            <span className="topics-value">
                              {exam.topic_ids.join(", ")}
                            </span>
                          </div>
                        </div>

                        {/* Continue Learning Button for items with learning path */}
                        {hasLearningPath && (
                          <div className="journey-action">
                            <Button
                              variant="success"
                              size="sm"
                              className="continue-learning-btn"
                              disabled={isLoading}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJourneyClick(exam);
                              }}
                            >
                              {isLoading ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-1" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon icon={faPlay} className="me-1" />
                                  Continue Learning
                                  <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
}

export default ExamMode;
