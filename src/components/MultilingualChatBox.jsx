import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCommentDots,
  faPaperPlane,
  faTimes,
  faMicrophone,
  faMicrophoneSlash,
  faVolumeUp,
  faLanguage,
  faImage,
  faSpinner,
  faTrash,
  faStop,
  faExclamationTriangle,
  faUser,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";

/**
 * Multi-Backend ChatBox Component
 * - Uses FastAPI for authentication and chatbot functionality
 * - Session management via localStorage to avoid CORS issues
 */

const MultiBackendChatBox = () => {
  // Basic State
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [studentInfo, setStudentInfo] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);

  // Voice States
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Image States  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // UI States
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // API Configuration
  const FASTAPI_CHATBOT_URL = "https://chatbot.smartlearners.ai";

  // Languages supported
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "te", name: "Telugu", flag: "🇮🇳" }
  ];

  // Since CORS is blocking credentials, we'll use localStorage for session management
  const setSessionStorage = (token) => {
    localStorage.setItem('chatbot_session_token', token);
  };

  const getSessionStorage = () => {
    return localStorage.getItem('chatbot_session_token');
  };

  const clearSessionStorage = () => {
    localStorage.removeItem('chatbot_session_token');
  };

  // Initialize when component mounts
  useEffect(() => {
    checkAuthStatus();
    checkApiHealth();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if user is already authenticated
  const checkAuthStatus = async () => {
    try {
      // Check for existing session token in localStorage
      const existingToken = getSessionStorage();
      
      if (existingToken) {
        setSessionToken(existingToken);
        
        // Verify session with FastAPI backend
        const response = await fetch(`${FASTAPI_CHATBOT_URL}/student-info`, {
          method: 'GET',
          headers: {
            'Cookie': `session_token=${existingToken}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStudentInfo({
            student_name: data.student_name || data.student_id,
            student_class: data.student_class
          });
          setIsAuthenticated(true);
          addWelcomeMessage({
            student_name: data.student_name || data.student_id,
            student_class: data.student_class
          });
        } else {
          // Session expired or invalid
          clearSessionStorage();
          setSessionToken(null);
        }
      }
    } catch (error) {
      console.log("Not authenticated yet");
    }
  };

  // Check API health
  const checkApiHealth = async () => {
    try {
      // Check FastAPI chatbot backend
      const response = await fetch(`${FASTAPI_CHATBOT_URL}/health`);
      
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  // Login function - Uses FastAPI backend
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      setError('Please enter both username and password');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Login with FastAPI backend using URL-encoded form data
      const params = new URLSearchParams();
      params.append('username', loginForm.username);
      params.append('password', loginForm.password);

      const response = await fetch(`${FASTAPI_CHATBOT_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
        // Removed credentials: 'include' due to CORS issues
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store session token in localStorage
        setSessionStorage(data.session_token);
        setSessionToken(data.session_token);
        
        // Get student info
        await getStudentInfo();
        
        setIsAuthenticated(true);
        setLoginForm({ username: "", password: "" });
        setConnectionStatus('connected');
      } else {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map(err => err.msg || err.message).join(', ');
            }
          }
        } catch (e) {
          // If parsing error response fails, use default message
        }
        setError(errorMessage);
      }
    } catch (error) {
      setError('Connection error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get student info
  const getStudentInfo = async () => {
    try {
      const response = await fetch(`${FASTAPI_CHATBOT_URL}/student-info`, {
        method: 'GET',
        headers: {
          'Cookie': `session_token=${sessionToken || getSessionStorage()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const studentData = {
          student_name: data.student_name || data.student_id,
          student_class: data.student_class
        };
        setStudentInfo(studentData);
        addWelcomeMessage(studentData);
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
    }
  };

  // Logout function - Uses FastAPI backend
  const handleLogout = async () => {
    try {
      const token = sessionToken || getSessionStorage();
      await fetch(`${FASTAPI_CHATBOT_URL}/logout`, {
        method: 'POST',
        headers: {
          'Cookie': `session_token=${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      clearSessionStorage();
      
      setIsAuthenticated(false);
      setStudentInfo(null);
      setSessionToken(null);
      setMessages([]);
      setConnectionStatus('checking');
    }
  };

  // Add welcome message
  const addWelcomeMessage = (studentData) => {
    const welcomeMsg = {
      role: "assistant",
      content: `👋 Hello ${studentData?.student_name || 'Student'}! I'm your AI Study Assistant for ${studentData?.student_class || 'your studies'}. I can help you with mathematics, solve problems, explain concepts, and analyze your performance. How can I assist you today?`,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => prev.length === 0 ? [welcomeMsg] : prev);
  };

  // Send message - Uses FastAPI chatbot backend
  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;

    const userMessage = {
      role: "user",
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('query', newMessage);
      formData.append('language', currentLanguage);
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const token = sessionToken || getSessionStorage();

      // Call FastAPI chatbot endpoint
      const response = await fetch(`${FASTAPI_CHATBOT_URL}/chat`, {
        method: 'POST',
        headers: {
          'Cookie': `session_token=${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          role: "assistant",
          content: data.reply,
          audio: data.audio,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else if (response.status === 401) {
        // Session expired
        setError('Session expired. Please login again.');
        handleLogout();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message}. Please try again or contact support.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setNewMessage("");
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  // Voice processing - Uses FastAPI chatbot backend
  const processVoiceInput = async (audioBlob) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', currentLanguage);

      const token = sessionToken || getSessionStorage();

      const response = await fetch(`${FASTAPI_CHATBOT_URL}/process-audio`, {
        method: 'POST',
        headers: {
          'Cookie': `session_token=${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add user message (transcription)
        const userMessage = {
          role: "user",
          content: data.transcription,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMessage]);

        // Add AI response
        const aiMessage = {
          role: "assistant",
          content: data.response,
          audio: data.audio,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else if (response.status === 401) {
        setError('Session expired. Please login again.');
        handleLogout();
      } else {
        throw new Error(`Voice processing failed: ${response.status}`);
      }
    } catch (error) {
      setError(`Voice processing error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      const audioChunks = [];
      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Microphone access denied or not available');
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      clearInterval(recordingIntervalRef.current);
    }
  };

  // Play audio response
  const playAudio = (audioBase64) => {
    if (isPlayingAudio) return;

    try {
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
      const audio = new Audio(audioUrl);
      
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      
      audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlayingAudio(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Format message text
  const formatMessageText = (text) => {
    if (!text) return "";

    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i !== text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Clear chat
  const clearChat = async () => {
    try {
      const token = sessionToken || getSessionStorage();
      await fetch(`${FASTAPI_CHATBOT_URL}/chat-history`, {
        method: 'DELETE',
        headers: {
          'Cookie': `session_token=${token}`
        }
      });
      
      setMessages([]);
      if (studentInfo) {
        addWelcomeMessage(studentInfo);
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
      // Still clear local messages even if API call fails
      setMessages([]);
      if (studentInfo) {
        addWelcomeMessage(studentInfo);
      }
    }
  };

  // Connection status indicator
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'green';
      case 'disconnected': return 'red';
      default: return 'gray';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Connection issues';
      default: return 'Checking connection...';
    }
  };

  // Login Form Component
  if (!isAuthenticated) {
    return (
      <div className="multilingual-chatbox-container">
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            color: "white",
            fontSize: "24px",
            cursor: "pointer",
            zIndex: 1000,
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
          }}
        >
          <FontAwesomeIcon icon={faUser} />
        </button>

        {isOpen && (
          <div style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "350px",
            height: "450px",
            backgroundColor: "white",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Header */}
            <div style={{
              padding: "20px",
              borderBottom: "1px solid #e5e5e5",
              backgroundColor: "#667eea",
              color: "white",
              borderRadius: "15px 15px 0 0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>Student Login</h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  fontSize: "18px",
                  cursor: "pointer"
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Login Form */}
            <div style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              flex: 1
            }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Student ID:
                </label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                  placeholder="Enter your student ID"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Password:
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
              </div>

              {error && (
                <div style={{
                  color: "#dc3545",
                  fontSize: "12px",
                  padding: "8px",
                  backgroundColor: "#f8d7da",
                  borderRadius: "4px"
                }}>
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={isLoading}
                style={{
                  padding: "12px",
                  backgroundColor: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>

              <div style={{ fontSize: "12px", color: "#666", textAlign: "center" }}>
                <div>Status: <span style={{
                  color: getConnectionStatusColor()
                }}>
                  {getConnectionStatusText()}
                </span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="multilingual-chatbox-container">
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: connectionStatus === 'connected' 
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : "linear-gradient(45deg, #f44336, #d32f2f)",
          border: "none",
          color: "white",
          fontSize: "24px",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
        }}
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faCommentDots} />
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: "90px",
          right: "20px",
          width: "400px",
          height: "600px",
          backgroundColor: "white",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          zIndex: 999,
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Header */}
          <div style={{
            padding: "15px 20px",
            borderBottom: "1px solid #e5e5e5",
            backgroundColor: "#667eea",
            color: "white",
            borderRadius: "15px 15px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px" }}>
                AI Study Assistant
              </h3>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>
                {studentInfo?.student_name} - {studentInfo?.student_class}
              </p>
            </div>
            
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {/* Language Selector */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "white",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  <FontAwesomeIcon icon={faLanguage} />{" "}
                  {languages.find(l => l.code === currentLanguage)?.flag}
                </button>

                {showLanguageDropdown && (
                  <div style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    zIndex: 1000,
                    minWidth: "120px"
                  }}>
                    {languages.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLanguage(lang.code);
                          setShowLanguageDropdown(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "none",
                          background: currentLanguage === lang.code ? "#f0f0f0" : "white",
                          color: "#333",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        {lang.flag} {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
                title="Logout"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "15px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%"
                }}
              >
                <div style={{
                  padding: "10px 15px",
                  borderRadius: message.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  backgroundColor: message.role === "user" ? "#667eea" : "#f1f3f5",
                  color: message.role === "user" ? "white" : "#333",
                  fontSize: "14px",
                  lineHeight: "1.4",
                  wordWrap: "break-word"
                }}>
                  {formatMessageText(message.content)}
                  
                  {message.audio && message.role === "assistant" && (
                    <button
                      onClick={() => playAudio(message.audio)}
                      disabled={isPlayingAudio}
                      style={{
                        marginTop: "8px",
                        background: "none",
                        border: "1px solid #ddd",
                        borderRadius: "20px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: "#666"
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={faVolumeUp} 
                        spin={isPlayingAudio}
                      /> Play
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{
                alignSelf: "flex-start",
                padding: "10px 15px",
                backgroundColor: "#f1f3f5",
                borderRadius: "18px 18px 18px 4px",
                color: "#666",
                fontSize: "14px"
              }}>
                <FontAwesomeIcon icon={faSpinner} spin /> Thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div style={{
              padding: "10px 15px",
              borderTop: "1px solid #e5e5e5",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <img 
                src={imagePreview} 
                alt="Selected" 
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "cover",
                  borderRadius: "8px"
                }}
              />
              <span style={{ fontSize: "12px", color: "#666" }}>
                Image selected
              </span>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                }}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  color: "#999",
                  cursor: "pointer"
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div style={{
            padding: "15px",
            borderTop: "1px solid #e5e5e5",
            backgroundColor: "#f8f9fa",
            borderRadius: "0 0 15px 15px"
          }}>
            <div style={{
              display: "flex",
              gap: "8px",
              alignItems: "flex-end"
            }}>
              {/* Voice Recording */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                style={{
                  padding: "10px",
                  backgroundColor: isRecording ? "#dc3545" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "16px",
                  width: "40px",
                  height: "40px"
                }}
              >
                <FontAwesomeIcon 
                  icon={isRecording ? faStop : faMicrophone} 
                />
              </button>

              {/* Image Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                style={{
                  padding: "10px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "16px",
                  width: "40px",
                  height: "40px"
                }}
              >
                <FontAwesomeIcon icon={faImage} />
              </button>

              {/* Text Input */}
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={isRecording ? `Recording... ${recordingTime}s` : "Type your message..."}
                  disabled={isLoading || isRecording}
                  style={{
                    width: "100%",
                    padding: "10px 15px",
                    border: "1px solid #ddd",
                    borderRadius: "20px",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={isLoading || (!newMessage.trim() && !selectedImage)}
                style={{
                  padding: "10px",
                  backgroundColor: "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "16px",
                  width: "40px",
                  height: "40px",
                  opacity: (isLoading || (!newMessage.trim() && !selectedImage)) ? 0.5 : 1
                }}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>

              {/* Clear Chat */}
              <button
                onClick={clearChat}
                style={{
                  padding: "10px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "16px",
                  width: "40px",
                  height: "40px"
                }}
                title="Clear Chat"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              style={{ display: "none" }}
            />

            {/* Error Display */}
            {error && (
              <div style={{
                marginTop: "10px",
                padding: "8px 12px",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: "6px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                {error}
                <button
                  onClick={() => setError(null)}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    color: "#721c24",
                    cursor: "pointer"
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            )}

            {/* Connection Status */}
            <div style={{
              marginTop: "8px",
              fontSize: "11px",
              color: "#666",
              textAlign: "center"
            }}>
              Status: <span style={{ color: getConnectionStatusColor() }}>
                {getConnectionStatusText()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiBackendChatBox;