// src/components/ChatBotPage.jsx
import React, { useEffect, useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faUpload,
  faMicrophone,
  faStop,
  faTrash,
  faChartLine,
  faExclamationTriangle,
  faBook,
  faGraduationCap,
  faRobot,
  faLightbulb,
  faWandMagicSparkles,
  faTimes,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import MarkdownWithMath from "./MarkdownWithMath";
import "./ChatBotPage.css";
import { useAlert } from "./AlertBox";
import { AuthContext } from "./AuthContext";
import axiosInstance from "../api/axiosInstance";
import { useCurrentQuestion } from "../contexts/CurrentQuestionContext";
import { useTutorial } from "../contexts/TutorialContext";
import { getImageSrc } from "../utils/imageUtils";
import { useGetStudentResultsQuery } from "../store/api/studentResultsApi";
import lightModeGif from "../assets/1080x1080.gif";
import darkModeGif from "../assets/1080x1080 (1).gif";

const API_URL = "https://chatbot.smartlearners.ai";
const api = axios.create({ baseURL: API_URL, timeout: 300000 });

const formatMessage = (text) => {
  if (!text) return null;
  if (Array.isArray(text)) {
    return (
      <div className="paragraph-solution">
        {text.map((p, i) => (
          <p key={i} className="solution-paragraph">
            <MarkdownWithMath content={p} />
          </p>
        ))}
      </div>
    );
  }
  return <MarkdownWithMath content={text} />;
};

// Video List (reused from ChatBox)
const VideoListComponent = ({ videos }) => {
  if (!videos || videos.length === 0) return null;
  return (
    <div className="chat-video-list-container">
      {videos.map((videoGroup, gi) => (
        <div key={gi} className="video-group">
          {videoGroup.concept_name && (
            <h6 className="video-concept-title">{videoGroup.concept_name}</h6>
          )}
          {videoGroup.videos &&
            videoGroup.videos.map((video, vi) => (
              <div
                key={`${gi}-${vi}`}
                className="video-card"
                onClick={() => window.open(video.url, "_blank", "noopener,noreferrer")}
                role="button"
                tabIndex={0}
              >
                <div className="video-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000" width="32" height="32">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div className="video-info">
                  <div className="video-title">{video.title}</div>
                  <div className="video-meta">
                    {video.channel && <span className="video-meta-item">{video.channel}</span>}
                    {video.duration && <span className="video-meta-item">{video.duration}</span>}
                  </div>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

const ChatBotPage = () => {
  const navigate = useNavigate();
  const { username } = useContext(AuthContext);
  const { showAlert, AlertContainer } = useAlert();
  const className = localStorage.getItem("className");
  const userRole = localStorage.getItem("userRole");
  const { currentQuestion, questionMetadata } = useCurrentQuestion();
  const { resetTutorial, startTutorialForPage } = useTutorial();

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");

  useEffect(() => {
    const handler = (e) => setIsDarkMode(e.detail.isDarkMode);
    window.addEventListener("darkModeChange", handler);
    return () => window.removeEventListener("darkModeChange", handler);
  }, []);

  // Session + connection
  const [sessionId, setSessionId] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("checking");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState("en");
  const [hasStartedChat, setHasStartedChat] = useState(false);

  // File handling
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [inputText, setInputText] = useState("");

  // Correct image modal
  const [showCorrectImageModal, setShowCorrectImageModal] = useState(false);
  const [correctImageFiles, setCorrectImageFiles] = useState([]);
  const [correctImagePreviews, setCorrectImagePreviews] = useState([]);
  const correctFileInputRef = useRef(null);

  // Audio
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Exam dropdown
  const [selectedExam, setSelectedExam] = useState("");
  const [showExamDropdown, setShowExamDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const durationOptions = [
    { label: "1 Hour", value: "1 hour" },
    { label: "2 Hours", value: "2 hours" },
    { label: "5 Hours", value: "5 hours" },
    { label: "1 Day", value: "1 day" },
    { label: "3 Days", value: "3 days" },
    { label: "7 Days", value: "7 days" },
  ];

  const { data: studentResults, isLoading: isLoadingExams } = useGetStudentResultsQuery(undefined, {
    skip: userRole !== "student",
  });

  const examNames = (() => {
    if (!studentResults) return [];
    const results = studentResults.results || studentResults;
    if (Array.isArray(results)) return results.map((r) => r.exam_name).filter(Boolean);
    return [];
  })();

  const messagesEndRef = useRef(null);
  const hasInitialized = useRef(false);

  const includeQuestionContext = (() => {
    const stored = localStorage.getItem("include_question_context");
    return stored === null ? true : stored === "true";
  })();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ====== SESSION HANDLING (same logic as ChatBox) ======
  useEffect(() => {
    if (hasInitialized.current || !username) return;
    hasInitialized.current = true;
    fetchStudentDataAndCreateSession();
  }, [username]);

  const fetchStudentData = async () => {
    try {
      const response = await axiosInstance.post("dummy/", { homework: "true", agentic_data: "true" });
      if (response.data && response.data[username]) return response.data[username];
      return null;
    } catch { return null; }
  };

  const fetchExamData = async () => {
    try {
      const response = await axiosInstance.get("questions-evaluated/");
      return response.data || null;
    } catch { return null; }
  };

  const fetchSelfData = async () => {
    try {
      const response = await axiosInstance.get("list-submissions/");
      return response.data || null;
    } catch { return null; }
  };

  const fetchTeacherExamDetails = async () => {
    try {
      const response = await axiosInstance.get("exam-details/");
      return response.data || null;
    } catch { return null; }
  };

  const fetchStudentDataAndCreateSession = async () => {
    setConnectionStatus("checking");
    try {
      if (userRole === "teacher") {
        const teacherExamDetails = await fetchTeacherExamDetails();
        await createSessionWithData(null, null, null, teacherExamDetails);
        return;
      }
      const data = await fetchStudentData();
      const examdata = await fetchExamData();
      const selfdata = await fetchSelfData();
      let filteredData = null;
      if (data) {
        filteredData = data;
        setStudentInfo(filteredData);
      }
      await createSessionWithData(filteredData, examdata, selfdata, null);
    } catch {
      setConnectionStatus("disconnected");
      setHasStartedChat(true);
      setMessages([{
        id: "conn_fail",
        text: "Unable to connect to AI service. Please refresh.",
        sender: "ai",
        timestamp: new Date(),
      }]);
    }
  };

  const createSessionWithData = async (studentData, examData, selfdata, teacherExamDetails = null) => {
    try {
      const formData = new FormData();
      if (userRole === "student") {
        formData.append("student_name", localStorage.getItem("fullName") || username || "guest_user");
        formData.append("json_data", JSON.stringify({ data: studentData || {} }));
        formData.append("exam_data", JSON.stringify(examData || {}));
        formData.append("class_name", className || "default_class");
        formData.append("user_type", userRole || "student");
        formData.append("self_data", JSON.stringify(selfdata || {}));
      } else if (userRole === "teacher") {
        formData.append("user_type", "teacher");
        formData.append("student_name", localStorage.getItem("fullName") || username || "guest_user");
        formData.append("class_name", className || "default_class");
        formData.append("exam_data", JSON.stringify(teacherExamDetails || {}));
        formData.append("detailed_exam_data", JSON.stringify(teacherExamDetails || {}));
      } else {
        formData.append("user_role", userRole || "student");
        formData.append("student_name", localStorage.getItem("fullName") || username || "guest_user");
        formData.append("class_name", className || "default_class");
      }
      const res = await api.post("/create_session", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!res.data?.session_id) throw new Error("No session_id");
      setSessionId(res.data.session_id);
      setConnectionStatus("connected");
    } catch {
      setConnectionStatus("disconnected");
    }
  };

  const clearChat = async () => {
    if (!sessionId) return;
    try { await api.delete(`/clear-session/${sessionId}`); } catch {}
    setMessages([]);
    setHasStartedChat(false);
    setSessionId(null);
    setConnectionStatus("checking");
    await fetchStudentDataAndCreateSession();
  };

  // ====== FILE HANDLERS ======
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.match("image.*")) { showAlert("Please upload an image file", "warning"); return; }
    if (file.size > 12 * 1024 * 1024) { showAlert("Image must be under 12MB", "warning"); return; }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowImageModal(true);
  };

  const clearSelectedFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowImageModal(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCorrectFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = [];
    const newPreviews = [];
    for (const file of files) {
      if (!file.type.match("image.*")) continue;
      if (file.size > 12 * 1024 * 1024) continue;
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }
    if (validFiles.length > 0) {
      setCorrectImageFiles((prev) => [...prev, ...validFiles]);
      setCorrectImagePreviews((prev) => [...prev, ...newPreviews]);
    }
    if (correctFileInputRef.current) correctFileInputRef.current.value = "";
  };

  const clearCorrectImages = () => {
    correctImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setCorrectImageFiles([]);
    setCorrectImagePreviews([]);
    setShowCorrectImageModal(false);
  };

  // ====== AUDIO ======
  const startRecording = async () => {
    if (isRecording || connectionStatus !== "connected" || !sessionId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recordedChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data?.size > 0) recordedChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        await processAudioBlob(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) { console.error("Recording failed:", err); }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    try { mediaRecorderRef.current.stop(); } catch {}
    setIsRecording(false);
  };

  const processAudioBlob = async (audioBlob) => {
    if (!sessionId) return;
    const id = Date.now();
    setIsTyping(true);
    setHasStartedChat(true);
    setMessages((prev) => [...prev, { id, text: "Processing audio...", sender: "user", timestamp: new Date() }]);
    try {
      const fd = new FormData();
      fd.append("session_id", sessionId);
      fd.append("language", language);
      fd.append("audio", audioBlob, `recording_${id}.webm`);
      const res = await api.post("/process-audio", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const transcription = res?.data?.transcription || "(no transcription)";
      const aiText = res?.data?.response || res?.data?.content || "";
      const audioBase64 = res?.data?.audio_base64 || res?.data?.audio_bytes;
      const aiAudioUrl = audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : null;
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== id);
        return [
          ...filtered,
          { id, text: transcription, sender: "user", timestamp: new Date() },
          { id: id + 1, text: aiText, sender: "ai", timestamp: new Date(), audioUrl: aiAudioUrl },
        ];
      });
    } catch {
      setMessages((prev) => [...prev, { id: id + 1, text: "Could not process audio. Please try again.", sender: "ai", timestamp: new Date() }]);
    } finally { setIsTyping(false); }
  };

  // ====== API ACTIONS (solve/explain/correct) ======
  const handleApiAction = async (apiFlag, actionName, imageFiles = null) => {
    if (!currentQuestion || !questionMetadata) {
      showAlert("Missing question data. Please navigate to a question first.", "error");
      return;
    }
    if (apiFlag === "correct" && (!imageFiles || imageFiles.length === 0)) {
      setShowCorrectImageModal(true);
      return;
    }
    const id = Date.now();
    setHasStartedChat(true);
    setMessages((prev) => [...prev, { id, text: `Requesting ${actionName}...`, sender: "user", timestamp: new Date() }]);
    setIsTyping(true);
    try {
      const formData = new FormData();
      formData.append("class_id", questionMetadata.class_id);
      formData.append("subject_id", questionMetadata.subject_id);
      formData.append("topic_ids", questionMetadata.topic_ids);
      formData.append("subtopic", questionMetadata.subtopic || "");
      formData.append("question_id", currentQuestion.question_id || currentQuestion.id);
      formData.append(apiFlag, true);
      if (apiFlag === "correct" && imageFiles?.length > 0) {
        imageFiles.forEach((file) => formData.append("ans_img", file));
      }
      const response = await axiosInstance.post("/anssubmit/", formData);
      const apiData = response.data.ai_data || response.data;
      let responseText = "";

      if (apiFlag === "solve") {
        if (apiData.ai_explaination && Array.isArray(apiData.ai_explaination)) {
          const steps = apiData.ai_explaination.map((s, i) => `**Step ${i + 1}:**\n\n${s}`).join("\n\n---\n\n");
          responseText = `##### AI Solution\n\n${steps}`;
        } else {
          responseText = apiData.solution || apiData.answer || "Solution generated!";
        }
      } else if (apiFlag === "explain") {
        const concepts = apiData.concepts || response.data.concepts;
        const videos = apiData.videos || response.data.videos;
        if (concepts && Array.isArray(concepts)) {
          const formatted = concepts.map((c, i) => {
            let f = `###### ${i + 1}. ${c.concept}\n\n`;
            if (c.explanation) f += `**Explanation:**\n${c.explanation}\n\n`;
            if (c.example) f += `**Example:**\n${c.example}\n\n`;
            if (c.application) f += `**Application:**\n${c.application}\n\n`;
            return f;
          }).join("\n---\n\n");
          responseText = `#### Key Concepts Required\n\n${formatted}`;
          if (videos?.length > 0) responseText += "\n\n#### Recommended Videos\n\nClick to watch:";
        }
        setMessages((prev) => [...prev, { id: id + 1, text: responseText, sender: "ai", timestamp: new Date(), videos: videos?.length > 0 ? videos : null }]);
        return;
      } else if (apiFlag === "correct") {
        const parts = [];
        if (apiData.total_marks !== undefined) parts.push(`#### Score: ${apiData.obtained_marks}/${apiData.total_marks}`);
        if (apiData.student_answer) parts.push(`\n\n##### Your Answer:\n${apiData.student_answer}`);
        if (apiData.ai_explaination && Array.isArray(apiData.ai_explaination)) {
          const steps = apiData.ai_explaination.map((s, i) => `**Step ${i + 1}:**\n\n${s}`).join("\n\n---\n\n");
          parts.push(`\n\n##### Correct Solution:\n\n${steps}`);
        }
        if (apiData.gap_analysis) parts.push(`\n\n##### Gap Analysis:\n${apiData.gap_analysis}`);
        if (apiData.error_type) parts.push(`\n\n**Error Type:** ${apiData.error_type}`);
        responseText = parts.length > 0 ? parts.join("") : "Correction completed!";
      }
      setMessages((prev) => [...prev, { id: id + 1, text: responseText, sender: "ai", timestamp: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { id: id + 1, text: `Could not process ${actionName}. Please try again.`, sender: "ai", timestamp: new Date() }]);
    } finally { setIsTyping(false); }
  };

  // ====== SEND MESSAGE ======
  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;
    await sendMessageBase(newMessage.trim(), selectedFile);
  };

  const sendImageWithCommand = async (command) => {
    setShowImageModal(false);
    await sendMessageBase(command, selectedFile);
  };

  const sendMessageBase = async (text, imageFile) => {
    if (!sessionId) {
      setHasStartedChat(true);
      setMessages((prev) => [...prev, {
        id: Date.now(),
        text: "Connecting to AI service... Please wait and try again.",
        sender: "ai",
        timestamp: new Date(),
      }]);
      return;
    }
    const id = Date.now();
    setHasStartedChat(true);
    setMessages((prev) => [...prev, {
      id, text, sender: "user", timestamp: new Date(),
      image: imageFile ? previewUrl : null,
    }]);
    setNewMessage("");
    setIsTyping(true);

    try {
      let combinedQuery = `${text || ""}`.trim();
      if (includeQuestionContext && currentQuestion && (currentQuestion.question || currentQuestion.image)) {
        const contextParts = [];
        if (currentQuestion.question) contextParts.push(`Question: ${currentQuestion.question}`);
        if (currentQuestion.image) {
          try {
            const base64 = await getImageSrc(currentQuestion.image);
            contextParts.push(`Question Image: ${base64}`);
          } catch {
            contextParts.push(`Question Image: ${currentQuestion.image}`);
          }
        }
        combinedQuery = [combinedQuery, contextParts.join("\n")].filter(Boolean).join("\n\nContext:\n");
      }

      if (imageFile) {
        const fd = new FormData();
        fd.append("session_id", sessionId);
        fd.append("query", combinedQuery);
        fd.append("language", language);
        fd.append("image", imageFile, imageFile.name || `image_${id}.jpg`);
        const res = await api.post("/chat", fd, { headers: { "Content-Type": "multipart/form-data" } });
        const audioBase64 = res?.data?.audio_base64;
        setMessages((prev) => [...prev, {
          id: id + 1,
          text: res?.data?.response || "Image analyzed!",
          sender: "ai",
          timestamp: new Date(),
          audioUrl: audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : null,
        }]);
      } else {
        const res = await api.post("/chat-simple", {
          session_id: sessionId, query: combinedQuery, language,
        }, { headers: { session_token: sessionId } });
        const audioBase64 = res?.data?.aiAudioUrl;
        setMessages((prev) => [...prev, {
          id: id + 1,
          text: res?.data?.response || "Message received!",
          sender: "ai",
          timestamp: new Date(),
          audioUrl: audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : null,
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: id + 1,
        text: "Something went wrong. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
      clearSelectedFile();
    }
  };

  // ====== SUGGESTION CARDS CONFIG ======
  const studentSuggestions = [
    {
      icon: faChartLine, color: "blue",
      title: "My Progress", desc: "View your learning analytics",
      message: "What is my progress?",
    },
    {
      icon: faExclamationTriangle, color: "amber",
      title: "Weak Areas", desc: "Identify areas for improvement",
      message: "What are my weaknesses?",
    },
    {
      icon: faBook, color: "emerald",
      title: "Remedial Plan", desc: "Personalized study schedule",
      isDurationDropdown: true,
    },
    {
      icon: faLightbulb, color: "purple",
      title: "Exam Analysis", desc: "Question-wise breakdown",
      isExamDropdown: true,
    },
  ];

  const teacherSuggestions = [
    {
      icon: faChartLine, color: "blue",
      title: "Class Overview", desc: "Performance across all students",
      message: "Show class performance overview",
    },
    {
      icon: faLightbulb, color: "purple",
      title: "Exam Analysis", desc: "Tabular exam-wise breakdown",
      message: "Give me exam-wise analysis in tabular format",
    },
  ];

  const suggestions = userRole === "teacher" ? teacherSuggestions : studentSuggestions;

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.isExamDropdown) {
      setShowExamDropdown((prev) => !prev);
      setShowDurationDropdown(false);
      return;
    }
    if (suggestion.isDurationDropdown) {
      setShowDurationDropdown((prev) => !prev);
      setShowExamDropdown(false);
      return;
    }
    if (suggestion.message) {
      setNewMessage(suggestion.message);
    }
  };

  const handleExamSelect = (examName) => {
    setSelectedExam(examName);
    setShowExamDropdown(false);
    setNewMessage(`Give me question-wise analysis of exam name ${examName} with exact errors made in tabular format`);
  };

  const handleDurationSelect = (duration) => {
    setShowDurationDropdown(false);
    setNewMessage(`Give remedial program for ${duration} as per my weaknesses`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const getUserInitials = () => {
    const name = localStorage.getItem("fullName") || username || "U";
    const parts = name.split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const botAvatar = isDarkMode ? darkModeGif : lightModeGif;

  // ====== RENDER ======
  return (
    <>
      <AlertContainer />
      <div className="chatbot-page">
        {/* If no conversation yet, show welcome + cards */}
        {!hasStartedChat && messages.length === 0 ? (
          <>
            <div className="chatbot-welcome">
              <div className="chatbot-welcome-avatar">
                <img src={botAvatar} alt="AI Assistant" />
              </div>
              <h1 className="chatbot-welcome-title">
                {userRole === "teacher" ? "Class Analytics Assistant" : "How can I help you today?"}
              </h1>
              <p className="chatbot-welcome-subtitle">
                {userRole === "teacher"
                  ? "Get instant insights on student performance, exam results, and class analytics."
                  : "Ask doubts, analyze performance, get personalized study plans, or upload questions for instant solutions."}
              </p>

              <div className="chatbot-suggestions-grid">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="chatbot-suggestion-card"
                    onClick={() => handleSuggestionClick(s)}
                  >
                    <div className={`chatbot-card-icon ${s.color}`}>
                      <FontAwesomeIcon icon={s.icon} />
                    </div>
                    <div className="chatbot-card-content">
                      <div className="chatbot-card-title">{s.title}</div>
                      <div className="chatbot-card-desc">{s.desc}</div>
                    </div>
                    <span className="chatbot-card-arrow">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </span>
                  </div>
                ))}
              </div>

              {/* Exam selector dropdown */}
              {showExamDropdown && (
                <div className="chatbot-input-suggestions" style={{ marginTop: 16, justifyContent: "center" }}>
                  {isLoadingExams ? (
                    <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Loading exams...</span>
                  ) : examNames.length === 0 ? (
                    <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>No exams found</span>
                  ) : (
                    examNames.map((name, i) => (
                      <button key={i} className="chatbot-input-chip" onClick={() => handleExamSelect(name)}>
                        {name}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Duration selector dropdown */}
              {showDurationDropdown && (
                <div className="chatbot-input-suggestions" style={{ marginTop: 16, justifyContent: "center" }}>
                  {durationOptions.map((opt, i) => (
                    <button key={i} className="chatbot-input-chip" onClick={() => handleDurationSelect(opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input bar at bottom */}
            <div className="chatbot-input-bar">
              <div className="chatbot-input-wrapper">
                <form onSubmit={sendMessage}>
                  <div className="chatbot-input-box">
                    {previewUrl && (
                      <div className="chatbot-image-preview">
                        <img src={previewUrl} alt="Preview" />
                        <button type="button" onClick={clearSelectedFile}>
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    )}
                    <input
                      type="text"
                      className="chatbot-input-field"
                      placeholder={
                        connectionStatus === "connected"
                          ? userRole === "teacher"
                            ? "Ask about student performance, exams..."
                            : "Ask a question, upload a problem..."
                          : "Connecting..."
                      }
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={connectionStatus !== "connected" || isTyping}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleFile(e.target.files?.[0])}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                    <div className="chatbot-input-actions">
                      <button
                        type="button"
                        className="chatbot-input-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={connectionStatus !== "connected" || isTyping}
                        title="Upload image"
                      >
                        <FontAwesomeIcon icon={faUpload} />
                      </button>
                      <button
                        type="button"
                        className={`chatbot-input-btn ${isRecording ? "recording" : ""}`}
                        onClick={() => (isRecording ? stopRecording() : startRecording())}
                        disabled={connectionStatus !== "connected" || isTyping}
                        title={isRecording ? "Stop recording" : "Voice input"}
                      >
                        <FontAwesomeIcon icon={isRecording ? faStop : faMicrophone} />
                      </button>
                      <button
                        type="submit"
                        className="chatbot-input-btn send"
                        disabled={connectionStatus !== "connected" || isTyping || (!newMessage.trim() && !selectedFile)}
                        title="Send"
                      >
                        <FontAwesomeIcon icon={faPaperPlane} />
                      </button>
                    </div>
                  </div>
                </form>
                <p className="chatbot-disclaimer">
                  AI can make mistakes. Always verify important information.
                </p>
              </div>
            </div>
          </>
        ) : (
          /* ====== CONVERSATION VIEW ====== */
          <div className="chatbot-conversation">
            {/* Top bar */}
            <div className="chatbot-topbar">
              <div className="chatbot-topbar-left">
                <img src={botAvatar} alt="AI" className="chatbot-topbar-avatar" />
                <div>
                  <div className="chatbot-topbar-title">
                    {userRole === "teacher" ? "Analytics Assistant" : "Math Assistant"}
                  </div>
                  <div className="chatbot-topbar-status">
                    {connectionStatus === "connected" ? "Online" : connectionStatus === "checking" ? "Connecting..." : "Offline"}
                  </div>
                </div>
              </div>
              <div className="chatbot-topbar-actions">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="chatbot-topbar-lang"
                >
                  <option value="en">EN</option>
                  <option value="hi">HI</option>
                  <option value="te">TE</option>
                </select>
                <button
                  className="chatbot-topbar-btn"
                  onClick={clearChat}
                  disabled={!sessionId}
                  title="New chat"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chatbot-messages-area">
              {messages.map((m) => (
                <div key={m.id} className={`chatbot-msg ${m.sender === "user" ? "user" : "ai"}`}>
                  {m.sender === "ai" ? (
                    <div className="chatbot-msg-avatar">
                      <img src={botAvatar} alt="AI" />
                    </div>
                  ) : (
                    <div className="chatbot-msg-avatar user-avatar">
                      {getUserInitials()}
                    </div>
                  )}
                  <div>
                    <div className="chatbot-msg-bubble">
                      <div><MarkdownWithMath content={m.text} /></div>
                      {m.videos && <VideoListComponent videos={m.videos} />}
                      {m.audioUrl && (
                        <div style={{ marginTop: 8 }}>
                          <audio controls src={m.audioUrl} />
                        </div>
                      )}
                      {m.image && (
                        <div style={{ marginTop: 8 }}>
                          <img src={m.image} alt="Uploaded" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }} />
                        </div>
                      )}
                    </div>
                    <div className="chatbot-msg-time">
                      {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chatbot-msg ai">
                  <div className="chatbot-msg-avatar">
                    <img src={botAvatar} alt="AI" />
                  </div>
                  <div className="chatbot-typing">
                    <span className="chatbot-typing-dot"></span>
                    <span className="chatbot-typing-dot"></span>
                    <span className="chatbot-typing-dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="chatbot-input-bar">
              <div className="chatbot-input-wrapper">
                {/* Quick suggestions row */}
                {!isTyping && (
                  <div className="chatbot-input-suggestions" style={{ marginBottom: 8 }}>
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        className="chatbot-input-chip"
                        onClick={() => handleSuggestionClick(s)}
                      >
                        <FontAwesomeIcon icon={s.icon} style={{ fontSize: "0.7rem" }} />
                        {s.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Exam/Duration dropdowns */}
                {showExamDropdown && (
                  <div className="chatbot-input-suggestions" style={{ marginBottom: 8 }}>
                    {isLoadingExams ? (
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Loading...</span>
                    ) : examNames.length === 0 ? (
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>No exams</span>
                    ) : (
                      examNames.map((name, i) => (
                        <button key={i} className="chatbot-input-chip" onClick={() => handleExamSelect(name)}>
                          {name}
                        </button>
                      ))
                    )}
                  </div>
                )}
                {showDurationDropdown && (
                  <div className="chatbot-input-suggestions" style={{ marginBottom: 8 }}>
                    {durationOptions.map((opt, i) => (
                      <button key={i} className="chatbot-input-chip" onClick={() => handleDurationSelect(opt.value)}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={sendMessage}>
                  <div className="chatbot-input-box">
                    {previewUrl && (
                      <div className="chatbot-image-preview">
                        <img src={previewUrl} alt="Preview" />
                        <button type="button" onClick={clearSelectedFile}>
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    )}
                    <input
                      type="text"
                      className="chatbot-input-field"
                      placeholder={
                        connectionStatus === "connected"
                          ? "Type your question..."
                          : "Connecting..."
                      }
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={connectionStatus !== "connected" || isTyping}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleFile(e.target.files?.[0])}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                    <div className="chatbot-input-actions">
                      <button
                        type="button"
                        className="chatbot-input-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={connectionStatus !== "connected" || isTyping}
                        title="Upload"
                      >
                        <FontAwesomeIcon icon={faUpload} />
                      </button>
                      <button
                        type="button"
                        className={`chatbot-input-btn ${isRecording ? "recording" : ""}`}
                        onClick={() => (isRecording ? stopRecording() : startRecording())}
                        disabled={connectionStatus !== "connected" || isTyping}
                        title={isRecording ? "Stop" : "Voice"}
                      >
                        <FontAwesomeIcon icon={isRecording ? faStop : faMicrophone} />
                      </button>
                      <button
                        type="submit"
                        className="chatbot-input-btn send"
                        disabled={connectionStatus !== "connected" || isTyping || (!newMessage.trim() && !selectedFile)}
                        title="Send"
                      >
                        <FontAwesomeIcon icon={faPaperPlane} />
                      </button>
                    </div>
                  </div>
                </form>
                <p className="chatbot-disclaimer">
                  AI can make mistakes. Always verify important information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Image Action Modal */}
        <Modal show={showImageModal} onHide={clearSelectedFile} centered>
          <Modal.Header closeButton>
            <Modal.Title>Choose Analysis</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {previewUrl && (
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <img src={previewUrl} alt="preview" style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 8, objectFit: "contain" }} />
              </div>
            )}
            <div className="d-grid gap-2">
              <Button variant="primary" onClick={() => sendImageWithCommand("solve it")} disabled={connectionStatus !== "connected"}>
                Solve It
              </Button>
              <Button variant="success" onClick={() => sendImageWithCommand("correct it")} disabled={connectionStatus !== "connected"}>
                Correct It
              </Button>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #dee2e6" }}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Custom instruction..."
                />
                <Button onClick={() => sendImageWithCommand(inputText)} disabled={connectionStatus !== "connected"}>
                  Send
                </Button>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={clearSelectedFile}>Cancel</Button>
          </Modal.Footer>
        </Modal>

        {/* AI-Correct Multi-Image Modal */}
        <Modal show={showCorrectImageModal} onHide={clearCorrectImages} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Upload Your Solution for AI-Correct</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted mb-3">Upload images of your handwritten solution.</p>
            <input type="file" ref={correctFileInputRef} onChange={handleCorrectFileChange} accept="image/*" multiple style={{ display: "none" }} />
            {correctImagePreviews.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8, marginBottom: 16 }}>
                {correctImagePreviews.map((p, i) => (
                  <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: "1px solid #dee2e6" }}>
                    <img src={p} alt={`${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => {
                        setCorrectImagePreviews((prev) => { if (prev[i]) URL.revokeObjectURL(prev[i]); return prev.filter((_, j) => j !== i); });
                        setCorrectImageFiles((prev) => prev.filter((_, j) => j !== i));
                      }}
                      style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", border: "none", background: "rgba(220,53,69,0.9)", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >x</button>
                  </div>
                ))}
              </div>
            )}
            <div
              style={{ border: "2px dashed #dee2e6", borderRadius: 8, padding: 24, textAlign: "center", cursor: "pointer", background: "#f8f9fa" }}
              onClick={() => correctFileInputRef.current?.click()}
            >
              <FontAwesomeIcon icon={faUpload} size="lg" style={{ color: "#6c757d", marginBottom: 8 }} />
              <p className="mb-0" style={{ color: "#6c757d" }}>
                {correctImagePreviews.length > 0 ? "Add more images" : "Click to upload solution images"}
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={clearCorrectImages}>Cancel</Button>
            <Button
              variant="primary"
              disabled={correctImageFiles.length === 0 || isTyping}
              onClick={async () => {
                const images = [...correctImageFiles];
                clearCorrectImages();
                await handleApiAction("correct", "AI-Correct", images);
              }}
            >
              <FontAwesomeIcon icon={faWandMagicSparkles} className="me-1" />
              Submit for AI-Correct
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default ChatBotPage;
