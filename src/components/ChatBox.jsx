// src/components/ChatBox.jsx - COMPLETE WITH ENHANCED HALF-BODY MASCOT
import React, { useEffect, useContext, useRef, useState, forwardRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentDots,
  faPaperPlane,
  faTimes,
  faUpload,
  faTrash,
  faLanguage,
  faMicrophone,
  faStop,
  faChartLine,
  faExclamationTriangle,
  faBook,
  faGraduationCap,
  faRobot,
  faLightbulb,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import "katex/dist/katex.min.css";
import axios from "axios";
import MarkdownWithMath from "./MarkdownWithMath";
import "./ChatBox.css";
import { useAlert } from './AlertBox';
import { AuthContext } from './AuthContext';
import axiosInstance from "../api/axiosInstance";
import { useCurrentQuestion } from "../contexts/CurrentQuestionContext";
import { useTutorial } from "../contexts/TutorialContext";
import { getImageSrc } from "../utils/imageUtils";

// ✅ ENHANCED HALF-BODY MASCOT WITH HANDS
import ChatbotMascot, { MascotMessages } from './ChatbotMascot';
import './ChatbotMascot.css';

// ====== API BASE ======
const API_URL = "https://chatbot.smartlearners.ai";

const api = axios.create({
  baseURL: API_URL,
  timeout: 300000,
});

// ====== Helpers for formatting ======
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

// ====== Video List Component ======
const VideoListComponent = ({ videos }) => {
  if (!videos || videos.length === 0) return null;

  const openYouTubeVideo = (url) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="chat-video-list-container">
      {videos.map((videoGroup, groupIndex) => (
        <div key={groupIndex} className="video-group">
          {videoGroup.concept_name && (
            <h6 className="video-concept-title">{videoGroup.concept_name}</h6>
          )}
          {videoGroup.videos && videoGroup.videos.map((video, videoIndex) => (
            <div
              key={`${groupIndex}-${videoIndex}`}
              className="video-card"
              onClick={() => openYouTubeVideo(video.url)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openYouTubeVideo(video.url);
              }}
            >
              <div className="video-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000" width="32" height="32">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <div className="video-info">
                <div className="video-title">{video.title}</div>
                <div className="video-meta">
                  {video.channel && <span className="video-meta-item">📺 {video.channel}</span>}
                  {video.duration && <span className="video-meta-item">⏱️ {video.duration}</span>}
                  {video.views && <span className="video-meta-item">👁️ {video.views}</span>}
                </div>
              </div>
              <div className="video-arrow">
                <FontAwesomeIcon icon={faCheckCircle} style={{ opacity: 0.6 }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// ====== Main Component ======
const ChatBox = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username } = useContext(AuthContext);
  const { showAlert, AlertContainer } = useAlert();
  const className = localStorage.getItem("className");
  const { currentQuestion, questionMetadata } = useCurrentQuestion();
  const { resetTutorial, startTutorialForPage } = useTutorial();

  const includeQuestionContext = (() => {
    const stored = localStorage.getItem("include_question_context");
    return stored === null ? true : stored === "true";
  })();

  const isOnSolveQuestionPage = location.pathname === "/solvequestion";

  const [isOpen, setIsOpen] = useState(false);
  const toggleChat = () => setIsOpen((o) => !o);

  // Session + connection
  const [sessionId, setSessionId] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("checking");

  // Chat
  const [messages, setMessages] = useState([
    {
      id: "hello",
      text: "👋 Hi! I'm your Math Assistant. Ask a doubt or upload a problem image.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState("en");

  // ✅ MASCOT STATE
  const [mascotExpression, setMascotExpression] = useState('neutral');
  const [mascotMessage, setMascotMessage] = useState('');
  const [showMascotMessage, setShowMascotMessage] = useState(false);

  // Files / image
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Audio recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Image action modal
  const [showImageModal, setShowImageModal] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const hasInitialized = useRef(false);
  const mascotTimeoutRef = useRef(null);

  const [inputText, setInputText] = useState("");

  // ✅ MASCOT HELPER - WITH CHAT OPEN CHECK
  const triggerMascotReaction = (expression, message = '', duration = 3000) => {
    if (mascotTimeoutRef.current) {
      clearTimeout(mascotTimeoutRef.current);
    }

    setMascotExpression(expression);
    
    // Only show message if chat is open
    if (message && isOpen) {
      setMascotMessage(message);
      setShowMascotMessage(true);
    }
    
    if (duration > 0) {
      mascotTimeoutRef.current = setTimeout(() => {
        setMascotExpression('neutral');
        setShowMascotMessage(false);
        setMascotMessage('');
      }, duration);
    }
  };

  // ====== Suggestion Questions ======
  const getSuggestionQuestions = () => {
    if (isOnSolveQuestionPage && currentQuestion) {
      return [
        { text: "AI-Solution", icon: faRobot, isTutorial: false, isApiAction: true, apiFlag: "solve" },
        { text: "Concepts-Required and videos", icon: faLightbulb, isTutorial: false, isApiAction: true, apiFlag: "explain" },
        { text: "Start Tutorial Walkthrough", icon: faGraduationCap, isTutorial: true, isApiAction: false },
      ];
    }
    return [
      { text: "What is my progress?", icon: faChartLine, isTutorial: false, isApiAction: false },
      { text: "What are my weaknesses?", icon: faExclamationTriangle, isTutorial: false, isApiAction: false },
      { text: "Give remedial program for 1 week as per my weaknesses", icon: faBook, isTutorial: false, isApiAction: false },
      { text: "Start Tutorial Walkthrough", icon: faGraduationCap, isTutorial: true, isApiAction: false },
    ];
  };

  const suggestionQuestions = getSuggestionQuestions();

  // ====== Effects ======
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (hasInitialized.current) return;
    if (!username) return;
    hasInitialized.current = true;
    fetchStudentDataAndCreateSession();
  }, [username]);

  // ✅ MASCOT REACTS TO TYPING
  useEffect(() => {
    if (isTyping) {
      triggerMascotReaction('thinking', MascotMessages.thinking, 0);
    } else if (mascotExpression === 'thinking') {
      triggerMascotReaction('happy', MascotMessages.success, 2500);
    }
  }, [isTyping]);

  // ✅ MASCOT GREETING WHEN CHAT OPENS
  useEffect(() => {
    if (isOpen && connectionStatus === 'connected') {
      triggerMascotReaction('waving', MascotMessages.greeting, 3000);
    }
    // Hide message when chat closes
    if (!isOpen) {
      setShowMascotMessage(false);
      setMascotMessage('');
    }
  }, [isOpen]);

  // ✅ CONNECTION STATUS REACTIONS
  useEffect(() => {
    if (connectionStatus === 'connected' && isOpen) {
      // Already handled by chat open effect
    } else if (connectionStatus === 'disconnected') {
      triggerMascotReaction('sad', '', 0);
    } else if (connectionStatus === 'checking') {
      triggerMascotReaction('thinking', '', 0);
    }
  }, [connectionStatus]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mascotTimeoutRef.current) clearTimeout(mascotTimeoutRef.current);
    };
  }, []);

  // ====== Session handling ======
  const fetchStudentData = async () => {
    try {
      const response = await axiosInstance.post("dummy/", { homework: "true", agentic_data: "true" });
      if (response.data && response.data[username]) return response.data[username];
      return null;
    } catch (error) {
      return null;
    }
  };

  const fetchExamData = async () => {
    try {
      const response = await axiosInstance.get("questions-evaluated/");
      return response.data || null;
    } catch (error) {
      return null;
    }
  };

  const fetchStudentDataAndCreateSession = async () => {
    setConnectionStatus("checking");
    try {
      const data = await fetchStudentData();
      const examdata = await fetchExamData();
      if (data) setStudentInfo(data);
      await createSessionWithData(data, examdata);
    } catch (err) {
      setConnectionStatus("disconnected");
      triggerMascotReaction('sad', MascotMessages.disconnected, 4000);
      setMessages([{
        id: "conn_fail",
        text: "⚠️ Unable to connect to AI service. Please refresh the page.",
        sender: "ai",
        timestamp: new Date(),
      }]);
    }
  };

  const createSessionWithData = async (studentData, examData) => {
    triggerMascotReaction('thinking', '', 0);
    try {
      const formData = new FormData();
      formData.append("student_name", localStorage.getItem("fullName") || username || "guest_user");
      formData.append("json_data", JSON.stringify({ data: studentData || {} }));
      formData.append("exam_data", JSON.stringify(examData || {}));
      formData.append("class_name", className || "default_class");

      const res = await api.post("/create_session", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data?.session_id) throw new Error("No session_id");
      setSessionId(res.data.session_id);
      setConnectionStatus("connected");
      if (isOpen) triggerMascotReaction('happy', MascotMessages.connected, 3000);
    } catch (e) {
      setConnectionStatus("disconnected");
      triggerMascotReaction('sad', MascotMessages.disconnected, 4000);
      setMessages((prev) => [...prev, {
        id: "conn_fail",
        text: "⚠️ Unable to connect. Please refresh.",
        sender: "ai",
        timestamp: new Date(),
      }]);
    }
  };

  const clearChat = async () => {
    if (!sessionId) return;
    triggerMascotReaction('sad', "Clearing our chat... 🧹", 1500);
    try {
      await api.delete(`/clear-session/${sessionId}`);
    } catch (e) {}
    finally {
      setTimeout(async () => {
        setMessages([{
          id: "cleared",
          text: "🧹 Chat cleared. Ask your next question!",
          sender: "ai",
          timestamp: new Date(),
        }]);
        setSessionId(null);
        setConnectionStatus("checking");
        triggerMascotReaction('waving', MascotMessages.clearChat, 3000);
        await fetchStudentDataAndCreateSession();
      }, 1500);
    }
  };

  // ====== File handlers ======
  const handleFileButtonClick = () => fileInputRef.current?.click();
  const handleFileChange = (e) => handleFile(e.target.files?.[0]);
  const handleText = (e) => setInputText(e.target.value);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.match("image.*")) {
      showAlert("Please upload an image file", "warning");
      triggerMascotReaction('curious', "That's not an image! 🤔", 2500);
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      showAlert("Image must be ≤ 12MB", "warning");
      triggerMascotReaction('sad', "Image too big! 📸", 2500);
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowImageModal(true);
    triggerMascotReaction('curious', MascotMessages.imageUpload, 2500);
  };

  const clearSelectedFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowImageModal(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ====== Audio handlers ======
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
        triggerMascotReaction('thinking', MascotMessages.processingVoice, 0);
        await processAudioBlob(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      triggerMascotReaction('listening', MascotMessages.listening, 0);
    } catch (err) {
      triggerMascotReaction('sad', "Couldn't access mic 🎤", 3000);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    try { mediaRecorderRef.current.stop(); } catch (err) {}
    finally { setIsRecording(false); }
  };

  const toggleRecording = async () => {
    if (isRecording) stopRecording();
    else await startRecording();
  };

  const processAudioBlob = async (audioBlob) => {
    if (!sessionId) return;
    const id = Date.now();
    setIsTyping(true);
    setMessages((prev) => [...prev, { id, text: "🎙️ Processing audio...", sender: "user", timestamp: new Date() }]);

    try {
      const fd = new FormData();
      fd.append("session_id", sessionId);
      fd.append("language", language);
      fd.append("audio", audioBlob, `recording_${id}.webm`);

      const res = await api.post("/process-audio", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const transcription = res?.data?.transcription || "(no transcription)";
      const aiText = res?.data?.response || "";
      const audioBase64 = res?.data?.audio_base64;
      const aiAudioUrl = audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : null;

      setMessages((prev) => {
        const withoutPlaceholder = prev.filter((m) => m.id !== id);
        return [...withoutPlaceholder,
          { id, text: transcription, sender: "user", timestamp: new Date() },
          { id: id + 1, text: aiText, sender: "ai", timestamp: new Date(), audioUrl: aiAudioUrl }
        ];
      });
    } catch (e) {
      triggerMascotReaction('sad', MascotMessages.error, 3000);
      setMessages((prev) => [...prev, { id: id + 1, text: "❌ Sorry, couldn't process audio.", sender: "ai", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  };

  // ====== API Action Handler ======
  const handleApiAction = async (apiFlag, actionName) => {
    if (!currentQuestion || !questionMetadata) {
      showAlert("Missing question data.", "error");
      return;
    }

    const id = Date.now();
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

      const response = await axiosInstance.post("/anssubmit/", formData);
      const apiData = response.data.ai_data || response.data;
      let responseText = "";

      if (apiFlag === "solve") {
        if (apiData.ai_explaination && Array.isArray(apiData.ai_explaination)) {
          const formattedSteps = apiData.ai_explaination.map((step, index) => `**Step ${index + 1}:**\n\n${step}`).join("\n\n---\n\n");
          responseText = `##### AI Solution\n\n${formattedSteps}`;
        } else {
          responseText = apiData.solution || apiData.answer || "Solution generated!";
        }
      } else if (apiFlag === "explain") {
        const conceptsData = apiData.concepts || response.data.concepts;
        const videosData = apiData.videos || response.data.videos;
        if (conceptsData && Array.isArray(conceptsData)) {
          const conceptsFormatted = conceptsData.map((concept, index) => {
            let formatted = `###### ${index + 1}. ${concept.concept}\n\n`;
            if (concept.explanation) formatted += `**Explanation:**\n${concept.explanation}\n\n`;
            if (concept.example) formatted += `**Example:**\n${concept.example}\n\n`;
            if (concept.application) formatted += `**Application:**\n${concept.application}\n\n`;
            return formatted;
          }).join("\n---\n\n");
          responseText = `#### Key Concepts Required\n\n${conceptsFormatted}\n`;
          if (videosData?.length > 0) responseText += `\n\n#### Recommended Videos`;
        } else {
          responseText = "Concepts explained!";
        }
        setMessages((prev) => [...prev, { id: id + 1, text: responseText, sender: "ai", timestamp: new Date(), videos: videosData?.length > 0 ? videosData : null }]);
        return;
      } else if (apiFlag === "correct") {
        responseText = apiData.correction || apiData.feedback || "Correction completed!";
      }

      setMessages((prev) => [...prev, { id: id + 1, text: responseText, sender: "ai", timestamp: new Date() }]);
    } catch (error) {
      triggerMascotReaction('sad', MascotMessages.error, 3000);
      setMessages((prev) => [...prev, { id: id + 1, text: `❌ Sorry, couldn't process ${actionName}.`, sender: "ai", timestamp: new Date() }]);
      showAlert(`Failed: ${actionName}`, "error");
    } finally {
      setIsTyping(false);
    }
  };

  // ====== Message handlers ======
  const handleSuggestionClick = async (suggestion) => {
    if (suggestion.isTutorial) {
      triggerMascotReaction('waving', MascotMessages.suggestionTutorial, 0);
      setMessages((prev) => [...prev, { id: Date.now(), text: "🎓 Tutorial started! Navigating...", sender: "ai", timestamp: new Date() }]);
      setTimeout(() => {
        setIsOpen(false);
        resetTutorial();
        navigate('/student-dash');
        setTimeout(() => startTutorialForPage('studentDash'), 300);
      }, 500);
      return;
    }

    if (suggestion.isApiAction) {
      const apiMessages = { solve: MascotMessages.suggestionSolve, explain: MascotMessages.suggestionExplain };
      triggerMascotReaction('thinking', apiMessages[suggestion.apiFlag] || MascotMessages.thinking, 0);
      await handleApiAction(suggestion.apiFlag, suggestion.text);
      return;
    }

    if (!sessionId || connectionStatus !== "connected" || isTyping) return;
    const suggestionReactions = {
      "What is my progress?": { expression: 'excited', message: MascotMessages.suggestionProgress },
      "What are my weaknesses?": { expression: 'thinking', message: MascotMessages.suggestionWeakness },
      "Give remedial program for 1 week as per my weaknesses": { expression: 'excited', message: MascotMessages.suggestionRemedial },
    };
    const reaction = suggestionReactions[suggestion.text];
    if (reaction) triggerMascotReaction(reaction.expression, reaction.message, 0);
    else triggerMascotReaction('thinking', MascotMessages.thinking, 0);
    await sendMessageBase(suggestion.text, null);
  };

  const sendImageWithCommand = async (command) => {
    setShowImageModal(false);
    if (command.toLowerCase().includes('solve')) triggerMascotReaction('thinking', MascotMessages.imageSolve, 0);
    else if (command.toLowerCase().includes('correct')) triggerMascotReaction('thinking', MascotMessages.imageCorrect, 0);
    else triggerMascotReaction('thinking', MascotMessages.thinking, 0);
    await sendMessageBase(command, selectedFile);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;
    await sendMessageBase(newMessage.trim(), selectedFile);
  };

  const sendMessageBase = async (text, imageFile) => {
    if (!sessionId) {
      setMessages((prev) => [...prev, { id: Date.now(), text: "Connecting… try again.", sender: "ai", timestamp: new Date() }]);
      return;
    }

    const id = Date.now();
    setMessages((prev) => [...prev, { id, text, sender: "user", timestamp: new Date(), image: imageFile ? previewUrl : null }]);
    setNewMessage("");
    setIsTyping(true);

    try {
      let combinedQuery = `${text || ""}`.trim();
      if (includeQuestionContext && currentQuestion && (currentQuestion.question || currentQuestion.image)) {
        const contextParts = [];
        if (currentQuestion.question) contextParts.push(`Question: ${currentQuestion.question}`);
        if (currentQuestion.image) {
          try {
            const imageBase64 = await getImageSrc(currentQuestion.image);
            contextParts.push(`Question Image: ${imageBase64}`);
          } catch (error) {
            contextParts.push(`Question Image: ${currentQuestion.image}`);
          }
        }
        combinedQuery = [combinedQuery, contextParts.join("\n")].filter(Boolean).join("\n\nContext:\n");
      }

      if (imageFile) {
        const fd = new FormData();
        fd.append("session_id", sessionId);
        fd.append("query", combinedQuery || "");
        fd.append("language", language);
        fd.append("image", imageFile, imageFile.name || `image_${Date.now()}.jpg`);
        const res = await api.post("/chat", fd, { headers: { "Content-Type": "multipart/form-data" } });
        const audioBase64 = res?.data?.audio_base64;
        setMessages((prev) => [...prev, { id: id + 1, text: res?.data?.response || "Analyzed!", sender: "ai", timestamp: new Date(), audioUrl: audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : null }]);
      } else {
        const res = await api.post("/chat-simple", { session_id: sessionId, query: combinedQuery || "", language }, { headers: { session_token: sessionId } });
        const audioBase64 = res?.data?.aiAudioUrl;
        setMessages((prev) => [...prev, { id: id + 1, text: res?.data?.response || "Received!", sender: "ai", timestamp: new Date(), audioUrl: audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : null }]);
      }
    } catch (e) {
      triggerMascotReaction('sad', MascotMessages.error, 3000);
      setMessages((prev) => [...prev, { id: id + 1, text: "❌ Sorry, couldn't process that.", sender: "ai", timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
      clearSelectedFile();
    }
  };

  // ✅ LANGUAGE CHANGE WITH MASCOT
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const langMessages = { en: MascotMessages.languageEn, hi: MascotMessages.languageHi, te: MascotMessages.languageTe };
    triggerMascotReaction('excited', langMessages[newLang] || "Language changed! 🌍", 3000);
  };

  // ====== Render ======
  return (
    <>
      <AlertContainer />
      <div className="chat-box-container">
        {/* Floating Toggle */}
        <button
          className={`chat-toggle-btn ${isOpen ? "open" : ""}`}
          onClick={toggleChat}
          title={isOpen ? "Close chat" : "Ask a question"}
        >
          <FontAwesomeIcon icon={isOpen ? faTimes : faCommentDots} />
          {!isOpen && <span className="chat-label">Ask a question</span>}
        </button>

        {/* Chat Window */}
        <div className={`chat-box ${isOpen ? "open" : ""}`}>
          {/* Header */}
          <div className="chat-header">
            {/* ✅ HALF-BODY MASCOT WITH chatOpen PROP AND RIGHT BUBBLE */}
            <div className="chat-header-left">
              <ChatbotMascot 
                expression={mascotExpression}
                size="large"
                animated={true}
                message={mascotMessage}
                showMessage={showMascotMessage}
                chatOpen={isOpen}
                bubblePosition="right"
              />
              <div className="chat-header-info">
                <h5>{`${className} Class`} Math Assistant</h5>
                <span className="chat-header-status">
                  {connectionStatus === 'checking' 
                    ? '🔄 Connecting...' 
                    : connectionStatus === 'connected'
                    ? mascotExpression === 'thinking' 
                      ? '🤔 Thinking...' 
                      : mascotExpression === 'listening'
                      ? '🎧 Listening...'
                      : mascotExpression === 'excited'
                      ? '🎉 Excited!'
                      : '✨ Ready to help!'
                    : '⚠️ Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex-grow" />

            {/* Language Selector */}
            <Form.Select value={language} onChange={handleLanguageChange} size="sm" style={{ width: 140, marginRight: 8 }}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
            </Form.Select>

            {/* Clear chat */}
            <Button
              variant="outline-light"
              size="sm"
              onClick={clearChat}
              disabled={connectionStatus !== "connected" || !sessionId}
              title="Clear chat"
              style={{ marginRight: 8 }}
            >
              <FontAwesomeIcon icon={faTrash} /> Clear
            </Button>

            {/* Connection status */}
            <Button variant="outline-light" size="sm" disabled>
              <FontAwesomeIcon icon={faLanguage} />{" "}
              {connectionStatus === "connected" ? "Connected" : connectionStatus === "checking" ? "Connecting..." : "Disconnected"}
            </Button>

            <button className="close-btn" onClick={toggleChat}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((m, index) => (
              <div key={m.id} className={`message ${m.sender === "user" ? "user-message" : "ai-message"}`}>
                {/* ✅ HALF-BODY MASCOT FOR AI MESSAGES */}
                {m.sender === "ai" && (
                  <div className="message-avatar">
                    <ChatbotMascot 
                      expression={
                        isTyping && index === messages.length - 1 
                          ? 'thinking' 
                          : m.text?.includes('❌') || m.text?.includes('⚠️')
                          ? 'sad'
                          : m.text?.includes('🎓') || m.text?.includes('✨') || m.text?.includes('🎉')
                          ? 'excited'
                          : 'happy'
                      }
                      size="small"
                      animated={true}
                      chatOpen={true}
                    />
                  </div>
                )}
                <div className="message-bubble">
                  {formatMessage(m.text)}
                  {m.videos && m.sender === "ai" && <VideoListComponent videos={m.videos} />}
                  {m.audioUrl && (
                    <div className="message-audio-container" style={{ marginTop: 8 }}>
                      <audio controls src={m.audioUrl} />
                    </div>
                  )}
                  {m.image && (
                    <div className="message-image-container">
                      <img src={m.image} alt="User uploaded" className="message-image" />
                    </div>
                  )}
                </div>
                <div className="message-time" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </div>
              </div>
            ))}

            {/* ✅ TYPING INDICATOR WITH MASCOT */}
            {isTyping && (
              <div className="message ai-message">
                <div className="message-avatar">
                  <ChatbotMascot expression={isRecording ? "listening" : "thinking"} size="small" animated={true} chatOpen={true} />
                </div>
                <div className="message-bubble typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          {!isTyping && (
            <div className="suggestion-container">
              {suggestionQuestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-chip"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={suggestion.isApiAction ? isTyping : !suggestion.isTutorial && (connectionStatus !== "connected" || isTyping)}
                  style={
                    suggestion.isTutorial
                      ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: '600' }
                      : suggestion.isApiAction
                      ? { background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', fontWeight: '600', borderColor: '#3b82f6' }
                      : {}
                  }
                >
                  <FontAwesomeIcon icon={suggestion.icon} className="suggestion-icon" />
                  <span>{suggestion.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <Form onSubmit={sendMessage} className="chat-input">
            <InputGroup>
              <Form.Control
                type="text"
                placeholder={connectionStatus === "connected" ? "Type your question..." : "Connecting..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={connectionStatus !== "connected" || isTyping}
              />
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: "none" }} disabled={connectionStatus !== "connected" || isTyping} />

              {previewUrl ? (
                <div className="input-thumbnail-container">
                  <div className="input-thumbnail">
                    <img src={previewUrl} alt="Thumbnail" className="thumbnail-image" />
                    <button className="remove-thumbnail-btn" onClick={(e) => { e.preventDefault(); clearSelectedFile(); }} type="button">
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
              ) : (
                <Button className="ms-1" type="button" onClick={handleFileButtonClick} disabled={connectionStatus !== "connected" || isTyping}>
                  <FontAwesomeIcon icon={faUpload} />
                </Button>
              )}

              <Button className="ms-1" type="button" onClick={toggleRecording} disabled={connectionStatus !== "connected" || isTyping} variant={isRecording ? "danger" : "primary"}>
                <FontAwesomeIcon icon={isRecording ? faStop : faMicrophone} />
              </Button>

              <Button className="ms-1" type="submit" disabled={connectionStatus !== "connected" || isTyping || (!newMessage.trim() && !selectedFile)}>
                <FontAwesomeIcon icon={faPaperPlane} />
              </Button>
            </InputGroup>
          </Form>
        </div>

        {/* Image Action Modal */}
        <Modal show={showImageModal} onHide={clearSelectedFile} centered>
          <Modal.Header closeButton>
            <Modal.Title>📸 Choose Analysis</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {previewUrl && (
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <img src={previewUrl} alt="preview" style={{ maxWidth: "100%", maxHeight: 240, borderRadius: 8, objectFit: "contain" }} />
              </div>
            )}
            <div className="upload d-grid gap-2">
              <Button variant="primary" onClick={() => sendImageWithCommand("solve it")} disabled={connectionStatus !== "connected"}>🧮 Solve It</Button>
              <Button variant="success" onClick={() => sendImageWithCommand("correct it")} disabled={connectionStatus !== "connected"}>✅ Correct It</Button>
              <div className="input-container">
                <input type="text" className="custom-input" onChange={handleText} placeholder="Type your message..." disabled={connectionStatus !== "connected" || isTyping} />
                <Button className="send-btn" onClick={() => sendImageWithCommand(inputText)} disabled={connectionStatus !== "connected"}>Send Input</Button>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={clearSelectedFile}>Cancel</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
});

ChatBox.displayName = 'ChatBox';

export default ChatBox;