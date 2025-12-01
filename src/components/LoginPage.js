import React, { useState, useContext, useMemo, useRef, useEffect } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext";
import axiosInstance from "../api/axiosInstance";
import "./Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { motion, AnimatePresence } from "framer-motion";
import LoginMascot from "./LoginMascot";

import {
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faGraduationCap,
  faBook,
  faUser,
  faHeart,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Refs for accessibility
  const cardRef = useRef(null);
  const headerRef = useRef(null);
  const firstInputRef = useRef(null);

  // Mascot animation states
  const [isTypingUsername, setIsTypingUsername] = useState(false);
  const [isTypingPassword, setIsTypingPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  
  // Refs for typing timeouts
  const usernameTypingTimeout = useRef(null);
  const passwordTypingTimeout = useRef(null);

  // Animated background
  const backgroundCircles = useMemo(() => {
    return [...Array(10)].map((_, i) => ({
      id: i,
      width: Math.random() * 100 + 50,
      height: Math.random() * 100 + 50,
      left: Math.random() * 100,
      top: Math.random() * 150,
      delay: Math.random() * 2,
    }));
  }, []);

  // Handle card expand/collapse
  const toggleCard = () => {
    setIsCardExpanded(!isCardExpanded);
  };

  // Handle keyboard navigation
  const handleHeaderKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCard();
    }
  };

  const handleCardKeyDown = (e) => {
    if (e.key === 'Escape' && isCardExpanded) {
      setIsCardExpanded(false);
      headerRef.current?.focus();
    }
  };

  // Focus first input when card expands
  useEffect(() => {
    if (isCardExpanded && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 300);
    }
  }, [isCardExpanded]);

  // Handle mouse leave
  const handleMouseLeave = () => {
    // Only collapse if not focused inside
    if (!cardRef.current?.contains(document.activeElement)) {
      setIsCardExpanded(false);
    }
  };

  // Handle username input changes
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setIsTypingUsername(true);
    
    if (usernameTypingTimeout.current) {
      clearTimeout(usernameTypingTimeout.current);
    }
    
    usernameTypingTimeout.current = setTimeout(() => {
      setIsTypingUsername(false);
    }, 1000);
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setIsTypingPassword(true);
    
    if (passwordTypingTimeout.current) {
      clearTimeout(passwordTypingTimeout.current);
    }
    
    passwordTypingTimeout.current = setTimeout(() => {
      setIsTypingPassword(false);
    }, 1000);
  };

  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      const response = await axiosInstance.login(username, password);
      const { access, username: user, role, full_name, class_name } = response;

      // Show celebration
      setLoginSuccess(true);
      
      // Wait for celebration animation
      setTimeout(() => {
        login(user, access, role, class_name);
        if (role === "teacher") {
          navigate("/teacher-dash");
        } else {
          navigate("/student-dash");
        }
      }, 1500);

    } catch (err) {
      console.error("Login error:", err);
      setIsLoggingIn(false);
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Invalid username or password."
      );
    }
  };

  // Determine mascot state
  const getMascotState = () => {
    if (loginSuccess) return "celebrating";
    if (showPassword && (password.length > 0 || isPasswordFocused)) return "peeking";
    if (isTypingUsername || isTypingPassword) return "thinking";
    if (password.length > 0 || isPasswordFocused) return "covering";
    return "idle";
  };

  return (
    <div className="login-wrapper">
      {/* Animated Background */}
      <div className="background-container">
        {backgroundCircles.map((circle) => (
          <motion.div
            key={circle.id}
            className="animated-circle"
            style={{
              width: `${circle.width}px`,
              height: `${circle.height}px`,
              left: `${circle.left}%`,
              top: `${circle.top}%`,
            }}
            initial={{ opacity: 0, scale: 0.5, x: -50, y: -50 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.8, 1.2, 0.8],
              x: [-50, Math.random() * 100 - 50],
              y: [-50, Math.random() * 100 - 50],
            }}
            transition={{
              duration: 6 + Math.random() * 5,
              repeat: Infinity,
              repeatType: "mirror",
              delay: circle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Neon Glow Login Card */}
      <div 
        className={`neon-card-wrapper ${isCardExpanded ? 'expanded' : ''}`}
        ref={cardRef}
        onMouseEnter={() => setIsCardExpanded(true)}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleCardKeyDown}
      >
        {/* Rotating Neon Outlines */}
        <div className="neon-outline neon-cyan"></div>
        <div className="neon-outline neon-pink"></div>

        {/* Main Card */}
        <div className="login-card">
          {/* Compact Header (Always Visible) */}
          <div 
            className="login-header"
            ref={headerRef}
            role="button"
            tabIndex={0}
            aria-expanded={isCardExpanded}
            aria-controls="login-form-content"
            onClick={toggleCard}
            onKeyDown={handleHeaderKeyDown}
          >
            <FontAwesomeIcon icon={faRightToBracket} className="header-icon left" />
            <span className="header-text">LOGIN</span>
            <FontAwesomeIcon icon={faHeart} className="header-icon right" />
          </div>

          {/* Expandable Content */}
          <AnimatePresence>
            {isCardExpanded && (
              <motion.div 
                id="login-form-content"
                className="login-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                aria-hidden={!isCardExpanded}
              >
                <div className="content-inner">
                  {/* Logo */}
                  <h3 className="platform-name">SMART LEARNERS</h3>

                  {/* Mascot */}
                  <LoginMascot state={getMascotState()} />

                  {/* Portal Info */}
                  <div className="portal-section">
                    <div className="portal-icons">
                      <FontAwesomeIcon icon={faGraduationCap} size="lg" />
                      <FontAwesomeIcon icon={faBook} size="lg" />
                      <FontAwesomeIcon icon={faUser} size="lg" />
                    </div>
                    <h2 className="portal-title">Student Portal</h2>
                    <p className="portal-description">
                      Access your AI-powered learning experience
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && <div className="error-alert">{error}</div>}

                  {/* Login Form */}
                  <Form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                      <div className="icon-wrapper">
                        <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                      </div>
                      <input
                        ref={firstInputRef}
                        type="text"
                        placeholder="Login Username"
                        value={username}
                        onChange={handleUsernameChange}
                        className="form-input"
                        disabled={isLoggingIn}
                      />
                    </div>

                    <div className="input-group">
                      <div className="icon-wrapper">
                        <FontAwesomeIcon icon={faLock} className="input-icon" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={handlePasswordChange}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        className="form-input"
                        disabled={isLoggingIn}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={handleTogglePassword}
                        disabled={isLoggingIn}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                      </button>
                    </div>

                    <button 
                      type="submit" 
                      className={`start-learning-btn ${isLoggingIn ? 'loading' : ''}`}
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? (
                        loginSuccess ? '🎉 Success!' : 'Logging in...'
                      ) : (
                        'Start Learning'
                      )}
                    </button>

                    <div className="form-footer">
                      <a href="/reset-password" className="reset-link">
                        Reset Password
                      </a>
                      <a href="/support" className="support-link">
                        Support
                      </a>
                    </div>
                  </Form>

                  <div className="copyright">
                    © 2025 AI EDUCATOR. All rights reserved.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;