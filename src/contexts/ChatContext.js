import React, { createContext, useState, useCallback } from "react";

export const ChatContext = createContext();

const buildAnalysisPrompt = (evalData, classNum, subject, timeSpent) => {
  const prediction = evalData.prediction || {};
  const analysis = evalData.analysis || {};
  const graphData = evalData.graph_data || {};
  const remedialPlan = evalData.remedial_plan || {};
  const bridgeEvals = evalData.ai_bridge_evaluations || analysis.bridge_results || [];
  const studyPlanSummary = (typeof remedialPlan === "object" ? remedialPlan.study_plan_summary : null) || {};
  const foundationRepairs = (typeof remedialPlan === "object" ? remedialPlan.foundation_repairs : null) || [];
  const bridgeRepairs = (typeof remedialPlan === "object" ? remedialPlan.bridge_repairs : null) || [];

  const scorePct = prediction.score_pct ?? analysis.score_pct ?? 0;
  const correct = prediction.correct ?? analysis.correct ?? 0;
  const total = prediction.total ?? analysis.total ?? 0;
  const timeMins = Math.floor((timeSpent || 0) / 60);
  const timeSecs = (timeSpent || 0) % 60;

  // Chapter performance
  const chapterBreakdown = graphData.chapter_breakdown || [];
  const chapterLines = chapterBreakdown.length > 0
    ? chapterBreakdown.map((ch) => `- ${ch.chapter}: ${ch.correct}/${ch.total} (${ch.score_pct}%)`).join("\n")
    : "No chapter-level data available.";

  // Bridge gaps
  const brokenBridges = bridgeEvals.filter((b) => b.status === "broken").map((b) => b.bridge_name);
  const weakBridges = bridgeEvals.filter((b) => b.status === "weak").map((b) => b.bridge_name);

  // Bridge repair lines
  const bridgeRepairLines = bridgeRepairs.length > 0
    ? bridgeRepairs.map((r) => `- ${r.bridge_name}: ${r.what_went_wrong || "Needs review"}`).join("\n")
    : "No specific repair suggestions.";

  // Foundation lines
  const foundationLines = foundationRepairs.length > 0
    ? foundationRepairs.map((f) => `- ${f.concept_name} (Class ${f.concept_class || "?"}, ${f.chapter || "?"}): ${f.concept_explanation || ""}`.slice(0, 200)).join("\n")
    : "No foundation gaps identified.";

  // Priority lines
  const priorityOrder = studyPlanSummary.priority_order || [];
  const priorityLines = priorityOrder.length > 0
    ? priorityOrder.join("\n")
    : "No specific priority order.";

  return `You are an expert AI tutor for Class ${classNum || "?"} ${subject || "?"}.
A student just completed a Test Prep. I am sharing their full results below.
Please give them a warm, specific, and encouraging analysis in simple language suitable for a school student.

=== TEST RESULT ===
Subject: ${subject || "N/A"}
Class: ${classNum || "N/A"}
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

export const ChatProvider = ({ children }) => {
  const [pendingAnalysis, setPendingAnalysis] = useState(null);

  const triggerAnalysis = useCallback((evalData, classNum, subject, timeSpent) => {
    if (!evalData) return;
    const fullPrompt = buildAnalysisPrompt(evalData, classNum, subject, timeSpent);
    setPendingAnalysis({
      prompt: fullPrompt,
      displayText: "Evaluating your performance...",
    });
  }, []);

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
