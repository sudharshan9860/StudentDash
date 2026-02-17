// ExamCorrection.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "./ExamCorrection.css";

const ExamCorrection = () => {
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef(null);

  // STEP 1: Correction mode selection
  const [correctionMode, setCorrectionMode] = useState(null); // null | 'new' | 'existing'

  // STEP 2A: For existing correction - exam selection
  const [existingExams, setExistingExams] = useState([]);
  const [selectedExistingExam, setSelectedExistingExam] = useState(null);
  const [loadingExams, setLoadingExams] = useState(false);

  // NEW: Upload mode selection
  const [uploadMode, setUploadMode] = useState("individual"); // 'individual' | 'group'

  // Form state (used for both modes)
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [rollNumberPattern, setRollNumberPattern] = useState(".*");
  const [maxWorkers, setMaxWorkers] = useState(5);
  const [questionPaper, setQuestionPaper] = useState(null);
  const [answerSheets, setAnswerSheets] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("Ready to process");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Teacher info
  const [teacherName, setTeacherName] = useState("");

  // NEW: Exam name validation states
  const [existingExamNames, setExistingExamNames] = useState([]);
  const [isCheckingExamName, setIsCheckingExamName] = useState(false);
  const [examNameExists, setExamNameExists] = useState(false);
  const [examNameWarning, setExamNameWarning] = useState("");

  // Debounce timer ref
  const examNameDebounceRef = useRef(null);

  useEffect(() => {
    // Get teacher name from localStorage
    const fullName = localStorage.getItem("fullName");
    const username = localStorage.getItem("username");
    setTeacherName(fullName || username || "");
  }, []);

  // Fetch existing exams when user selects "existing" mode
  useEffect(() => {
    if (correctionMode === "existing") {
      fetchExistingExams();
    }
  }, [correctionMode]);

  // Cleanup timeout on unmount
  useEffect(() => {
    let redirectTimeout;

    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (examNameDebounceRef.current) {
        clearTimeout(examNameDebounceRef.current);
      }
    };
  }, []);

  // Fetch list of existing exam names for duplicate checking
  const fetchExistingExamNames = async () => {
    console.log("🚀 fetchExistingExamNames - START");

    try {
      setIsCheckingExamName(true);

      console.log("📡 Making API call to /api/teacher-exam-names/");
      const response = await axiosInstance.get("/api/teacher-exam-names/");

      console.log("📥 Raw response:", response);
      console.log("📥 Response data:", response.data);
      console.log("📥 Response data type:", typeof response.data);

      // More defensive extraction
      let examNames = [];

      if (response.data) {
        if (Array.isArray(response.data.exam_names)) {
          examNames = response.data.exam_names;
          console.log("✅ Found exam_names array:", examNames);
        } else if (Array.isArray(response.data)) {
          examNames = response.data;
          console.log("✅ Response data is array:", examNames);
        } else {
          console.warn("⚠️ Unexpected response format:", response.data);
        }
      }

      console.log("📋 Extracted exam names:", examNames);
      console.log("📊 Count:", examNames.length);

      // Save to state
      setExistingExamNames(examNames);

      // VERIFY state was set
      console.log("💾 State updated with:", examNames);
    } catch (error) {
      console.error("❌ Error fetching exam names:", error);
      console.error("❌ Error response:", error.response);
      setExistingExamNames([]);
    } finally {
      setIsCheckingExamName(false);
      console.log("✅ fetchExistingExamNames - COMPLETE");
    }
  };

  const checkExamNameAvailability = (name) => {
    console.log("🔍 checkExamNameAvailability called with:", name);

    if (examNameDebounceRef.current) {
      console.log("⏱️ Clearing previous timeout");
      clearTimeout(examNameDebounceRef.current);
    }

    if (!name.trim()) {
      console.log("🧹 Empty name - clearing validation");
      setExamNameExists(false);
      setExamNameWarning("");
      return;
    }

    console.log("⏱️ Setting timeout (500ms)");

    examNameDebounceRef.current = setTimeout(() => {
      console.log("⏰ Timeout fired! Checking name:", name);

      // ✅ ADD THIS - Get fresh state
      console.log("🔍 Current existingExamNames state:", existingExamNames);
      console.log("📋 Existing names array:", existingExamNames);
      console.log("📊 Array length:", existingExamNames.length);

      if (existingExamNames.length === 0) {
        console.warn("⚠️ No exam names loaded - cannot validate!");
        console.warn("⚠️ User will be allowed to proceed");
        setExamNameExists(false);
        setExamNameWarning("");
        return;
      }

      const searchName = name.trim().toLowerCase();
      console.log("🎯 Searching for (lowercase):", searchName);

      let foundMatch = false;

      for (let i = 0; i < existingExamNames.length; i++) {
        const existingName = existingExamNames[i].trim().toLowerCase();
        const isMatch = existingName === searchName;

        console.log(
          `  [${i}] "${existingName}" === "${searchName}" = ${isMatch}`,
        );

        if (isMatch) {
          console.log(`  ✅ MATCH FOUND at index ${i}!`);
          foundMatch = true;
          break;
        }
      }

      console.log("🏁 FINAL RESULT:", foundMatch ? "DUPLICATE" : "AVAILABLE");

      if (foundMatch) {
        setExamNameExists(true);
        setExamNameWarning(
          `⚠️ Exam name "${name.trim()}" already exists. Please use a different name.`,
        );
        console.log("🚫 Duplicate name detected!");
      } else {
        setExamNameExists(false);
        setExamNameWarning("");
        console.log("✅ Exam name is available!");
      }
    }, 500);
  };

  // Fetch exam names when entering NEW correction mode
  // Fetch exam names when entering NEW correction mode
  useEffect(() => {
    if (correctionMode === "new") {
      console.log("🔄 Fetching exam names for validation...");
      fetchExistingExamNames();
    } else {
      // Reset validation states when leaving new mode
      setExistingExamNames([]);
      setExamNameExists(false);
      setExamNameWarning("");
      console.log("🧹 Cleared exam name validation");
    }
  }, [correctionMode]);

  // Verify state after it's set
  useEffect(() => {
    console.log("🔍 existingExamNames state changed:", existingExamNames);
    console.log("📊 Current length:", existingExamNames.length);
  }, [existingExamNames]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (examNameDebounceRef.current) {
        clearTimeout(examNameDebounceRef.current);
        console.log("🧹 Cleaned up debounce timer");
      }
    };
  }, []);

  // Fetch list of existing exams for the teacher
  const fetchExistingExams = async () => {
    try {
      setLoadingExams(true);
      setError(null);

      // Using the same API as ExamAnalytics
      const response = await axiosInstance.get("/exam-details/");
      const examsData = response.data.exams || [];

      setExistingExams(examsData);

      if (examsData.length === 0) {
        setError("No existing exams found. Please create a new exam instead.");
      }
    } catch (error) {
      console.error("Error fetching existing exams:", error);
      setError("Failed to fetch existing exams. Please try again.");
    } finally {
      setLoadingExams(false);
    }
  };

  // Handle existing exam selection
  const handleExistingExamSelect = (exam) => {
    setSelectedExistingExam(exam);
    // Pre-fill form with existing exam data
    setExamName(exam.name);
    setExamType(exam.exam_type);
    setClassName(exam.class_section.split("-")[0] || "");
    setSection(exam.class_section.split("-")[1] || "");
    setError(null);
  };

  // Handle question paper file selection
  const handleQuestionPaperChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF)
      if (file.type !== "application/pdf") {
        setError("Question paper must be a PDF file");
        return;
      }
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError("Question paper file size must be less than 100MB");
        return;
      }
      setQuestionPaper(file);
      setError(null);
    }
  };

  // Handle answer sheets file selection (supports adding multiple files incrementally)
  const handleAnswerSheetsChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate files
    const invalidFiles = files.filter((file) => {
      return file.type !== "application/pdf" || file.size > 100 * 1024 * 1024;
    });

    if (invalidFiles.length > 0) {
      setError("All answer sheets must be PDF files under 100MB each");
      return;
    }

    // Append new files to existing ones (avoid duplicates by name)
    setAnswerSheets((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const newFiles = files.filter((f) => !existingNames.has(f.name));
      return [...prev, ...newFiles];
    });
    setError(null);

    // Reset the input so the same file can be selected again if needed
    e.target.value = "";
  };

  // Remove question paper
  const handleRemoveQuestionPaper = () => {
    setQuestionPaper(null);
  };

  // Remove specific answer sheet
  const handleRemoveAnswerSheet = (index) => {
    setAnswerSheets((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all answer sheets
  const handleClearAllAnswerSheets = () => {
    setAnswerSheets([]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!examName.trim()) {
      setError("Please enter exam name");
      return;
    }

    if (correctionMode === "new" && examNameExists) {
      setError("Exam name already exists. Please use a different name.");
      return;
    }

    if (!className.trim()) {
      setError("Please enter class name");
      return;
    }

    // For NEW correction: question paper is required
    // For EXISTING correction: question paper is optional (can reuse existing one)
    if (correctionMode === "new" && !questionPaper) {
      setError("Please upload question paper");
      return;
    }

    if (answerSheets.length === 0) {
      setError("Please upload at least one answer sheet");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      setProcessingStatus("Uploading files...");
      setUploadProgress(0);

      // Create FormData
      const formData = new FormData();

      // Common fields
      formData.append("exam_name", examName.trim());
      formData.append("exam_type", examType);
      formData.append("teacher_name", teacherName);
      formData.append("class_name", className.trim());
      formData.append("section", section.trim());
      formData.append("roll_number_pattern", rollNumberPattern);
      formData.append("max_workers", maxWorkers.toString());
      formData.append("upload_mode", uploadMode);

      // NEW: Add exam_id if this is an existing correction
      if (correctionMode === "existing" && selectedExistingExam) {
        formData.append("exam_id", selectedExistingExam.id.toString());
        formData.append("is_additional_correction", "true");
      }

      // Append question paper (only if provided - for existing, it's optional)
      if (questionPaper) {
        formData.append("question_paper", questionPaper);
      }

      // Append answer sheets
      answerSheets.forEach((sheet) => {
        formData.append("answer_sheets", sheet);
      });

      // NEW: Determine API endpoint based on upload mode
      const apiEndpoint =
        uploadMode === "group"
          ? "api/exam-correction-group/"
          : "api/exam-correction/";

      // Make API call with progress tracking
      const response = await axiosInstance.post(apiEndpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percentCompleted);
        },
      });

      setSuccess(true);

      if (correctionMode === "existing") {
        setProcessingStatus("Adding additional students to existing exam...");
      } else {
        setProcessingStatus("Processing exam in background...");
      }

      // Redirect to analytics after 3 seconds
      // setTimeout(() => {
      //   if (window.handleExamAnalyticsView) {
      //     window.handleExamAnalyticsView();
      //   }
      // }, 3000);
    } catch (error) {
      console.error("Error submitting exam correction:", error);
      setError(
        error.response?.data?.detail ||
          error.message ||
          "Failed to submit exam correction. Please try again.",
      );
      setProcessingStatus("Ready to process");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // Reset form
  const handleReset = () => {
    setExamName("");
    setExamType("");
    setClassName("");
    setSection("");
    setRollNumberPattern(".*");
    setMaxWorkers(5);
    setQuestionPaper(null);
    setAnswerSheets([]);
    setError(null);
    setSuccess(false);
    setProcessingStatus("Ready to process");
    setSelectedExistingExam(null);
    setUploadMode("individual");
    setExamNameExists(false);
    setExamNameWarning("");
    setIsCheckingExamName(false);
    setExistingExamNames([]);
  };

  // Go back to mode selection
  const handleBackToModeSelection = () => {
    setCorrectionMode(null);
    handleReset();
  };

  // ==========================================
  // STEP 1: MODE SELECTION VIEW (SIDE BY SIDE)
  // ==========================================
  if (correctionMode === null) {
    return (
      <div className="exam-correction-container">
        <div className="exam-correction-header">
          <div className="header-content">
            <div className="header-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <path d="M9 15l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="correction-header-title">
                📝 Exam Correction Hub
              </h1>
              <p className="header-subtitle">
                Choose correction mode to get started
              </p>
            </div>
          </div>
          <button
            className="view-analytics-btn"
            onClick={() => {
              if (window.handleExamAnalyticsView) {
                window.handleExamAnalyticsView();
              }
            }}
          >
            <span>📊</span>
            View Analytics
          </button>
        </div>

        <div className="mode-selection-container">
          {/* Side-by-Side Mode Cards */}
          <div className="mode-cards-wrapper">
            {/* NEW CORRECTION CARD */}
            <div
              className="mode-card mode-card-new"
              onClick={() => setCorrectionMode("new")}
            >
              <div className="mode-card-icon">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <h2 className="mode-card-title">New Correction</h2>
              <p className="mode-card-description">
                Start a brand new exam correction with question paper and answer
                sheets
              </p>
              <ul className="mode-card-features">
                <li>
                  <span className="check-icon">✓</span> Upload new question
                  paper
                </li>
                <li>
                  <span className="check-icon">✓</span> Upload all student
                  answer sheets
                </li>
                <li>
                  <span className="check-icon">✓</span> Create new exam entry
                </li>
                <li>
                  <span className="check-icon">✓</span> Full automated grading
                </li>
              </ul>
              <button className="mode-card-btn mode-card-btn-new">
                Select New Correction →
              </button>
            </div>

            {/* EXISTING CORRECTION CARD */}
            <div
              className="mode-card mode-card-existing"
              onClick={() => setCorrectionMode("existing")}
            >
              <div className="mode-card-icon">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <path d="M9 15l2 2 4-4" />
                </svg>
              </div>
              <h2 className="mode-card-title">Add to Existing Exam</h2>
              <p className="mode-card-description">
                Add more students to an existing exam (batch processing)
              </p>
              <ul className="mode-card-features">
                <li>
                  <span className="check-icon">✓</span> Select existing exam
                </li>
                <li>
                  <span className="check-icon">✓</span> Reuse question paper
                  (optional)
                </li>
                <li>
                  <span className="check-icon">✓</span> Upload additional answer
                  sheets
                </li>
                <li>
                  <span className="check-icon">✓</span> Merge with existing
                  results
                </li>
              </ul>
              <button className="mode-card-btn mode-card-btn-existing">
                Select Existing Exam →
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="mode-info-section">
            <h3 className="mode-info-title">
              <span className="info-icon">💡</span>
              When to use each mode?
            </h3>
            <div className="mode-info-grid">
              <div className="mode-info-item mode-info-new">
                <strong>New Correction:</strong>
                <p>
                  Use when starting a completely new exam with all students at
                  once
                </p>
              </div>
              <div className="mode-info-item mode-info-existing">
                <strong>Existing Exam:</strong>
                <p>
                  Use when you want to add more students to an already created
                  exam (e.g., 20 students now + 20 later)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP 2A: EXISTING EXAM SELECTION VIEW (GRID LAYOUT)
  // ==========================================
  if (correctionMode === "existing" && !selectedExistingExam) {
    return (
      <div className="exam-correction-container">
        <div className="exam-correction-header">
          <div className="header-content">
            <button className="back-btn" onClick={handleBackToModeSelection}>
              ← Back
            </button>
            <div>
              <h1 className="correction-header-title">Select Existing Exam</h1>
              <p className="header-subtitle">
                Choose an exam to add more students
              </p>
            </div>
          </div>
          <button
            className="view-analytics-btn"
            onClick={() => {
              if (window.handleExamAnalyticsView) {
                window.handleExamAnalyticsView();
              }
            }}
          >
            <span>📊</span>
            View Analytics
          </button>
        </div>

        <div className="existing-exams-container">
          {error && (
            <div className="alert alert-error">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {loadingExams ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading existing exams...</p>
            </div>
          ) : existingExams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No Existing Exams Found</h3>
              <p>
                You don't have any exams yet. Please create a new exam instead.
              </p>
              <button
                className="btn btn-primary"
                onClick={handleBackToModeSelection}
              >
                Go Back
              </button>
            </div>
          ) : (
            <div className="exams-grid-container">
              {existingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="exam-grid-card"
                  onClick={() => handleExistingExamSelect(exam)}
                >
                  <div className="exam-card-header">
                    <h3 className="exam-name">{exam.name}</h3>
                    <span
                      className={`exam-type-badge exam-type-${exam.exam_type.toLowerCase()}`}
                    >
                      {exam.exam_type}
                    </span>
                  </div>
                  <div className="exam-card-body">
                    <div className="exam-info-row">
                      <span className="info-label">Class:</span>
                      <span className="info-value">{exam.class_section}</span>
                    </div>
                    <div className="exam-info-row">
                      <span className="info-label">Current Students:</span>
                      <span className="info-value">{exam.total_students}</span>
                    </div>
                    <div className="exam-info-row">
                      <span className="info-label">Avg Score:</span>
                      <span className="info-value">
                        {exam.average_score
                          ? `${exam.average_score.toFixed(1)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <button className="exam-select-btn">
                    Select This Exam →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // STEP 2B/3: UPLOAD FORM VIEW (FULL WIDTH)
  // ==========================================
  return (
    <div className="exam-correction-container">
      <div className="exam-correction-header">
        <div className="header-content">
          <button
            className="back-btn"
            onClick={() => {
              if (correctionMode === "existing") {
                setSelectedExistingExam(null);
              } else {
                handleBackToModeSelection();
              }
            }}
          >
            ← Back
          </button>
          <div className="header-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <path d="M9 15l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="correction-header-title">
              {correctionMode === "existing"
                ? `📝 Add Students to: ${examName}`
                : "📝 New Exam Correction"}
            </h1>
            <p className="header-subtitle">
              {correctionMode === "existing"
                ? "Upload additional answer sheets for this exam"
                : "Upload question papers and answer sheets for automated grading"}
            </p>
          </div>
        </div>
        <button
          className="view-analytics-btn"
          onClick={() => {
            if (window.handleExamAnalyticsView) {
              window.handleExamAnalyticsView();
            }
          }}
        >
          <span>📊</span>
          View Analytics
        </button>
      </div>

      {/* FULL WIDTH FORM (NO SIDEBAR) */}
      <div className="exam1-form-container-full-width">
        <form onSubmit={handleSubmit} className="exam-form">
          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="alert alert-success">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>
                {correctionMode === "existing"
                  ? "Additional students uploaded successfully!"
                  : "Exam submitted successfully!"}
                Processing in background...
              </span>
            </div>
          )}

          {/* Mode Indicator */}
          {correctionMode === "existing" && (
            <div className="alert alert-info">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                You're adding students to an existing exam. Current students:{" "}
                {selectedExistingExam?.total_students || 0}
              </span>
            </div>
          )}

          {/* ============================================
    NEW: COMPACT UPLOAD MODE SELECTION
    ============================================ */}
          <div className="upload-mode-compact">
            <h3 className="section-label">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Mode
            </h3>

            <div className="radio-group">
              <label
                className={`radio-option ${uploadMode === "group" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="uploadMode"
                  value="group"
                  checked={uploadMode === "group"}
                  onChange={(e) => setUploadMode(e.target.value)}
                  disabled={loading}
                />
                <span className="radio-label">
                  <strong>Group of Students</strong>
                  <span className="radio-description">
                    Multiple students per PDF (batch upload)
                  </span>
                </span>
              </label>

              <label
                className={`radio-option ${uploadMode === "individual" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="uploadMode"
                  value="individual"
                  checked={uploadMode === "individual"}
                  onChange={(e) => setUploadMode(e.target.value)}
                  disabled={loading}
                />
                <span className="radio-label">
                  <strong>Individual Student</strong>
                  <span className="radio-description">
                    One student per PDF (standard upload)
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Exam Details Section */}
          <div className="form-section">
            <h2 className="section-title">Exam Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="examName">
                  Exam Name <span className="required">*</span>
                </label>
                {/* AFTER - With Validation */}
                <input
                  type="text"
                  id="examName"
                  className={`form-input ${examNameExists ? "input-error" : ""}`}
                  placeholder="e.g., Mathematics Midterm Exam"
                  value={examName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setExamName(newName);

                    // Only check for duplicates in NEW correction mode
                    if (correctionMode === "new") {
                      checkExamNameAvailability(newName);
                    }
                  }}
                  disabled={loading || correctionMode === "existing"}
                  aria-invalid={examNameExists}
                  aria-describedby={
                    examNameExists ? "exam-name-warning" : undefined
                  }
                />
                {correctionMode === "new" && (
                  <>
                    {/* ADD THESE DEBUG LOGS */}
                    {console.log(
                      "🎨 Rendering validation - correctionMode:",
                      correctionMode,
                    )}
                    {console.log("🎨 isCheckingExamName:", isCheckingExamName)}
                    {console.log("🎨 examNameWarning:", examNameWarning)}
                    {console.log("🎨 examNameExists:", examNameExists)}
                    {/* Loading indicator while checking name */}
                    {isCheckingExamName && (
                      <small className="field-validation field-checking">
                        <span className="spinner-small"></span>
                        Checking exam name availability...
                      </small>
                    )}

                    {/* Warning message if name exists */}
                    {examNameWarning && !isCheckingExamName && (
                      <small
                        id="exam-name-warning"
                        className="field-validation field-warning"
                        role="alert"
                      >
                        {examNameWarning}
                      </small>
                    )}

                    {/* Success message if name is available */}
                    {examName.trim() &&
                      !examNameExists &&
                      !isCheckingExamName &&
                      existingExamNames.length > 0 && (
                        <small className="field-validation field-success">
                          ✓ Exam name is available
                        </small>
                      )}
                  </>
                )}
                {correctionMode === "existing" && (
                  <small className="field-description">
                    Pre-filled from existing exam
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="examType">
                  Exam Type <span className="required">*</span>
                </label>
                {/* AFTER - Disabled when duplicate name */}
                <input
                  type="text"
                  id="examType"
                  className="form-input"
                  placeholder="e.g., Midterm, Final, Unit Test"
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  disabled={
                    loading || correctionMode === "existing" || examNameExists
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="className">
                  Class Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="className"
                  className="form-input"
                  placeholder="e.g., 10"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  disabled={
                    loading || correctionMode === "existing" || examNameExists
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="section">
                  Section <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="section"
                  className="form-input"
                  placeholder="e.g., A"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  disabled={
                    loading || correctionMode === "existing" || examNameExists
                  }
                />
              </div>
            </div>
          </div>

          {/* ============================================
    NEW: SIDE-BY-SIDE FILE UPLOAD SECTION
    ============================================ */}
          <div className="upload-section">
            <h3 className="section-label">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              Upload Files
            </h3>

            <div className="upload-grid">
              {/* LEFT: Question Paper Upload */}
              <div className="upload-column">
                <label className="upload-label">
                  Question Paper
                  {correctionMode === "new" && (
                    <span className="required-mark">*</span>
                  )}
                  {correctionMode === "existing" && (
                    <span className="optional-mark">(Optional)</span>
                  )}
                </label>

                {!questionPaper ? (
                  <label
                    htmlFor="questionPaperInput"
                    className="upload-box compact"
                  >
                    <div className="upload-icon-small">📄</div>
                    <div className="upload-info">
                      <span className="upload-title">Choose PDF</span>
                      <span className="upload-hint">Max 100MB</span>
                    </div>
                    <input
                      type="file"
                      id="questionPaperInput"
                      accept=".pdf"
                      onChange={handleQuestionPaperChange}
                      disabled={loading}
                      className="hidden-input"
                    />
                  </label>
                ) : (
                  <div className="file-item">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                      <polyline points="13 2 13 9 20 9" />
                    </svg>
                    <div className="file-details">
                      <span className="file-name">{questionPaper.name}</span>
                      <span className="file-size">
                        {(questionPaper.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={handleRemoveQuestionPaper}
                      disabled={loading}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* RIGHT: Answer Sheets Upload */}
              <div className="upload-column">
                <label className="upload-label">
                  Answer Sheets <span className="required-mark">*</span>
                  {answerSheets.length > 0 && (
                    <span className="file-counter">
                      ({answerSheets.length} files)
                    </span>
                  )}
                </label>

                {/* Always show upload box when no files */}
                {answerSheets.length === 0 && (
                  <label
                    htmlFor="answerSheetsInput"
                    className="upload-box compact"
                  >
                    <div className="upload-icon-small">📑</div>
                    <div className="upload-info">
                      <span className="upload-title">
                        {uploadMode === "group"
                          ? "Choose PDFs (Batch)"
                          : "Choose PDFs"}
                      </span>
                      <span className="upload-hint">
                        {uploadMode === "group"
                          ? "Multiple students per file"
                          : "One per student"}{" "}
                        • Select multiple
                      </span>
                    </div>
                    <input
                      type="file"
                      id="answerSheetsInput"
                      accept=".pdf"
                      multiple
                      onChange={handleAnswerSheetsChange}
                      disabled={loading}
                      className="hidden-input"
                    />
                  </label>
                )}

                {/* Show files list and add more button when files exist */}
                {answerSheets.length > 0 && (
                  <div className="files-container">
                    <div className="files-scroll">
                      {answerSheets.map((sheet, index) => (
                        <div key={index} className="file-item">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                            <polyline points="13 2 13 9 20 9" />
                          </svg>
                          <div className="file-details">
                            <span className="file-name">{sheet.name}</span>
                            <span className="file-size">
                              {(sheet.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => handleRemoveAnswerSheet(index)}
                            disabled={loading}
                            title="Remove file"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="files-actions">
                      <label
                        htmlFor="answerSheetsInputMore"
                        className="add-more-btn"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add More PDFs
                        <input
                          type="file"
                          id="answerSheetsInputMore"
                          accept=".pdf"
                          multiple
                          onChange={handleAnswerSheetsChange}
                          disabled={loading}
                          className="hidden-input"
                        />
                      </label>
                      <button
                        type="button"
                        className="clear-all-link"
                        onClick={handleClearAllAnswerSheets}
                        disabled={loading}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="upload-progress-section">
              <div className="progress-info">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submission Summary for Existing Correction */}
          {correctionMode === "existing" &&
            selectedExistingExam &&
            answerSheets.length > 0 && (
              <div className="submission-summary">
                <h3 className="summary-title">📊 Submission Summary</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Existing Students:</span>
                    <span className="summary-value">
                      {selectedExistingExam.total_students}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">New Students:</span>
                    <span className="summary-value highlight">
                      {answerSheets.length}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Total After Upload:</span>
                    <span className="summary-value total">
                      {selectedExistingExam.total_students +
                        answerSheets.length}
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={loading}
            >
              Reset Form
            </button>
            {/* AFTER - Also disabled when duplicate name */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                loading ||
                answerSheets.length === 0 ||
                examNameExists ||
                isCheckingExamName
              }
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : examNameExists ? (
                <>
                  <span>🚫</span>
                  Duplicate Exam Name
                </>
              ) : (
                <>
                  <span>🚀</span>
                  {correctionMode === "existing"
                    ? "Add Students"
                    : "Start Correction"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamCorrection;
