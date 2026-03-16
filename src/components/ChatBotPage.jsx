// src/components/ChatBotPage.jsx
import React, { useEffect, useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Send,
  Upload,
  Mic,
  Square,
  Trash2,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Bot,
  Lightbulb,
  Sparkles,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";
import axios from "axios";
import MarkdownWithMath from "./MarkdownWithMath";
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
      <div className="space-y-2">
        {text.map((p, i) => (
          <p key={i} className="text-sm">
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
    <div className="mt-3 space-y-3">
      {videos.map((videoGroup, gi) => (
        <div key={gi}>
          {videoGroup.concept_name && (
            <h6 className="text-xs font-semibold text-slate-500 mb-2">{videoGroup.concept_name}</h6>
          )}
          {videoGroup.videos &&
            videoGroup.videos.map((video, vi) => (
              <div
                key={`${gi}-${vi}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                onClick={() => window.open(video.url, "_blank", "noopener,noreferrer")}
                role="button"
                tabIndex={0}
              >
                <div className="shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000" width="32" height="32">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{video.title}</div>
                  <div className="flex gap-2 text-xs text-slate-400">
                    {video.channel && <span>{video.channel}</span>}
                    {video.duration && <span>{video.duration}</span>}
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
  const suggestionIconMap = {
    blue: "text-[#00A0E3]",
    amber: "text-amber-500",
    emerald: "text-emerald-500",
    purple: "text-purple-500",
  };

  const SuggestionIcon = ({ type, color }) => {
    const colorClass = suggestionIconMap[color] || "text-slate-500";
    switch (type) {
      case "progress": return <TrendingUp size={20} className={colorClass} />;
      case "weak": return <AlertTriangle size={20} className={colorClass} />;
      case "remedial": return <BookOpen size={20} className={colorClass} />;
      case "exam": return <Lightbulb size={20} className={colorClass} />;
      case "class": return <TrendingUp size={20} className={colorClass} />;
      default: return <Lightbulb size={20} className={colorClass} />;
    }
  };

  const studentSuggestions = [
    { type: "progress", color: "blue", title: "My Progress", desc: "View your learning analytics", message: "What is my progress?" },
    { type: "weak", color: "amber", title: "Weak Areas", desc: "Identify areas for improvement", message: "What are my weaknesses?" },
    { type: "remedial", color: "emerald", title: "Remedial Plan", desc: "Personalized study schedule", isDurationDropdown: true },
    { type: "exam", color: "purple", title: "Exam Analysis", desc: "Question-wise breakdown", isExamDropdown: true },
  ];

  const teacherSuggestions = [
    { type: "class", color: "blue", title: "Class Overview", desc: "Performance across all students", message: "Show class performance overview" },
    { type: "exam", color: "purple", title: "Exam Analysis", desc: "Tabular exam-wise breakdown", message: "Give me exam-wise analysis in tabular format" },
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

  // ====== INPUT BAR COMPONENT ======
  const renderInputBar = () => (
    <div className={`border-t px-4 py-3 ${isDarkMode ? "border-slate-700 bg-[#0B1120]" : "border-slate-200 bg-white"}`}>
      <div className="max-w-3xl mx-auto">
        <form onSubmit={sendMessage}>
          <div className={`flex items-end gap-2 rounded-2xl border-2 px-3 py-2 transition-colors ${
            isDarkMode ? "border-slate-600 bg-slate-800" : "border-slate-200 bg-[#F8FAFC]"
          } focus-within:border-[#00A0E3]`}>
            {previewUrl && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={clearSelectedFile} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                  <X size={12} />
                </button>
              </div>
            )}
            <input
              type="text"
              className={`flex-1 bg-transparent border-none outline-none text-sm py-2 ${isDarkMode ? "text-white placeholder-slate-500" : "text-[#0B1120] placeholder-slate-400"}`}
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
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-200 text-slate-500"}`}
                onClick={() => fileInputRef.current?.click()}
                disabled={connectionStatus !== "connected" || isTyping}
                title="Upload image"
              >
                <Upload size={18} />
              </button>
              <button
                type="button"
                className={`p-2 rounded-lg transition-colors ${isRecording ? "bg-red-500 text-white" : isDarkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-200 text-slate-500"}`}
                onClick={() => (isRecording ? stopRecording() : startRecording())}
                disabled={connectionStatus !== "connected" || isTyping}
                title={isRecording ? "Stop recording" : "Voice input"}
              >
                {isRecording ? <Square size={18} /> : <Mic size={18} />}
              </button>
              <button
                type="submit"
                className="p-2 rounded-lg bg-[#00A0E3] text-white hover:bg-[#0080B8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={connectionStatus !== "connected" || isTyping || (!newMessage.trim() && !selectedFile)}
                title="Send"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </form>
        <p className={`text-center text-xs mt-2 ${isDarkMode ? "text-slate-600" : "text-slate-400"}`}>
          AI can make mistakes. Always verify important information.
        </p>
      </div>
    </div>
  );

  // ====== RENDER ======
  return (
    <>
      <AlertContainer />
      <div className={`flex flex-col h-full ${isDarkMode ? "bg-[#0B1120] text-white" : "bg-white text-[#0B1120]"}`}>
        {/* If no conversation yet, show welcome + cards */}
        {!hasStartedChat && messages.length === 0 ? (
          <>
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                <img src={botAvatar} alt="AI Assistant" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold mb-2 text-center">
                {userRole === "teacher" ? "Class Analytics Assistant" : "How can I help you today?"}
              </h1>
              <p className={`text-sm text-center max-w-lg mb-8 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                {userRole === "teacher"
                  ? "Get instant insights on student performance, exam results, and class analytics."
                  : "Ask doubts, analyze performance, get personalized study plans, or upload questions for instant solutions."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      isDarkMode
                        ? "border-slate-700 hover:border-[#00A0E3] bg-slate-800/50"
                        : "border-slate-200 hover:border-[#00A0E3] bg-[#F8FAFC]"
                    }`}
                    onClick={() => handleSuggestionClick(s)}
                  >
                    <SuggestionIcon type={s.type} color={s.color} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{s.title}</div>
                      <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{s.desc}</div>
                    </div>
                    <ArrowRight size={16} className="text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>

              {/* Exam selector dropdown */}
              {showExamDropdown && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {isLoadingExams ? (
                    <span className="text-xs text-slate-400">Loading exams...</span>
                  ) : examNames.length === 0 ? (
                    <span className="text-xs text-slate-400">No exams found</span>
                  ) : (
                    examNames.map((name, i) => (
                      <button key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isDarkMode ? "border-slate-600 hover:border-[#00A0E3] hover:bg-[#00A0E3]/10" : "border-slate-300 hover:border-[#00A0E3] hover:bg-[#00A0E3]/5"}`} onClick={() => handleExamSelect(name)}>
                        {name}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Duration selector dropdown */}
              {showDurationDropdown && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {durationOptions.map((opt, i) => (
                    <button key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isDarkMode ? "border-slate-600 hover:border-[#00A0E3] hover:bg-[#00A0E3]/10" : "border-slate-300 hover:border-[#00A0E3] hover:bg-[#00A0E3]/5"}`} onClick={() => handleDurationSelect(opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input bar at bottom */}
            {renderInputBar()}
          </>
        ) : (
          /* ====== CONVERSATION VIEW ====== */
          <>
            {/* Top bar */}
            <div className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${isDarkMode ? "border-slate-700 bg-[#0B1120]" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center gap-3">
                <img src={botAvatar} alt="AI" className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-sm">
                    {userRole === "teacher" ? "Analytics Assistant" : "Math Assistant"}
                  </div>
                  <div className={`text-xs ${connectionStatus === "connected" ? "text-green-500" : connectionStatus === "checking" ? "text-amber-500" : "text-red-500"}`}>
                    {connectionStatus === "connected" ? "Online" : connectionStatus === "checking" ? "Connecting..." : "Offline"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`text-xs rounded-lg border px-2 py-1 ${isDarkMode ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-slate-200 text-[#0B1120]"}`}
                >
                  <option value="en">EN</option>
                  <option value="hi">HI</option>
                  <option value="te">TE</option>
                </select>
                <button
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
                  onClick={clearChat}
                  disabled={!sessionId}
                  title="New chat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}>
                  {m.sender === "ai" ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                      <img src={botAvatar} alt="AI" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#00A0E3] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {getUserInitials()}
                    </div>
                  )}
                  <div className={`max-w-[75%] ${m.sender === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block rounded-2xl px-4 py-3 text-sm ${
                      m.sender === "user"
                        ? "bg-[#00A0E3] text-white rounded-br-md"
                        : isDarkMode
                          ? "bg-slate-800 border border-slate-700 rounded-bl-md"
                          : "bg-[#F8FAFC] border border-slate-200 rounded-bl-md"
                    }`}>
                      <div><MarkdownWithMath content={m.text} /></div>
                      {m.videos && <VideoListComponent videos={m.videos} />}
                      {m.audioUrl && (
                        <div className="mt-2">
                          <audio controls src={m.audioUrl} className="max-w-full" />
                        </div>
                      )}
                      {m.image && (
                        <div className="mt-2">
                          <img src={m.image} alt="Uploaded" className="max-w-full max-h-48 rounded-lg" />
                        </div>
                      )}
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                      {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <img src={botAvatar} alt="AI" className="w-full h-full object-cover" />
                  </div>
                  <div className={`inline-flex gap-1 items-center px-4 py-3 rounded-2xl rounded-bl-md ${isDarkMode ? "bg-slate-800" : "bg-[#F8FAFC]"}`}>
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions + input bar */}
            <div>
              {!isTyping && (
                <div className={`flex flex-wrap gap-2 px-4 py-2 ${isDarkMode ? "border-t border-slate-700" : "border-t border-slate-100"}`}>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        isDarkMode ? "border-slate-600 hover:border-[#00A0E3] hover:bg-[#00A0E3]/10" : "border-slate-200 hover:border-[#00A0E3] hover:bg-[#00A0E3]/5"
                      }`}
                      onClick={() => handleSuggestionClick(s)}
                    >
                      <SuggestionIcon type={s.type} color={s.color} />
                      {s.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Exam/Duration dropdowns */}
              {showExamDropdown && (
                <div className={`flex flex-wrap gap-2 px-4 py-2 ${isDarkMode ? "border-t border-slate-700" : "border-t border-slate-100"}`}>
                  {isLoadingExams ? (
                    <span className="text-xs text-slate-400">Loading...</span>
                  ) : examNames.length === 0 ? (
                    <span className="text-xs text-slate-400">No exams</span>
                  ) : (
                    examNames.map((name, i) => (
                      <button key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isDarkMode ? "border-slate-600 hover:border-[#00A0E3]" : "border-slate-200 hover:border-[#00A0E3]"}`} onClick={() => handleExamSelect(name)}>
                        {name}
                      </button>
                    ))
                  )}
                </div>
              )}
              {showDurationDropdown && (
                <div className={`flex flex-wrap gap-2 px-4 py-2 ${isDarkMode ? "border-t border-slate-700" : "border-t border-slate-100"}`}>
                  {durationOptions.map((opt, i) => (
                    <button key={i} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isDarkMode ? "border-slate-600 hover:border-[#00A0E3]" : "border-slate-200 hover:border-[#00A0E3]"}`} onClick={() => handleDurationSelect(opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {renderInputBar()}
            </div>
          </>
        )}

        {/* Image Action Modal */}
        {showImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={clearSelectedFile} />
            <div className={`relative rounded-2xl shadow-2xl w-full max-w-md mx-4 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
              <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                <h3 className="font-bold">Choose Analysis</h3>
                <button onClick={clearSelectedFile} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><X size={18} /></button>
              </div>
              <div className="p-5">
                {previewUrl && (
                  <div className="text-center mb-4">
                    <img src={previewUrl} alt="preview" className="max-w-full max-h-60 rounded-lg object-contain mx-auto" />
                  </div>
                )}
                <div className="space-y-2">
                  <button className="w-full py-2.5 rounded-lg font-medium text-white bg-[#00A0E3] hover:bg-[#0080B8] transition-colors disabled:opacity-50" onClick={() => sendImageWithCommand("solve it")} disabled={connectionStatus !== "connected"}>
                    Solve It
                  </button>
                  <button className="w-full py-2.5 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50" onClick={() => sendImageWithCommand("correct it")} disabled={connectionStatus !== "connected"}>
                    Correct It
                  </button>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm ${isDarkMode ? "bg-slate-700 border-slate-600 text-white" : "bg-white border-slate-200"}`}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Custom instruction..."
                    />
                    <button className="px-4 py-2 rounded-lg font-medium text-white bg-[#00A0E3] hover:bg-[#0080B8] transition-colors disabled:opacity-50" onClick={() => sendImageWithCommand(inputText)} disabled={connectionStatus !== "connected"}>
                      Send
                    </button>
                  </div>
                </div>
              </div>
              <div className={`flex justify-end px-5 py-3 border-t ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`} onClick={clearSelectedFile}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* AI-Correct Multi-Image Modal */}
        {showCorrectImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={clearCorrectImages} />
            <div className={`relative rounded-2xl shadow-2xl w-full max-w-lg mx-4 ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
              <div className={`flex items-center justify-between px-5 py-4 border-b ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                <h3 className="font-bold">Upload Your Solution for AI-Correct</h3>
                <button onClick={clearCorrectImages} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><X size={18} /></button>
              </div>
              <div className="p-5">
                <p className={`text-sm mb-3 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Upload images of your handwritten solution.</p>
                <input type="file" ref={correctFileInputRef} onChange={handleCorrectFileChange} accept="image/*" multiple style={{ display: "none" }} />
                {correctImagePreviews.length > 0 && (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 mb-4">
                    {correctImagePreviews.map((p, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                        <img src={p} alt={`${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setCorrectImagePreviews((prev) => { if (prev[i]) URL.revokeObjectURL(prev[i]); return prev.filter((_, j) => j !== i); });
                            setCorrectImageFiles((prev) => prev.filter((_, j) => j !== i));
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/90 text-white flex items-center justify-center text-xs"
                        >x</button>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDarkMode ? "border-slate-600 hover:border-slate-500 bg-slate-700/50" : "border-slate-300 hover:border-slate-400 bg-[#F8FAFC]"}`}
                  onClick={() => correctFileInputRef.current?.click()}
                >
                  <Upload size={24} className={`mx-auto mb-2 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                  <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {correctImagePreviews.length > 0 ? "Add more images" : "Click to upload solution images"}
                  </p>
                </div>
              </div>
              <div className={`flex justify-end gap-2 px-5 py-3 border-t ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`} onClick={clearCorrectImages}>Cancel</button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#00A0E3] hover:bg-[#0080B8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={correctImageFiles.length === 0 || isTyping}
                  onClick={async () => {
                    const images = [...correctImageFiles];
                    clearCorrectImages();
                    await handleApiAction("correct", "AI-Correct", images);
                  }}
                >
                  <Sparkles size={16} />
                  Submit for AI-Correct
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatBotPage;
