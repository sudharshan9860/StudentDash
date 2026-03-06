// src/components/QuizResultChatPanel.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MarkdownWithMath from "./MarkdownWithMath";
import "./QuizResultChatPanel.css";

// ── Same API base used by ChatBox.jsx and ChatBotPage.jsx ──
const API_URL = "https://chatbot.smartlearners.ai";
const api = axios.create({ baseURL: API_URL, timeout: 300000 });

/**
 * Merges the questions array with the student's answers array
 * to produce a per-question analysis structure.
 *
 * @param {Array} questions  - Full question objects from quiz generation
 * @param {Array|Object} answers - Array of {question_num, selected_option}
 *                                 OR object keyed by array index
 * @returns {Array} Enriched per-question objects
 */
const buildQuestionByQuestion = (questions = [], answers = []) => {
  const answerMap = {};

  if (Array.isArray(answers)) {
    // Format: [{question_num: 1, selected_option: "A"}, ...]
    answers.forEach((a) => {
      answerMap[a.question_num] = a.selected_option;
    });
  } else if (answers && typeof answers === "object") {
    // Format: {0: "A", 1: "B", ...} (index-keyed from QuizQuestion state)
    Object.entries(answers).forEach(([idx, val]) => {
      const qNum = questions[Number(idx)]?.question_num;
      if (qNum !== undefined) answerMap[qNum] = val;
    });
  }

  return questions.map((q) => {
    const selected = answerMap[q.question_num] || "";
    const isCorrect = selected !== "" && selected === q.correct_answer;
    const isTrapHit = selected === q.trap_answer;

    return {
      question_num: q.question_num,
      chapter: q.chapter || "",
      bridge_id: q.bridge_id || "",
      bridge_name: q.bridge_name || "",
      concept_tested: q.concept_tested || "",
      question: q.question || "",
      options: q.options || {},
      correct_answer: q.correct_answer || "",
      selected_option: selected,
      is_correct: isCorrect,
      is_unanswered: selected === "",
      trap_hit: isTrapHit,
      trap_answer: q.trap_answer || "",
      trap_explanation: isTrapHit ? q.trap_explanation || "" : "",
    };
  });
};

const buildStructuredQuery = (
  questions = [],
  answers = [],
  classNum,
  subject,
) => {
  // Reuse existing helper to produce enriched per-question objects
  const qbq = buildQuestionByQuestion(questions, answers);

  // Only analyse questions the student got wrong (skip correct + unanswered)
  const wrong = qbq.filter((q) => !q.is_correct && !q.is_unanswered);

  if (wrong.length === 0) {
    // All correct — backend expects empty questions array
    return JSON.stringify({ questions: [] });
  }

  // Build the Q1, Q2 … block string
  const blocks = wrong.map((q, idx) => {
    const optionLine = Object.entries(q.options || {})
      .map(([letter, text]) => `${letter}) ${text}`)
      .join(" | ");

    const trap = q.trap_explanation
      ? q.trap_explanation
      : "Review the concept carefully before attempting similar questions.";

    return [
      `Q${idx + 1}. ${q.question}`,
      `Chapter: ${q.chapter || "N/A"}`,
      `Options: ${optionLine}`,
      `Correct Answer: ${q.correct_answer}`,
      `Student Answer: ${q.selected_option}`,
      `Trap: ${trap}`,
    ].join("\n");
  });

  return blocks.join("\n\n");
};

// ── Local fallback rendered if API is completely unreachable ─────────────────
const buildLocalFallback = (evalData, classNum, subject) => {
  const prediction = evalData?.prediction || {};
  const remedialPlan = evalData?.remedial_plan || {};
  const bridgeRepairs = (remedialPlan.bridge_repairs || []).slice(0, 3);
  const studyPlanSummary = remedialPlan.study_plan_summary || {};
  const scorePct = (prediction.score_pct ?? 0).toFixed(0);
  const correct = prediction.correct ?? 0;
  const total = prediction.total ?? 0;

  return `## Your Quiz Analysis — Class ${classNum} ${subject}

**Score: ${scorePct}% (${correct}/${total} correct)**

${studyPlanSummary.expected_improvement || "Keep practising consistently to improve your score."}

### Key Concepts to Repair
${bridgeRepairs.map((b) => `- **${b.bridge_name}**: ${b.what_went_wrong || ""}`).join("\n") || "- Review the chapters attempted."}

### Priority Study Order
${(studyPlanSummary.priority_order || []).map((p, i) => `${i + 1}. ${p}`).join("\n") || "Review all chapters."}

**Estimated Study Time**: ${studyPlanSummary.total_study_time || "Not specified"}

Keep going — every mistake is a stepping stone to mastery! 🚀`;
};

// ─────────────────────────────────────────────────────────────────────────────
const QuizResultChatPanel = ({
  evalData,
  questions,
  answers,
  classNum,
  subject,
  timeSpent,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [analysisTriggered, setAnalysisTriggered] = useState(false);

  const messagesEndRef = useRef(null);
  const autoSentRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!evalData) return;
    createSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSession = async () => {
    try {
      const qbq = buildQuestionByQuestion(questions, answers);

      // ── DEBUG: log what we send to /create_session ──
      console.group("📤 QuizResultChatPanel — /create_session payload");
      console.log(
        "student_name:",
        localStorage.getItem("fullName") ||
          localStorage.getItem("username") ||
          "Student",
      );
      console.log("class_name:", String(classNum));
      console.log("question_by_question (count):", qbq.length);
      console.log("question_by_question (full):", qbq);
      console.groupEnd();

      const quizSummary = {
        subject,
        class_num: classNum,
        score_pct: evalData?.prediction?.score_pct ?? 0,
        correct: evalData?.prediction?.correct ?? 0,
        total: evalData?.prediction?.total ?? questions.length,
        chapter_breakdown: evalData?.graph_data?.chapter_breakdown ?? [],
        broken_bridges: (evalData?.analysis?.bridge_results || [])
          .filter((b) => b.status === "broken")
          .map((b) => b.bridge_name),
        weak_bridges: (evalData?.analysis?.bridge_results || [])
          .filter((b) => b.status === "weak")
          .map((b) => b.bridge_name),
        priority_repairs:
          evalData?.remedial_plan?.study_plan_summary?.priority_order ?? [],
        expected_improvement:
          evalData?.remedial_plan?.study_plan_summary?.expected_improvement ||
          "",
        // ✅ Full question-by-question enriched data
        question_by_question: qbq,
      };

      const formData = new FormData();
      formData.append(
        "student_name",
        localStorage.getItem("fullName") ||
          localStorage.getItem("username") ||
          "Student",
      );
      formData.append("class_name", String(classNum) || "default_class");
      formData.append("user_type", "student");
      formData.append(
        "exam_data",
        JSON.stringify({ quiz_result: quizSummary }),
      );
      formData.append("json_data", JSON.stringify({ data: {} }));
      formData.append("self_data", JSON.stringify({}));

      const res = await api.post("/create_session", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data?.session_id) throw new Error("No session_id returned");

      console.log("✅ Session created:", res.data.session_id);
      setSessionId(res.data.session_id);
      setSessionReady(true);
    } catch (err) {
      console.error("QuizResultChatPanel: session creation failed", err);
      setSessionReady(true);
    }
  };

  useEffect(() => {
    if (!sessionReady || autoSentRef.current) return;
    autoSentRef.current = true;

    setIsOpen(true);

    const timer = setTimeout(() => {
      triggerAutoAnalysis();
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady]);

  const triggerAutoAnalysis = async () => {
    // ── Build structured per-question query ──
    const prompt = buildStructuredQuery(questions, answers, classNum, subject);

    console.group(
      "📨 QuizResultChatPanel — structured query sent to /test-prep-analysis",
    );
    console.log(prompt);
    console.groupEnd();

    setMessages([
      {
        role: "system-auto",
        content: "🤖 Analyzing your quiz results...",
        timestamp: new Date().toISOString(),
      },
    ]);
    setIsLoading(true);
    setAnalysisTriggered(true);

    await callChatbot(prompt, true);
  };

  const callChatbot = async (messageText, isAutoAnalysis = false) => {
    if (!sessionId) {
      const fallback = isAutoAnalysis
        ? buildLocalFallback(evalData, classNum, subject)
        : "Sorry, I could not connect to the AI service. Please try again.";

      setMessages((prev) => [
        ...prev.filter((m) => m.role !== "system-auto"),
        {
          role: "assistant",
          content: fallback,
          timestamp: new Date().toISOString(),
          isAnalysis: isAutoAnalysis,
        },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        session_id: sessionId,
        query: messageText,
        language: "en",
      };

      // ── DEBUG: log the exact request body ──
      console.log("📡 POST /test-prep-analysis →", {
        session_id: sessionId,
        query_length: messageText.length,
        query_preview: messageText.substring(0, 200) + "...",
      });

      // This stays unchanged — already correct:
      const res = await api.post(
        "/test-prep-analysis",
        {
          session_id: sessionId,
          query: messageText, // ← now receives the Q1./Q2. format string
          language: "en",
        },
        { headers: { session_token: sessionId } },
      );

      console.log("✅ /test-prep-analysis response:", res.data);

      // Inside callChatbot, replace the reply extraction block:

      const rawReply = res?.data?.response || res?.data?.reply || "";

      let reply;
      try {
        const parsed = JSON.parse(rawReply);
        const questionCards = parsed?.questions || [];

        if (questionCards.length === 0) {
          reply =
            "🎉 **Perfect score!** You answered all questions correctly. Great work!";
        } else {
          reply = questionCards
            .map((card) => {
              const cc = card.conceptCard || {};
              const mcq1 = card.mcq1 || {};
              const mcq2 = card.mcq2 || {};

              const mcqBlock = (mcq, label) => {
                if (!mcq.question) return "";
                const opts = (mcq.options || [])
                  .map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`)
                  .join("  \n");
                return `**${label}:** ${mcq.question}\n${opts}\n*Correct: ${mcq.correct}*`;
              };

              return [
                `### ${card.questionId}: Concept Card — ${cc.title || ""}`,
                `**Core Concept:** ${cc.concept || ""}`,
                `**Where You Went Wrong:** ${cc.whereYouWentWrong || ""}`,
                "",
                mcqBlock(mcq1, "Practice Q1"),
                mcqBlock(mcq2, "Practice Q2"),
              ]
                .filter(Boolean)
                .join("\n\n");
            })
            .join("\n\n---\n\n");
        }
      } catch {
        // Fallback: render raw string if not valid JSON
        reply = rawReply || "Analysis complete.";
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.role !== "system-auto"),
        {
          role: "assistant",
          content: reply,
          timestamp: new Date().toISOString(),
          isAnalysis: isAutoAnalysis,
        },
      ]);
    } catch (err) {
      console.error("QuizResultChatPanel: /test-prep-analysis failed", err);
      const fallback = isAutoAnalysis
        ? buildLocalFallback(evalData, classNum, subject)
        : "Sorry, I could not process that. Please try again.";

      setMessages((prev) => [
        ...prev.filter((m) => m.role !== "system-auto"),
        {
          role: "assistant",
          content: fallback,
          timestamp: new Date().toISOString(),
          isAnalysis: isAutoAnalysis,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const text = newMessage.trim();
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      },
    ]);
    setNewMessage("");
    setIsLoading(true);

    const contextualQuery = `[Student quiz context: Class ${classNum} ${subject}, Score: ${(evalData?.prediction?.score_pct ?? 0).toFixed(0)}%]\n\nStudent question: ${text}`;

    setMessages((prev) => [
      ...prev,
      {
        role: "system-auto",
        content: "...",
        timestamp: new Date().toISOString(),
      },
    ]);

    await callChatbot(contextualQuery, false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!evalData) return null;

  return (
    <div className={`qrcp-wrapper ${isOpen ? "open" : "closed"}`}>
      {/* Toggle Button */}
      <button
        className={`qrcp-toggle-btn ${isOpen ? "active" : ""} ${analysisTriggered && !isOpen ? "pulse" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="qrcp-toggle-icon">{isOpen ? "✕" : "🤖"}</span>
        <span className="qrcp-toggle-label">
          {isOpen ? "Close Analysis" : "AI Analysis"}
        </span>
        {!isOpen && analysisTriggered && <span className="qrcp-badge">1</span>}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="qrcp-panel">
          {/* Header */}
          <div className="qrcp-header">
            <div className="qrcp-header-left">
              <span className="qrcp-header-icon">🤖</span>
              <div>
                <div className="qrcp-header-title">AI Tutor Analysis</div>
                <div className="qrcp-header-sub">
                  {sessionReady && sessionId
                    ? "Personalized feedback on your quiz"
                    : sessionReady
                      ? "Offline mode"
                      : "Connecting..."}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="qrcp-messages">
            {messages.length === 0 && !isLoading && (
              <div className="qrcp-empty">
                Preparing your personalized analysis...
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`qrcp-msg ${msg.role}`}>
                {msg.role === "system-auto" ? (
                  <div className="qrcp-thinking">
                    <span className="qrcp-dot" />
                    <span className="qrcp-dot" />
                    <span className="qrcp-dot" />
                    {msg.content !== "..." && (
                      <span
                        style={{
                          marginLeft: 8,
                          color: "#6366f1",
                          fontSize: "0.85rem",
                        }}
                      >
                        {msg.content}
                      </span>
                    )}
                  </div>
                ) : msg.role === "assistant" ? (
                  <div
                    className={`qrcp-bubble assistant ${msg.isAnalysis ? "analysis-bubble" : ""}`}
                  >
                    <MarkdownWithMath content={msg.content} />
                    <span className="qrcp-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ) : (
                  <div className="qrcp-bubble user">
                    <p>{msg.content}</p>
                    <span className="qrcp-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages.every((m) => m.role !== "system-auto") && (
              <div className="qrcp-msg assistant">
                <div className="qrcp-thinking">
                  <span className="qrcp-dot" />
                  <span className="qrcp-dot" />
                  <span className="qrcp-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="qrcp-input-area">
            <textarea
              className="qrcp-input"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a follow-up question..."
              rows={2}
              disabled={isLoading || !sessionReady}
            />
            <button
              className="qrcp-send-btn"
              onClick={handleSendMessage}
              disabled={isLoading || !newMessage.trim() || !sessionReady}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizResultChatPanel;
