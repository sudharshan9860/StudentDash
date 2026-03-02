// src/components/QuizResultChatPanel.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import MarkdownWithMath from "./MarkdownWithMath";
import "./QuizResultChatPanel.css";

// ── Same API base used by ChatBox.jsx and ChatBotPage.jsx ──
const API_URL = "https://chatbot.smartlearners.ai";
const api = axios.create({ baseURL: API_URL, timeout: 300000 });

// ── Build the full analysis prompt — ALL quiz data embedded directly in query ──
// The /chat-simple endpoint only reads the "query" field.
// exam_data in create_session gives background context but is not reliably
// forwarded to every chat_simple call by all server implementations.
// So we put everything the AI needs right inside the query string itself.
const buildAnalysisPrompt = (
  evalData,
  questions,
  classNum,
  subject,
  timeSpent,
) => {
  const prediction = evalData?.prediction || {};
  const analysis = evalData?.analysis || {};
  const remedialPlan = evalData?.remedial_plan || {};
  const graphData = evalData?.graph_data || {};

  const scorePct = (prediction.score_pct ?? analysis.score_pct ?? 0).toFixed(0);
  const correct = prediction.correct ?? analysis.correct ?? 0;
  const total = prediction.total ?? analysis.total ?? questions.length;
  const timeMins = Math.floor((timeSpent || 0) / 60);
  const timeSecs = (timeSpent || 0) % 60;

  // Chapter breakdown
  const chapterBreakdown = graphData.chapter_breakdown || [];
  const chapterLines = chapterBreakdown.length
    ? chapterBreakdown
        .map(
          (c) =>
            `  - ${c.chapter}: ${c.correct}/${c.total} correct (${Number(c.score_pct ?? 0).toFixed(0)}%)`,
        )
        .join("\n")
    : "  - No chapter breakdown available";

  // Bridge results
  const bridgeResults =
    analysis.bridge_results || evalData.ai_bridge_evaluations || [];
  const brokenBridges = bridgeResults
    .filter((b) => b.status === "broken")
    .map((b) => b.bridge_name);
  const weakBridges = bridgeResults
    .filter((b) => b.status === "weak")
    .map((b) => b.bridge_name);

  // Remedial plan
  const studyPlanSummary = remedialPlan.study_plan_summary || {};
  const bridgeRepairs = (remedialPlan.bridge_repairs || []).slice(0, 4);
  const foundationRepairs = (remedialPlan.foundation_repairs || []).slice(0, 3);
  const priorityOrder = studyPlanSummary.priority_order || [];

  const bridgeRepairLines = bridgeRepairs.length
    ? bridgeRepairs
        .map(
          (b) =>
            `  - ${b.bridge_name} (${b.chapter || ""}): ${b.what_went_wrong || ""}`,
        )
        .join("\n")
    : "  - None identified";

  const foundationLines = foundationRepairs.length
    ? foundationRepairs
        .map(
          (f) =>
            `  - ${f.concept_name || f.id || "Unknown"}: ${f.what_went_wrong || ""}`,
        )
        .join("\n")
    : "  - None identified";

  const priorityLines = priorityOrder.length
    ? priorityOrder.map((p, i) => `  ${i + 1}. ${p}`).join("\n")
    : "  - Review all chapters";

  return `You are an expert AI tutor for Class ${classNum} ${subject}.
A student just completed a Test Prep quiz. I am sharing their full results below.
Please give them a warm, specific, and encouraging analysis in simple language suitable for a school student.

=== QUIZ RESULT ===
Subject: ${subject}
Class: ${classNum}
Score: ${scorePct}% (${correct} out of ${total} correct)
Time Taken: ${timeMins} min ${timeSecs} sec

=== CHAPTER PERFORMANCE ===
${chapterLines}

=== CONCEPT GAPS (Bridge Scan) ===
Broken Bridges (critical gaps): ${brokenBridges.length ? brokenBridges.join(", ") : "None"}
Weak Bridges (partial understanding): ${weakBridges.length ? weakBridges.join(", ") : "None"}

=== TOP THINGS TO FIX ===
${bridgeRepairLines}

=== FOUNDATION GAPS ===
${foundationLines}

=== PRIORITY STUDY ORDER ===
${priorityLines}

=== EXPECTED IMPROVEMENT ===
${studyPlanSummary.expected_improvement || "Focus on the identified weak areas."}

Total Estimated Study Time: ${studyPlanSummary.total_study_time || "Not specified"}
===================

Now give the student:
1. A brief encouraging opening (1–2 sentences)
2. What they did well (specific chapter or concept if score > 0)
3. The 2–3 most important mistakes — explain WHY they happen in simple words
4. A clear 3-step action plan for this week
5. A short motivational closing line

Keep the total response under 300 words. Use simple language. Do not mention "bridges" as a technical term — call them "key concepts" instead.`;
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
  const autoSentRef = useRef(false); // prevents double-fire in React StrictMode

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Step 1: Create session on mount ────────────────────────────────────────
  useEffect(() => {
    if (!evalData) return;
    createSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createSession = async () => {
    try {
      // We pass quiz data both as exam_data (for session context)
      // AND will embed it in the query itself (for guaranteed delivery)
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

      setSessionId(res.data.session_id);
      setSessionReady(true);
    } catch (err) {
      console.error("QuizResultChatPanel: session creation failed", err);
      setSessionReady(true); // still proceed so fallback analysis can show
    }
  };

  // ── Step 2: Once session is ready, auto-open panel & trigger analysis ───────
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

  // ── Build and send the full analysis prompt ─────────────────────────────────
  const triggerAutoAnalysis = async () => {
    const prompt = buildAnalysisPrompt(
      evalData,
      questions,
      classNum,
      subject,
      timeSpent,
    );

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

  // ── Core chat call ─────────────────────────────────────────────────────────
  // Uses /chat-simple with session_id and full query (matches ChatBox.jsx)
  const callChatbot = async (messageText, isAutoAnalysis = false) => {
    if (!sessionId) {
      // No session — show local fallback immediately
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
      const res = await api.post(
        "/test-prep-analysis",
        {
          session_id: sessionId,
          query: messageText, // full quiz data is embedded in this string for auto-analysis
          language: "en",
        },
        {
          headers: { session_token: sessionId },
        },
      );

      const reply =
        res?.data?.response || res?.data?.reply || "Analysis complete.";

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
      console.error("QuizResultChatPanel: chat-simple failed", err);
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

  // ── Follow-up message ───────────────────────────────────────────────────────
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

    // For follow-up: add a brief reminder of context so AI doesn't lose track
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

  // ── Render ──────────────────────────────────────────────────────────────────
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
