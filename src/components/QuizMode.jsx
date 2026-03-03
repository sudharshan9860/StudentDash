import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchClasses,
  fetchChapters,
  generateQuestions,
  fetchCheatsheet,
} from "../api/quizApi";
import axiosInstance from "../api/axiosInstance";
import MarkdownWithMath from "./MarkdownWithMath";
import "./QuizMode.css";

const QuizMode = () => {
  const navigate = useNavigate();

  const [isDark] = useState(() => {
    try {
      return localStorage.getItem("darkMode") === "true";
    } catch {
      return false;
    }
  });

  const SUBJECTS = ["PHYSICS", "MATHEMATICS"];
  const [selectedSubject, setSelectedSubject] = useState("PHYSICS");

  const [classes, setClasses] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedChapters, setSelectedChapters] = useState([]);
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

  useEffect(() => {
    setLoadingClasses(true);
    setClasses([]);
    setSelectedClass("");
    setChapters([]);
    setSelectedChapters([]);
    setError("");
    fetchClasses(selectedSubject)
      .then((res) => setClasses(res.data.classes || []))
      .catch(() =>
        setError("Failed to load classes. Is the quiz server running?"),
      )
      .finally(() => setLoadingClasses(false));
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedClass) {
      setChapters([]);
      setSelectedChapters([]);
      return;
    }
    setLoadingChapters(true);
    setChapters([]);
    setSelectedChapters([]);
    setChapterFilter("");
    setError("");
    fetchChapters(selectedClass, selectedSubject)
      .then((res) => setChapters(res.data.chapters || []))
      .catch(() => setError("Failed to load chapters."))
      .finally(() => setLoadingChapters(false));
  }, [selectedClass, selectedSubject]);

  const toggleChapter = useCallback((ch) => {
    setSelectedChapters((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  }, []);

  const removeChapter = useCallback((ch) => {
    setSelectedChapters((prev) => prev.filter((c) => c !== ch));
  }, []);

  const toggleAll = () => {
    if (selectedChapters.length === chapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters([...chapters]);
    }
  };

  const filteredChapters = useMemo(() => {
    if (!chapterFilter.trim()) return chapters;
    const q = chapterFilter.toLowerCase();
    return chapters.filter((ch) => ch.toLowerCase().includes(q));
  }, [chapters, chapterFilter]);

  const currentStep = !selectedSubject
    ? 1
    : !selectedClass
      ? 2
      : selectedChapters.length === 0
        ? 3
        : 4;
  const totalQuestions = selectedChapters.length * questionsPerChapter;
  const estimatedTime = totalQuestions * 2; // 2 min per question

  const toggleSheet = useCallback((index) => {
    setExpandedSheets((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const handleRevise = async () => {
    if (!selectedSubject || !selectedClass || selectedChapters.length === 0)
      return;
    setLoadingCheatsheet(true);
    setError("");
    try {
      const res = await fetchCheatsheet({
        class_num: Number(selectedClass),
        chapters: selectedChapters,
        subject: selectedSubject,
      });
      // Normalize: API may return { sheets: [...] } or a plain array
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
      setError(err.response?.data?.detail || "Failed to load cheatsheet.");
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
    if (!selectedSubject || !selectedClass || selectedChapters.length === 0)
      return;
    setGenerating(true);
    setError("");
    try {
      const res = await generateQuestions({
        class_num: Number(selectedClass),
        chapters: selectedChapters,
        questions_per_chapter: questionsPerChapter,
        subject: selectedSubject,
      });
      navigate("/quiz-question", {
        state: {
          quizData: res.data,
          classNum: Number(selectedClass),
          selectedChapters,
          questionsPerChapter,
          subject: selectedSubject,
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

        {/* Steps indicator */}
        <div className="quiz-steps-wrapper">
          <div className="quiz-steps">
            {[
              { num: 1, label: "Subject", desc: "Pick subject" },
              { num: 2, label: "Class", desc: "Select class" },
              { num: 3, label: "Chapters", desc: "Pick topics" },
              { num: 4, label: "Configure", desc: "Set & start" },
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
            {/* ── Section 1: Subject Selection ── */}
            <div className="quiz-glass-card">
              <div className="quiz-section-label">
                <span className="quiz-section-num">1</span>
                <span>Select Subject</span>
              </div>
              <div className="quiz-subject-grid">
                {SUBJECTS.map((subj) => (
                  <motion.button
                    key={subj}
                    className={`quiz-subject-chip ${selectedSubject === subj ? "selected" : ""}`}
                    onClick={() => setSelectedSubject(subj)}
                    whileTap={{ scale: 0.96 }}
                  >
                    <span className="quiz-subject-icon">
                      {subj === "PHYSICS" ? "⚛️" : "📐"}
                    </span>
                    <span>{subj}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── Section 2: Class Selection ── */}
            <div className="quiz-glass-card">
              <div className="quiz-section-label">
                <span className="quiz-section-num">2</span>
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
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">Choose your class...</option>
                  {classes.map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* ── Section 3: Chapter Selection ── */}
            <AnimatePresence>
              {selectedClass && (
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
                        {selectedChapters.length}/{chapters.length} selected
                      </span>
                    )}
                    {chapters.length > 0 && (
                      <button
                        className="quiz-select-all-btn"
                        onClick={toggleAll}
                      >
                        {selectedChapters.length === chapters.length
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    )}
                  </div>

                  {/* Selected tags */}
                  {selectedChapters.length > 0 && (
                    <div className="quiz-selected-tags">
                      {selectedChapters.map((ch) => (
                        <span className="quiz-selected-tag" key={ch}>
                          {ch}
                          <button
                            className="quiz-tag-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeChapter(ch);
                            }}
                            aria-label={`Remove ${ch}`}
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
                          key={ch}
                          className={`quiz-chapter-chip ${selectedChapters.includes(ch) ? "selected" : ""}`}
                          onClick={() => toggleChapter(ch)}
                          whileTap={{ scale: 0.96 }}
                        >
                          <span
                            className={`quiz-chip-check ${selectedChapters.includes(ch) ? "visible" : ""}`}
                          >
                            ✓
                          </span>
                          <span className="quiz-chip-text">{ch}</span>
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

            {/* ── Section 4: Configure & Start ── */}
            <AnimatePresence>
              {selectedChapters.length > 0 && (
                <motion.div
                  className="quiz-glass-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                >
                  <div className="quiz-section-label">
                    <span className="quiz-section-num">4</span>
                    <span>Configure Test</span>
                  </div>

                  <div className="quiz-config-row">
                    <div className="quiz-config-slider">
                      <label className="quiz-form-label">
                        <span className="label-icon">🎯</span> Questions Per
                        Chapter
                      </label>
                      <div className="quiz-slider-container">
                        <div className="quiz-slider-value">
                          <span>{questionsPerChapter}</span>
                        </div>
                        <input
                          type="range"
                          className="quiz-slider"
                          min={1}
                          max={15}
                          value={questionsPerChapter}
                          onChange={(e) =>
                            setQuestionsPerChapter(Number(e.target.value))
                          }
                        />
                        <div className="quiz-slider-labels">
                          <span>1</span>
                          <span>5</span>
                          <span>10</span>
                          <span>15</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="quiz-summary-grid">
                    <div className="quiz-summary-card">
                      <div className="quiz-summary-card-icon">
                        {selectedSubject === "PHYSICS" ? "⚛️" : "📐"}
                      </div>
                      <div className="quiz-summary-card-data">
                        <div className="summary-val">{selectedSubject}</div>
                        <div className="summary-label">Subject</div>
                      </div>
                    </div>
                    <div className="quiz-summary-card">
                      <div className="quiz-summary-card-icon"></div>
                      <div className="quiz-summary-card-data">
                        <div className="summary-val">{selectedClass}</div>
                        <div className="summary-label">Class</div>
                      </div>
                    </div>
                    <div className="quiz-summary-card">
                      <div className="quiz-summary-card-icon"></div>
                      <div className="quiz-summary-card-data">
                        <div className="summary-val">
                          {selectedChapters.length}
                        </div>
                        <div className="summary-label">Chapters</div>
                      </div>
                    </div>
                    <div className="quiz-summary-card">
                      <div className="quiz-summary-card-icon"></div>
                      <div className="quiz-summary-card-data">
                        <div className="summary-val">{totalQuestions}</div>
                        <div className="summary-label">Questions</div>
                      </div>
                    </div>
                    <div className="quiz-summary-card">
                      <div className="quiz-summary-card-icon">⏱</div>
                      <div className="quiz-summary-card-data">
                        <div className="summary-val">~{estimatedTime}m</div>
                        <div className="summary-label">Est. Time</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="quiz-action-buttons">
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
                          Generate & Start Test
                        </>
                      )}
                    </button>
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
