import axios from "axios";
import axiosInstance from "./axiosInstance";

const QUIZ_API_BASE = "https://quizmode.smartlearners.ai";

const quizApi = axios.create({
  baseURL: QUIZ_API_BASE,
  timeout: 1200000,
  headers: { "Content-Type": "application/json" },
});

export const fetchClasses = (subject) => {
  const params = subject && subject !== "PHYSICS" ? { subject } : {};
  return quizApi.get("/api/v1/classes", { params });
};

export const fetchChapters = (classNum, subject) => {
  const params = subject ? { subject } : {};
  return quizApi.get(`/api/v1/classes/${classNum}/chapters`, { params });
};

export const generateQuestions = (payload) =>
  quizApi.post("/api/v1/generate-questions", payload);

export const evaluateAnswers = (payload) =>
  quizApi.post("/api/evaluate-exam/", payload);

export const fetchCheatsheet = (payload) =>
  quizApi.post("/api/v1/fetch-cheatsheet", payload);

// learning path questions targeting broken/weak bridges
export const generateLearningPath = (payload) =>
  quizApi.post("/api/generate-learning-path", payload);

// Fetch subtopic names for Class 9 Math
export const fetchSubtopicNames = ({ classid, subjectid, topicid }) =>
  axiosInstance.post("/backend/api/updated-subtopic-questions/", {
    classid,
    subjectid,
    topicid,
    sub_topic_names: true,
  });

// Fetch subtopics for a single chapter (Class 9 MATHEMATICS only)
// Returns { class_num, chapter, sub_topics: string[] }
export const fetchChapterSubtopics = (classNum, chapter, subject) =>
  quizApi.get(
    `/api/v1/classes/${classNum}/chapters/${encodeURIComponent(chapter)}/subtopics`,
    { params: { subject } },
  );

export default quizApi;
