import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import MarkdownWithMath from "./MarkdownWithMath";
import "./QuizMode.css";
import { generateQuestions, fetchCheatsheet } from "../api/quizApi";
import QuizScoreGraph from "./QuizScoreGraph";

const formatChapterName = (raw) => {
  if (!raw) return "";
  return raw
    .replace(/^CHAPTER_\d+_/, "") // Remove "CHAPTER_1_" prefix
    .replace(/_/g, " ") // Replace underscores with spaces
    .toLowerCase() // ← ADD THIS: lowercase everything first
    .replace(/\b\w/g, (c) => c.toUpperCase()) // Then title case each word
    .replace(/\b(In|Of|And|The|To|For|A|An)\b/g, (w) => w.toLowerCase())
    .replace(/^./, (c) => c.toUpperCase());
};

const QuizMode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRetakeFlow = location.state?.isRetakeFromResult || false;
  const retakeConfig = location.state?.retakeConfig || null;

  const [isDark] = useState(() => {
    try {
      return localStorage.getItem("darkMode") === "true";
    } catch {
      return false;
    }
  });

  const ALLOWED_SUBJECTS = ["mathematics", "physics"]; // lowercase for filtering

  const [subjects, setSubjects] = useState([]); // NEW: [{subject_code, subject_name}]
  const [selectedSubjectObj, setSelectedSubjectObj] = useState(null); // NEW: full object
  const [selectedSubject, setSelectedSubject] = useState(""); // keep for UI/display: "MATHEMATICS"

  const [classes, setClasses] = useState([]); // NOW: [{class_code, class_name}]
  const [selectedClass, setSelectedClass] = useState(""); // keep as string for backward compat
  const [selectedClassObj, setSelectedClassObj] = useState(null); // NEW: full object

  const [chapters, setChapters] = useState([]); // NOW: [{topic_code, name}]
  const [selectedChapters, setSelectedChapters] = useState([]); // NOW: full objects [{topic_code, name}]

  const [questionsPerChapter, setQuestionsPerChapter] = useState(5);
  const [chapterFilter, setChapterFilter] = useState("");

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [cheatsheetData, setCheatsheetData] = useState(null);
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [loadingCheatsheet, setLoadingCheatsheet] = useState(false);
  const [expandedSheets, setExpandedSheets] = useState({});

  // Previous Learning Path state
  const [showPrevQuizzes, setShowPrevQuizzes] = useState(false);
  const [prevQuizzes, setPrevQuizzes] = useState([]);
  const [loadingPrevQuizzes, setLoadingPrevQuizzes] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [learningAnswers, setLearningAnswers] = useState({});

  /**
   * Returns true for classes 6–12 with any Mathematics subject,
   * excluding JEE Mains / Advanced variants.
   * This enables the optional subtopics step (step 4) in the wizard.
   */
  const isMathWithSubtopics = (() => {
    if (!selectedClassObj || !selectedSubject) return false;
    const classNum = parseInt(
      selectedClassObj.class_name.replace(/\D/g, ""),
      10,
    );
    if (isNaN(classNum) || classNum < 6 || classNum > 12) return false;
    const subjectLower = selectedSubject.toLowerCase();
    return (
      (subjectLower.includes("mathematics") ||
        subjectLower.includes("maths") ||
        subjectLower.includes("math")) &&
      !subjectLower.includes("jee") &&
      !subjectLower.includes("mains") &&
      !subjectLower.includes("advanced")
    );
  })();

  const [subtopics, setSubtopics] = useState([]); // NOW: [{updated_sub_topic_code, updated_sub_topic_name}]
  const [selectedSubtopics, setSelectedSubtopics] = useState([]); // NOW: string[] of subtopic NAMES (for generate payload)
  const [loadingSubtopics, setLoadingSubtopics] = useState(false);

  useEffect(() => {
    const loadClasses = async () => {
      setLoadingClasses(true);
      setClasses([]);
      setSelectedClass("");
      setSelectedClassObj(null);
      setSubjects([]);
      setSelectedSubjectObj(null);
      setSelectedSubject("");
      setChapters([]);
      setSelectedChapters([]);
      setSubtopics([]);
      setSelectedSubtopics([]);
      setError("");
      try {
        const res = await axiosInstance.get("/classes/");
        setClasses(res.data.data || []);
      } catch (e) {
        setError("Failed to load classes.");
      } finally {
        setLoadingClasses(false);
      }
    };
    loadClasses();
  }, []); // fetch once on mount

  // Auto-fill from retake config
  useEffect(() => {
    if (!retakeConfig || classes.length === 0) return;

    // Find and select the class
    const classNum = retakeConfig.classNum;
    const cls = classes.find(
      (c) => c.class_name.replace(/\D/g, "") === String(classNum),
    );
    if (cls) {
      setSelectedClassObj(cls);
      setSelectedClass(cls.class_name.replace(/\D/g, ""));
      // Trigger subject + chapter loading chain
      // (the existing useEffects watching selectedClassObj will handle this)
    }
  }, [retakeConfig, classes]); // eslint-disable-line

  useEffect(() => {
    if (!selectedClassObj || !selectedSubjectObj) {
      setChapters([]);
      setSelectedChapters([]);
      return;
    }

    const loadChapters = async () => {
      setLoadingChapters(true);
      setChapters([]);
      setSelectedChapters([]);
      setSubtopics([]);
      setSelectedSubtopics([]);
      setChapterFilter("");
      setError("");
      try {
        const res = await axiosInstance.post("/chapters/", {
          subject_id: selectedSubjectObj.subject_code,
          class_id: selectedClassObj.class_code,
        });
        setChapters(res.data.data || []); // [{topic_code, name}, ...]
      } catch (e) {
        setError("Failed to load chapters.");
      } finally {
        setLoadingChapters(false);
      }
    };
    loadChapters();
  }, [selectedClassObj, selectedSubjectObj]);

  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    if (!selectedClassObj) {
      setSubjects([]);
      setSelectedSubjectObj(null);
      setSelectedSubject("");
      setChapters([]);
      setSelectedChapters([]);
      return;
    }

    const loadSubjects = async () => {
      setLoadingSubjects(true);
      setSubjects([]);
      setSelectedSubjectObj(null);
      setSelectedSubject("");
      setChapters([]);
      setSelectedChapters([]);
      setSubtopics([]);
      setSelectedSubtopics([]);
      setError("");
      try {
        const res = await axiosInstance.post("/subjects/", {
          class_id: selectedClassObj.class_code,
        });
        const allSubjects = res.data.data || [];
        // Filter to only PHYSICS and MATHEMATICS
        const filtered = allSubjects.filter((s) => {
          const name = s.subject_name.toLowerCase();
          return (
            ALLOWED_SUBJECTS.some((allowed) => name.includes(allowed)) &&
            !name.includes("jee") &&
            !name.includes("mains") &&
            !name.includes("advanced") &&
            !name.includes("foundation")
          );
        });
        setSubjects(filtered);
      } catch (e) {
        setError("Failed to load subjects.");
      } finally {
        setLoadingSubjects(false);
      }
    };
    loadSubjects();
  }, [selectedClassObj]);

  useEffect(() => {
    setSubtopics([]);
    setSelectedSubtopics([]);
    if (!isMathWithSubtopics || selectedChapters.length === 0) return;

    const loadSubtopics = async () => {
      setLoadingSubtopics(true);
      try {
        // Fetch subtopics for all selected chapters in parallel
        const results = await Promise.all(
          selectedChapters.map((ch) =>
            axiosInstance
              .post("/backend/api/updated-subtopic-questions/", {
                classid: selectedClassObj.class_code,
                subjectid: selectedSubjectObj.subject_code,
                topicid: [ch.topic_code],
                sub_topic_names: true,
              })
              .then((res) => res.data.subtopics || [])
              .catch(() => []),
          ),
        );
        // Flatten, deduplicate by code
        const allSubs = results.flat();
        const uniqueMap = new Map();
        allSubs.forEach((s) => {
          if (!uniqueMap.has(s.updated_sub_topic_code)) {
            uniqueMap.set(s.updated_sub_topic_code, s);
          }
        });
        setSubtopics([...uniqueMap.values()]); // [{updated_sub_topic_code, updated_sub_topic_name}]
      } catch (e) {
        setSubtopics([]);
      } finally {
        setLoadingSubtopics(false);
      }
    };
    loadSubtopics();
  }, [selectedChapters, selectedClassObj, selectedSubjectObj, selectedSubject]);
  const toggleChapter = useCallback((ch) => {
    setSelectedChapters(
      (prev) =>
        prev.length === 1 && prev[0].topic_code === ch.topic_code
          ? [] // deselect if clicking the same one
          : [ch], // replace with single selection
    );
  }, []);

  const removeChapter = useCallback((ch) => {
    setSelectedChapters((prev) =>
      prev.filter((c) => c.topic_code !== ch.topic_code),
    );
  }, []);

  // const toggleAll = () => {
  //   if (selectedChapters.length === chapters.length) {
  //     setSelectedChapters([]);
  //   } else {
  //     setSelectedChapters([...chapters]);
  //   }
  // };

  const filteredChapters = useMemo(() => {
    if (!chapterFilter.trim()) return chapters;
    const q = chapterFilter.toLowerCase();
    return chapters.filter((ch) => ch.name.toLowerCase().includes(q));
  }, [chapters, chapterFilter]);

  const currentStep = !selectedClassObj
    ? 1
    : !selectedSubjectObj
      ? 2
      : selectedChapters.length === 0
        ? 3
        : isMathWithSubtopics && selectedSubtopics.length === 0
          ? 4
          : isMathWithSubtopics
            ? 5
            : 4;

  const totalQuestions = selectedChapters.length * questionsPerChapter;
  const estimatedTime = totalQuestions * 2; // 2 min per question

  const toggleSheet = useCallback((index) => {
    setExpandedSheets((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const handleRevise = async () => {
    if (
      !selectedSubjectObj ||
      !selectedClassObj ||
      selectedChapters.length === 0
    )
      return;
    setLoadingCheatsheet(true);
    setError("");
    try {
      const chapterNames = selectedChapters.map((ch) =>
        formatChapterName(ch.name),
      );
      const res = await fetchCheatsheet({
        class_num: Number(selectedClassObj.class_name.replace(/\D/g, "")),
        chapters: chapterNames,
        subject: selectedSubject,
      });
      const raw = res.data;
      const sheets = Array.isArray(raw) ? raw : raw.sheets || [];
      const normalized = {
        class_num: Array.isArray(raw) ? Number(selectedClass) : raw.class_num,
        total_sheets: sheets.length,
        sheets,
      };
      setCheatsheetData(normalized);
      setExpandedSheets(Object.fromEntries(sheets.map((_, i) => [i, true])));
      setShowCheatsheet(true);
    } catch (err) {
      // Cheatsheet not available — fall back to direct generate
      console.warn(
        "Cheatsheet not available, generating test directly:",
        err.response?.data?.detail,
      );
      setLoadingCheatsheet(false);
      handleGenerate();
      return;
    } finally {
      setLoadingCheatsheet(false);
    }
  };

  const handlePrevLearningPath = async () => {
    setShowPrevQuizzes(true);
    setSelectedQuiz(null);
    setLearningAnswers({});
    setLoadingPrevQuizzes(true);
    try {
      const data = await axiosInstance.fetchQuizzes();
      setPrevQuizzes(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load previous quizzes.");
    } finally {
      setLoadingPrevQuizzes(false);
    }
  };

  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setLearningAnswers({});
  };

  const handleLearningAnswer = (qIndex, option) => {
    if (learningAnswers[qIndex]) return; // already answered
    setLearningAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const renderSheetContent = (sheet) => (
    <>
      {sheet.formulas?.length > 0 && (
        <div className="cheatsheet-section">
          <h3 className="cheatsheet-section-title">
            <span className="cheatsheet-section-icon">📐</span>
            Formulas & Rules
            <span className="cheatsheet-section-badge">
              {sheet.formulas.length}
            </span>
          </h3>
          <div className="cheatsheet-cards">
            {sheet.formulas.map((f, i) => (
              <div className="cheatsheet-card formula-card" key={i}>
                <div className="cheatsheet-card-header">{f.name}</div>
                <div className="cheatsheet-card-formula">
                  <MarkdownWithMath content={f.formula} />
                </div>
                <div className="cheatsheet-card-row">
                  <span className="cheatsheet-card-label">When to use</span>
                  <MarkdownWithMath content={f.when_to_use} />
                </div>
                <div className="cheatsheet-card-row example-row">
                  <span className="cheatsheet-card-label">Example</span>
                  <MarkdownWithMath content={f.example} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {sheet.strategies?.length > 0 && (
        <div className="cheatsheet-section">
          <h3 className="cheatsheet-section-title">
            <span className="cheatsheet-section-icon">💡</span>
            Strategies & Tricks
            <span className="cheatsheet-section-badge">
              {sheet.strategies.length}
            </span>
          </h3>
          <div className="cheatsheet-cards">
            {sheet.strategies.map((s, i) => (
              <div className="cheatsheet-card strategy-card" key={i}>
                <div className="cheatsheet-card-header">
                  <MarkdownWithMath content={s.name} />
                </div>
                <div className="cheatsheet-card-row">
                  <span className="cheatsheet-card-label">Trick</span>
                  <MarkdownWithMath content={s.trick} />
                </div>
                <div className="cheatsheet-card-row why-row">
                  <span className="cheatsheet-card-label">
                    Why students miss this
                  </span>
                  <MarkdownWithMath content={s.why_missed} />
                </div>
                <div className="cheatsheet-card-row example-row">
                  <span className="cheatsheet-card-label">Example</span>
                  <MarkdownWithMath content={s.example} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const handleGenerate = async () => {
    if (
      !selectedSubjectObj ||
      !selectedClassObj ||
      selectedChapters.length === 0
    )
      return;
    setGenerating(true);
    setError("");
    try {
      const chapterNames = selectedChapters.map((ch) =>
        formatChapterName(ch.name),
      );
      const classNum = Number(selectedClassObj.class_name.replace(/\D/g, ""));

      const payload = isMathWithSubtopics
        ? {
            class_num: classNum,
            chapters: chapterNames,
            questions_per_chapter: questionsPerChapter,
            subject: selectedSubject, // preserves "Mathematics - 2" etc.
            ...(selectedSubtopics.length > 0 && {
              sub_topics: selectedSubtopics,
            }),
          }
        : {
            class_num: classNum,
            chapters: chapterNames,
            questions_per_chapter: questionsPerChapter,
            subject: selectedSubject,
          };

      const res = await generateQuestions(payload);
      navigate("/quiz-question", {
        state: {
          quizData: res.data,
          classNum: Number(selectedClassObj.class_name.replace(/\D/g, "")),
          selectedChapters: chapterNames,
          questionsPerChapter,
          subject: selectedSubject,
          selectedSubtopics: selectedSubtopics,
          // Board API IDs for Self Study navigation
          boardSelection: {
            classCode: selectedClassObj.class_code,
            className: selectedClassObj.class_name,
            subjectCode: selectedSubjectObj.subject_code,
            subjectName: selectedSubjectObj.subject_name,
            chapterCode: selectedChapters[0]?.topic_code,
            chapterName: formatChapterName(selectedChapters[0]?.name),
            subtopics: selectedSubtopics, // string[] of selected subtopic names (may be empty)
          },
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to generate questions. Please try again.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={`quiz-mode-wrapper${isDark ? " dark-mode" : ""}`}>
      <motion.div
        className="quiz-mode-content"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Breadcrumb */}
        <nav className="quiz-breadcrumb">
          <button
            className="quiz-breadcrumb-link"
            onClick={() => navigate("/student-dash")}
          >
            Dashboard
          </button>
          <span className="quiz-breadcrumb-sep">/</span>
          <span className="quiz-breadcrumb-current">Test Prep</span>
        </nav>

        {/* Header */}
        <div className="quiz-mode-header">
          <h1>Test Prep</h1>
          <p>
            Select your class and chapters, then challenge yourself with
            AI-generated MCQ questions
          </p>
          <button
            className="quiz-prev-path-btn"
            onClick={handlePrevLearningPath}
          >
            {/* <span className="prev-path-icon">📚</span> */}
            Previous Learning Path
          </button>
        </div>

        {/* Score Breakdown Graph */}
        <div style={{ marginBottom: 24 }}>
          <QuizScoreGraph />
        </div>

        {/* Steps indicator */}
        <div className="quiz-steps-wrapper">
          <div className="quiz-steps">
            {[
              { num: 1, label: "Class", desc: "Select class" },
              { num: 2, label: "Subject", desc: "Pick subject" },
              { num: 3, label: "Chapter", desc: "Pick a topic" },
              ...(isMathWithSubtopics
                ? [{ num: 4, label: "Subtopics", desc: "Filter subtopics" }]
                : []),
            ].map((step, i) => (
              <React.Fragment key={step.num}>
                {i > 0 && (
                  <div
                    className={`quiz-step-line ${currentStep > step.num - 1 ? "completed" : ""}`}
                  />
                )}
                <div
                  className={`quiz-step ${
                    currentStep === step.num
                      ? "active"
                      : currentStep > step.num
                        ? "completed"
                        : ""
                  }`}
                >
                  <div className="quiz-step-num">
                    {currentStep > step.num ? "✓" : step.num}
                  </div>
                  <div className="quiz-step-text">
                    <span className="quiz-step-label">{step.label}</span>
                    <span className="quiz-step-desc">{step.desc}</span>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="quiz-error-msg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <span className="quiz-error-icon">!</span>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {generating ? (
          <div className="quiz-glass-card">
            <div className="quiz-loading-overlay">
              <div className="quiz-spinner" />
              <span className="quiz-loading-text">
                Generating {totalQuestions} questions...
              </span>
              <span className="quiz-loading-subtext">
                AI is crafting bridge-diagnostic questions for{" "}
                {selectedChapters.length} chapter
                {selectedChapters.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* ── Section 1: Class Selection ── */}
            <div className="quiz-glass-card">
              <div className="quiz-section-label">
                <span className="quiz-section-num">1</span>
                <span>Select Class</span>
              </div>
              {loadingClasses ? (
                <div className="quiz-empty-state">
                  <div
                    className="quiz-spinner"
                    style={{ margin: "0 auto", width: 32, height: 32 }}
                  />
                </div>
              ) : (
                <select
                  className="quiz-glass-select"
                  value={selectedClassObj?.class_code || ""}
                  onChange={(e) => {
                    const cls = classes.find(
                      (c) => c.class_code === e.target.value,
                    );
                    setSelectedClassObj(cls || null);
                    setSelectedClass(cls?.class_code || "");
                  }}
                >
                  <option value="">Choose your class...</option>
                  {classes.map((c) => (
                    <option key={c.class_code} value={c.class_code}>
                      {c.class_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* ── Section 2: Subject Selection (after class is selected) ── */}
            {selectedClassObj && (
              <div className="quiz-glass-card">
                <div className="quiz-section-label">
                  <span className="quiz-section-num">2</span>
                  <span>Select Subject</span>
                </div>
                {loadingSubjects ? (
                  <div className="quiz-empty-state">
                    <div
                      className="quiz-spinner"
                      style={{ margin: "0 auto", width: 32, height: 32 }}
                    />
                  </div>
                ) : (
                  <div className="quiz-subject-grid">
                    {subjects.map((sub) => {
                      const name = sub.subject_name.toUpperCase();
                      const icon = name.includes("PHYSICS") ? "⚛️" : "📐";
                      return (
                        <motion.button
                          key={sub.subject_code}
                          className={`quiz-subject-chip ${selectedSubjectObj?.subject_code === sub.subject_code ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedSubjectObj(sub);
                            setSelectedSubject(
                              name.includes("PHYSICS")
                                ? "PHYSICS"
                                : "MATHEMATICS",
                            );
                          }}
                          whileTap={{ scale: 0.96 }}
                        >
                          <span className="quiz-subject-icon">{icon}</span>
                          <span>{sub.subject_name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── Section 3: Chapter Selection ── */}
            <AnimatePresence>
              {selectedClassObj && selectedSubjectObj && (
                <motion.div
                  className="quiz-glass-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="quiz-section-label">
                    <span className="quiz-section-num">3</span>
                    <span>Select Chapters</span>
                    {chapters.length > 0 && (
                      <span className="quiz-section-count">
                        {selectedChapters.length === 1
                          ? "1 selected"
                          : "Pick one"}
                      </span>
                    )}
                    {/* {chapters.length > 0 && (
                      <button
                        className="quiz-select-all-btn"
                        onClick={toggleAll}
                      >
                        {selectedChapters.length === chapters.length
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    )} */}
                  </div>

                  {/* Selected tags */}
                  {selectedChapters.length > 0 && (
                    <div className="quiz-selected-tags">
                      {selectedChapters.map((ch) => (
                        <span className="quiz-selected-tag" key={ch.topic_code}>
                          {formatChapterName(ch.name)}
                          <button
                            className="quiz-tag-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeChapter(ch);
                            }}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search filter */}
                  {chapters.length > 5 && (
                    <input
                      className="quiz-glass-input quiz-chapter-search"
                      type="text"
                      placeholder="Search chapters..."
                      value={chapterFilter}
                      onChange={(e) => setChapterFilter(e.target.value)}
                    />
                  )}

                  {loadingChapters ? (
                    <div className="quiz-empty-state">
                      <div
                        className="quiz-spinner"
                        style={{ margin: "0 auto", width: 32, height: 32 }}
                      />
                    </div>
                  ) : chapters.length === 0 ? (
                    <div className="quiz-empty-state">
                      <div className="empty-icon">📭</div>
                      <p>No chapters found for this class</p>
                    </div>
                  ) : (
                    <div className="quiz-chapter-grid">
                      {filteredChapters.map((ch) => (
                        <motion.button
                          key={ch.topic_code}
                          className={`quiz-chapter-chip ${selectedChapters.some((c) => c.topic_code === ch.topic_code) ? "selected" : ""}`}
                          onClick={() => toggleChapter(ch)}
                          whileTap={{ scale: 0.96 }}
                        >
                          <span
                            className={`quiz-chip-check ${selectedChapters.some((c) => c.topic_code === ch.topic_code) ? "visible" : ""}`}
                          >
                            ✓
                          </span>
                          <span className="quiz-chip-text">
                            {formatChapterName(ch.name)}
                          </span>{" "}
                        </motion.button>
                      ))}
                      {filteredChapters.length === 0 && chapterFilter && (
                        <div
                          className="quiz-empty-state"
                          style={{ width: "100%" }}
                        >
                          <p>No chapters match "{chapterFilter}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {isMathWithSubtopics && selectedChapters.length > 0 && (
              <motion.div
                className="quiz-glass-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                <div className="quiz-section-label">
                  <span className="quiz-section-num">4</span>
                  <span>Select Subtopics</span>
                  {selectedSubtopics.length > 0 && (
                    <span className="quiz-section-count">
                      {selectedSubtopics.length} selected
                    </span>
                  )}
                </div>

                {loadingSubtopics ? (
                  <div className="quiz-empty-state">
                    <div
                      className="quiz-spinner"
                      style={{ margin: "0 auto", width: 32, height: 32 }}
                    />
                  </div>
                ) : subtopics.length === 0 ? (
                  <div className="quiz-empty-state">
                    <div className="empty-icon">📭</div>
                    <p>No subtopics available for selected chapters.</p>
                  </div>
                ) : (
                  <>
                    <div className="quiz-chapter-grid">
                      {subtopics.map((st) => (
                        <motion.button
                          key={st.updated_sub_topic_code}
                          className={`quiz-chapter-chip ${selectedSubtopics.includes(st.updated_sub_topic_name) ? "selected" : ""}`}
                          onClick={() =>
                            setSelectedSubtopics((prev) =>
                              prev.includes(st.updated_sub_topic_name)
                                ? prev.filter(
                                    (n) => n !== st.updated_sub_topic_name,
                                  )
                                : [...prev, st.updated_sub_topic_name],
                            )
                          }
                          whileTap={{ scale: 0.96 }}
                        >
                          <span
                            className={`quiz-chip-check ${selectedSubtopics.includes(st.updated_sub_topic_name) ? "visible" : ""}`}
                          >
                            ✓
                          </span>
                          <span className="quiz-chip-text">
                            {st.updated_sub_topic_name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                    <p
                      style={{
                        marginTop: 8,
                        fontSize: "0.85rem",
                        opacity: 0.7,
                      }}
                    >
                      Select subtopics to focus on, or leave blank to cover all.
                    </p>
                  </>
                )}
              </motion.div>
            )}

            {/* ── Section 4: Configure & Start ── */}
            {/* ── Section 4: Action Button Only (Configure removed) ── */}
            <AnimatePresence>
              {selectedChapters.length > 0 && (
                <motion.div
                  className="quiz-glass-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                >
                  {/* Action Button */}
                  {/* Action Button */}
                  <div className="quiz-action-buttons">
                    {isRetakeFlow ? (
                      <button
                        className="quiz-start-btn"
                        onClick={handleRevise}
                        disabled={loadingCheatsheet || generating}
                        style={{ flex: 1 }}
                      >
                        {loadingCheatsheet ? (
                          <>
                            <div
                              className="quiz-spinner"
                              style={{ width: 18, height: 18, borderWidth: 2 }}
                            />
                            Loading Cheatsheet...
                          </>
                        ) : (
                          <>
                            <span className="btn-shimmer" />
                            📋 Revise & Start Test
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        className="quiz-start-btn"
                        onClick={handleGenerate}
                        disabled={generating}
                        style={{ flex: 1 }}
                      >
                        {generating ? (
                          <>
                            <div
                              className="quiz-spinner"
                              style={{ width: 18, height: 18, borderWidth: 2 }}
                            />
                            Generating...
                          </>
                        ) : (
                          <>
                            <span className="btn-shimmer" />
                            Start Test
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>

      {/* Previous Learning Path modal */}
      {createPortal(
        <AnimatePresence>
          {showPrevQuizzes && (
            <motion.div
              className={`cheatsheet-overlay prev-quiz-overlay${isDark ? " dark-mode" : ""}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPrevQuizzes(false);
                setSelectedQuiz(null);
              }}
            >
              <motion.div
                className="cheatsheet-modal prev-quiz-modal"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="cheatsheet-header">
                  <div className="cheatsheet-title-row">
                    <div>
                      <h2>
                        {selectedQuiz
                          ? selectedQuiz.name
                          : "Previous Learning Paths"}
                      </h2>
                      <p>
                        {selectedQuiz
                          ? `${selectedQuiz.questions?.length || 0} questions · ${new Date(selectedQuiz.created_at).toLocaleDateString()}`
                          : `${prevQuizzes.length} quiz${prevQuizzes.length !== 1 ? "zes" : ""} found`}
                      </p>
                    </div>
                  </div>
                  <button
                    className="cheatsheet-close"
                    onClick={() => {
                      setShowPrevQuizzes(false);
                      setSelectedQuiz(null);
                    }}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>

                <div className="cheatsheet-body">
                  {loadingPrevQuizzes ? (
                    <div className="quiz-empty-state">
                      <div
                        className="quiz-spinner"
                        style={{ margin: "0 auto", width: 36, height: 36 }}
                      />
                      <p style={{ marginTop: 12 }}>Loading quizzes...</p>
                    </div>
                  ) : !selectedQuiz ? (
                    /* Quiz list view */
                    prevQuizzes.length === 0 ? (
                      <div className="quiz-empty-state">
                        <div className="empty-icon">📭</div>
                        <p>No previous quizzes found</p>
                      </div>
                    ) : (
                      <div className="prev-quiz-list">
                        {prevQuizzes.map((quiz) => (
                          <button
                            key={quiz.id}
                            className="prev-quiz-item"
                            onClick={() => handleSelectQuiz(quiz)}
                            disabled={
                              !quiz.questions || quiz.questions.length === 0
                            }
                          >
                            <div className="prev-quiz-item-top">
                              <span className="prev-quiz-name">
                                {quiz.name}
                              </span>
                              {quiz.analysis?.score_pct != null && (
                                <span
                                  className={`prev-quiz-score ${quiz.analysis.score_pct >= 70 ? "good" : quiz.analysis.score_pct >= 40 ? "mid" : "low"}`}
                                >
                                  {Math.round(quiz.analysis.score_pct)}%
                                </span>
                              )}
                            </div>
                            <div className="prev-quiz-item-meta">
                              <span>
                                {quiz.questions?.length || 0} questions
                              </span>
                              <span>&middot;</span>
                              <span>
                                {new Date(quiz.created_at).toLocaleDateString()}
                              </span>
                              {quiz.analysis?.correct != null && (
                                <>
                                  <span>&middot;</span>
                                  <span>
                                    {quiz.analysis.correct}/
                                    {quiz.analysis.total} correct
                                  </span>
                                </>
                              )}
                            </div>
                            {(!quiz.questions ||
                              quiz.questions.length === 0) && (
                              <span className="prev-quiz-no-q">
                                No questions available
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )
                  ) : (
                    /* Learning mode view */
                    <div className="learning-mode-questions">
                      {selectedQuiz.questions.map((q, idx) => {
                        const answered = learningAnswers[idx];
                        const isCorrect = answered === q.correct_answer;
                        return (
                          <div className="learning-q-card" key={idx}>
                            <div className="learning-q-header">
                              <span className="learning-q-num">Q{idx + 1}</span>
                              <span className="learning-q-chapter">
                                {q.chapter}
                              </span>
                              {q.difficulty && (
                                <span
                                  className={`learning-q-diff ${q.difficulty.toLowerCase()}`}
                                >
                                  {q.difficulty}
                                </span>
                              )}
                            </div>
                            <div className="learning-q-text">
                              <MarkdownWithMath content={q.question} />
                            </div>
                            <div className="learning-q-options">
                              {Object.entries(q.options).map(([key, val]) => {
                                let optClass = "learning-opt";
                                if (answered) {
                                  if (key === q.correct_answer)
                                    optClass += " correct";
                                  else if (key === answered && !isCorrect)
                                    optClass += " wrong";
                                  else optClass += " dimmed";
                                }
                                return (
                                  <button
                                    key={key}
                                    className={optClass}
                                    onClick={() =>
                                      handleLearningAnswer(idx, key)
                                    }
                                    disabled={!!answered}
                                  >
                                    <span className="learning-opt-key">
                                      {key}
                                    </span>
                                    <span className="learning-opt-val">
                                      <MarkdownWithMath content={val} />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                            {answered && (
                              <motion.div
                                className={`learning-feedback ${isCorrect ? "correct" : "wrong"}`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                              >
                                <span className="learning-feedback-icon">
                                  {isCorrect ? "✓" : "✗"}
                                </span>
                                <div className="learning-feedback-text">
                                  <strong>
                                    {isCorrect
                                      ? "Correct!"
                                      : `Incorrect — Answer: ${q.correct_answer}`}
                                  </strong>
                                  {q.solution && (
                                    <div className="learning-solution">
                                      <MarkdownWithMath content={q.solution} />
                                    </div>
                                  )}
                                  <strong>Trap warning</strong>
                                  {q.trap_warning && (
                                    <div className="learning-solution">
                                      <MarkdownWithMath
                                        content={q.trap_warning}
                                      />
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                      <div className="learning-progress-bar">
                        <div
                          className="learning-progress-fill"
                          style={{
                            width: `${(Object.keys(learningAnswers).length / selectedQuiz.questions.length) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="learning-progress-text">
                        {Object.keys(learningAnswers).length} /{" "}
                        {selectedQuiz.questions.length} answered
                        {Object.keys(learningAnswers).length ===
                          selectedQuiz.questions.length && (
                          <span className="learning-score">
                            &nbsp;&middot;&nbsp;Score:{" "}
                            {
                              Object.entries(learningAnswers).filter(
                                ([i, a]) =>
                                  a ===
                                  selectedQuiz.questions[i].correct_answer,
                              ).length
                            }
                            /{selectedQuiz.questions.length}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="cheatsheet-footer">
                  {selectedQuiz ? (
                    <>
                      <button
                        className="cheatsheet-done-btn"
                        onClick={() => {
                          setSelectedQuiz(null);
                          setLearningAnswers({});
                        }}
                      >
                        Back to List
                      </button>
                      <button
                        className="cheatsheet-done-btn"
                        onClick={() => {
                          setShowPrevQuizzes(false);
                          setSelectedQuiz(null);
                        }}
                      >
                        Close
                      </button>
                    </>
                  ) : (
                    <button
                      className="cheatsheet-done-btn"
                      onClick={() => setShowPrevQuizzes(false)}
                      style={{ flex: 1 }}
                    >
                      Close
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* Cheatsheet modal rendered via portal */}
      {createPortal(
        <AnimatePresence>
          {showCheatsheet && cheatsheetData && (
            <motion.div
              className={`cheatsheet-overlay${isDark ? " dark-mode" : ""}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheatsheet(false)}
            >
              <motion.div
                className="cheatsheet-modal"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="cheatsheet-header">
                  <div className="cheatsheet-title-row">
                    <span className="cheatsheet-icon">📋</span>
                    <div>
                      <h2>Revision Cheatsheet</h2>
                      <p>
                        Class {cheatsheetData.class_num} &middot;{" "}
                        {cheatsheetData.total_sheets} chapter
                        {cheatsheetData.total_sheets > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    className="cheatsheet-close"
                    onClick={() => setShowCheatsheet(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>

                <div className="cheatsheet-body">
                  {cheatsheetData.sheets.map((sheet, idx) => (
                    <div className="cheatsheet-chapter" key={idx}>
                      <button
                        className={`cheatsheet-chapter-toggle ${expandedSheets[idx] ? "expanded" : ""}`}
                        onClick={() => toggleSheet(idx)}
                      >
                        <span className="cheatsheet-chapter-num">
                          Ch {sheet.chapter_num}
                        </span>
                        <span className="cheatsheet-chapter-name">
                          {sheet.chapter}
                        </span>
                        <span className="cheatsheet-chapter-meta">
                          {sheet.formulas?.length || 0} formulas &middot;{" "}
                          {sheet.strategies?.length || 0} strategies
                        </span>
                        <span
                          className={`cheatsheet-chevron ${expandedSheets[idx] ? "open" : ""}`}
                        >
                          &#9662;
                        </span>
                      </button>

                      {expandedSheets[idx] && (
                        <div className="cheatsheet-chapter-content">
                          {renderSheetContent(sheet)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="cheatsheet-footer">
                  <button
                    className="cheatsheet-done-btn"
                    onClick={() => setShowCheatsheet(false)}
                  >
                    Done Revising
                  </button>
                  <button
                    className="cheatsheet-start-btn"
                    onClick={() => {
                      setShowCheatsheet(false);
                      handleGenerate();
                    }}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <div
                          className="quiz-spinner"
                          style={{ width: 18, height: 18, borderWidth: 2 }}
                        />
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="btn-shimmer" />
                        Start Test
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};

export default QuizMode;
