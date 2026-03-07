// src/contexts/ChatContext.js
import React, { createContext, useState, useCallback } from "react";

export const ChatContext = createContext();

// ── Build the wrong-questions query sent to /test-prep-analysis ──
const buildQueryString = (questions = [], answers = []) => {
  const answerMap = {};
  if (Array.isArray(answers)) {
    answers.forEach((a) => {
      answerMap[a.question_num] = a.selected_option;
    });
  } else if (answers && typeof answers === "object") {
    Object.entries(answers).forEach(([idx, val]) => {
      const qNum = questions[Number(idx)]?.question_num;
      if (qNum !== undefined) answerMap[qNum] = val;
    });
  }

  if (!questions.length) return "";

  const wrongQuestions = questions.filter((q) => {
    const selected = answerMap[q.question_num];
    return selected && selected !== q.correct_answer;
  });

  if (wrongQuestions.length === 0) {
    return JSON.stringify({ questions: [] });
  }

  return wrongQuestions
    .map((q, idx) => {
      const selected = answerMap[q.question_num] || "N/A";
      const opts = q.options || {};
      const optionsStr = Object.entries(opts)
        .map(([k, v]) => `${k}) ${v}`)
        .join(" | ");
      const isTrapHit = selected !== "N/A" && selected !== q.correct_answer;
      return [
        `Q${idx + 1}. ${q.question || ""}`,
        `Chapter: ${q.chapter || "N/A"}`,
        `Options: ${optionsStr}`,
        `Correct Answer: ${q.correct_answer || "N/A"}`,
        `Student Answer: ${selected}`,
        `Trap: ${isTrapHit ? q.trap_explanation || "N/A" : "N/A"}`,
      ].join("\n");
    })
    .join("\n\n");
};

export const ChatProvider = ({ children }) => {
  const [pendingAnalysis, setPendingAnalysis] = useState(null);

  const triggerAnalysis = useCallback(
    (evalData, classNum, subject, timeSpent, questions = [], answers = []) => {
      if (!evalData) return;
      const queryString = buildQueryString(questions, answers);
      setPendingAnalysis({
        prompt: queryString,
        displayText: "Evaluating your performance...",
      });
    },
    [],
  );

  const clearPendingAnalysis = useCallback(() => {
    setPendingAnalysis(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{ pendingAnalysis, triggerAnalysis, clearPendingAnalysis }}
    >
      {children}
    </ChatContext.Provider>
  );
};
