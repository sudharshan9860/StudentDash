// src/components/ResultPage.jsx
// UPDATED VERSION - With Section-Based Animations

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuestionCircle,
  faLightbulb,
  faFileAlt,
  faTrophy,
  faFire,
  faTimesCircle,
  faClock,
  faGraduationCap,
  faComment,
  faExclamationCircle,
  faBolt,
  faArrowLeft,
  faStar,
  faChevronDown,
  faExpand,
  faRefresh
} from '@fortawesome/free-solid-svg-icons';
import MarkdownWithMath from './MarkdownWithMath';
import QuestionListModal from './QuestionListModal';
import axiosInstance from '../api/axiosInstance';
import Avatar3DModel from './Avatar3DModel';
import './ResultPage.css';
import './ResultPageAnimations.css'; // Add this line



// ==================== ANIMATION MAPPING ====================
const ANIMATION_MAP = {
  question: {
    url: '/animations/Thinking (1).fbx',
    name: '🤔 Confused'
  },
  solution: {
    url: '/animations/Talking.fbx',
    name: '👨‍🏫 Teaching'
  },
   userSolution: {
    url: '/animations/Looking (1).fbx',
    name: '👀 Reviewing Your Work'
  },
   // 4. Score Card - High Score (>60%)
  scoreHigh: {
    url: '/animations/Golf Putt Victory.fbx',
    name: '🎉 Victory! Great Job!'
  },
  
  // 4. Score Card - Low Score (≤60%)
  scoreLow: {
    url: '/animations/Defeated.fbx',
    name: '💪 Keep Practicing!'
  },
  gap: {
    url: '/animations/Focus.fbx',
    name: '🤔 Thinking'
  },
  error: {
    url: '/animations/Tripping.fbx',
    name: '💡 Explaining'
  },
  time: {
    url: '/animations/Running To Turn.fbx',
    name: '🏃 Running'
  },
  concepts: {
    url: '/animations/salsa.fbx',
    name: '📚 Teaching'
  },
  mistakes: {
    url: '/animations/Sad Idle.fbx',
    name: '😔 Reviewing'
  },
  default: {
    url: '/animations/Thinking (1).fbx',
    name: '😊 Idle'
  }
};

// ==================== HELPER FUNCTIONS ====================
const getImageSrc = (img, defaultType = 'image/png') => {
  if (!img) return '';
  if (img.startsWith('data:')) return img;
  if (img.startsWith('http')) return img;
  return `data:${defaultType};base64,${img}`;
};

// ==================== RESULT CARD COMPONENT ====================
const ResultCard = ({ 
  title, 
  icon, 
  color, 
  avatarMood, 
  avatarMessage, 
  children, 
  delay = 0,
  cardType = 'default'
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Get animation for this card type
  const animation = ANIMATION_MAP[cardType] || ANIMATION_MAP.default;
  
  const toggleFullscreen = (e) => {
    // Prevent opening fullscreen if clicking on interactive elements inside
    if (e?.target?.closest('button:not(.result-card)') || 
        e?.target?.closest('a') || 
        e?.target?.closest('input')) {
      return;
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsFullscreen(false);
  };

  return (
    <>
      {/* CARD IN NORMAL VIEW - Clickable */}
      <motion.div 
        className={`result-card ${isHovered ? 'hovered' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        onClick={toggleFullscreen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
      >
        <div className="card-header-row">
          <div className="card-icon" style={{ background: color }}>
            <FontAwesomeIcon icon={icon} />
          </div>
          <h3 className="card-title">{title}</h3>
        </div>
        <div className="card-body">{children}</div>
        
        
      </motion.div>

      {/* FULLSCREEN MODAL WITH 3D AVATAR */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            className="modal-overlay-fullscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div 
              className="modal-content-fullscreen"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="fullscreen-header">
                <div className="fullscreen-icon" style={{ background: color }}>
                  <FontAwesomeIcon icon={icon} />
                </div>
                <h2>{title}</h2>
                <button className="close-modal-btn" onClick={handleClose}>
                  ×
                </button>
              </div>

              {/* Body with Content + 3D Avatar */}
              <div className="fullscreen-body">
                {/* Left: Content */}
                <div className="modal-content-section-enhanced">
                  {children}
                </div>

                {/* Right: 3D Avatar with Animation */}
                <div className="fullscreen-avatar-3d-enhanced">
                  {/* Avatar message badge */}
                  <div className="avatar-message-badge">
                    {avatarMessage}
                  </div>
                  
                  {/* Gradient orbs */}
                  <div className="avatar-backdrop">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                  </div>
                  
                  {/* 3D Model Container with Animation */}
                  <div className="avatar-model-container">
                    <Avatar3DModel 
                      modelUrl="https://models.readyplayer.me/692dee017b7a88e1f657e662.glb"
                      containerType={cardType}
                      size="xlarge"
                      animationUrl={animation.url}
                      animationName={animation.name}
                      key={`${cardType}-${isFullscreen}`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ==================== SCORE RING COMPONENT ====================
const ScoreRing = ({ obtained, total }) => {
  const displayScore = Math.round(obtained);
  const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;

  const getColor = () => {
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getMessage = () => {
    if (pct >= 80) return '🎉 Excellent!';
    if (pct >= 60) return '👍 Good job!';
    if (pct >= 40) return '💪 Keep trying!';
    return '📚 Let\'s practice!';
  };

  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (circumference * pct / 100);

  return (
    <div className="score-section">
      <div className="score-ring-container">
        <svg viewBox="0 0 120 120" className="score-ring-svg">
          <circle className="ring-bg" cx="60" cy="60" r="50"/>
          <motion.circle 
            className="ring-progress" 
            cx="60" 
            cy="60" 
            r="50"
            style={{ stroke: getColor() }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="score-text">
          <span className="score-num" style={{ color: getColor() }}>{displayScore}</span>
          <span className="score-total">/ {total}</span>
        </div>
      </div>
      <div className="score-message">{getMessage()}</div>
    </div>
  );
};

// ==================== MAIN RESULT PAGE ====================
const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [autoScore, setAutoScore] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem('darkMode') === 'true'
  );

  const { state } = location;
  const {
    ai_data, actionType, questionList, class_id, subject_id, topic_ids,
    subtopic, questionImage, questionNumber, studentImages = [], question_id, context
  } = state || {};

  const {
    question, ai_explaination, student_answer, comment, gap_analysis,
    time_analysis, error_type, concepts_used, solution, score,
    obtained_marks, total_marks, question_marks, question_image_base64
  } = ai_data || {};

  const conceptsFormatted = Array.isArray(concepts_used) 
    ? concepts_used.join(', ') 
    : concepts_used || '';
  const scoreVal = obtained_marks ?? score ?? autoScore ?? 0;
  const totalVal = total_marks ?? question_marks ?? 5;

  const goBack = () => navigate(-1);

  const selectQuestion = (q) => {
    setShowModal(false);
    navigate('/solvequestion', {
      state: {
        selectedQuestion: q,
        questionList,
        class_id,
        subject_id,
        topic_ids,
        subtopic,
        context
      }
    });
  };

  const practiseSimilar = () => {
    if (!question) {
      setError('Question not available');
      return;
    }
    navigate('/similar-questions', {
      state: {
        originalQuestion: question,
        class_id,
        subject_id,
        topic_ids,
        subtopic
      }
    });
  };

  const getMoodFromScore = () => {
    const pct = totalVal > 0 ? (scoreVal / totalVal) * 100 : 0;
    if (pct >= 80) return 'happy';
    if (pct >= 40) return 'neutral';
    return 'worried';
  };

  const renderSteps = (steps) => {
    if (!steps?.length) return <p className="empty-text">No solution available.</p>;
    return (
      <div className="solution-steps">
        {steps.map((s, i) => {
          const m = s.match(/^Step\s+(\d+):\s*(.*)/is);
          return (
            <div key={i} className="step-item">
              <span className="step-badge">{m ? m[1] : i + 1}</span>
              <div className="step-content">
                <MarkdownWithMath content={m ? m[2] : s}/>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`result-page-fixed ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="page-header">
        <motion.button 
          className="back-btn" 
          onClick={goBack} 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft}/> <span>Back</span>
        </motion.button>
        <h1 className="page-title">
          <FontAwesomeIcon icon={faStar} className="star-icon"/> Results
        </h1>
        <div className="spacer"/>
      </header>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Main Grid */}
      <main className="results-grid" id="main-content">
        {/* Question Card */}
        <ResultCard 
          title="Question" 
          icon={faQuestionCircle} 
          color="#6366f1"
          avatarMood="confused" 
          avatarMessage="🤔 What's being asked here?" 
          cardType="question"
          delay={0}
        >
          <div className="question-content">
            <span className="q-number">Q{questionNumber || 1}</span>
            <div className="q-text"><MarkdownWithMath content={question}/></div>
            {(questionImage || question_image_base64) && (
              <img 
                src={getImageSrc(questionImage || question_image_base64)} 
                alt="Question" 
                className="q-image"
              />
            )}
          </div>
        </ResultCard>

        {/* AI Solution Card */}
        <ResultCard 
          title="AI Solution" 
          icon={faLightbulb} 
          color="#10b981"
          avatarMood="happy" 
          avatarMessage="💡 Here's how to solve it!" 
          cardType="solution"
          delay={0.1}
        >
          <div className={`ai-solution ${expanded ? 'expanded' : ''}`}>
            {renderSteps(ai_explaination)}
          </div>
        </ResultCard>

        {/* Your Solution Card */}
        {student_answer && (
          <ResultCard 
            title="Your Solution" 
            icon={faFileAlt} 
            color="#8b5cf6"
            avatarMood="neutral" 
            avatarMessage="📝 Let me check your work..." 
            cardType="userSolution"
            delay={0.2}
          >
            <div className="user-solution">
              {studentImages && studentImages.length > 0 && (
                <div className="uploaded-images">
                  <h4>UPLOADED IMAGE</h4>
                  {studentImages.map((img, idx) => (
                    <img key={idx} src={getImageSrc(img)} alt={`Answer ${idx + 1}`} />
                  ))}
                </div>
              )}
              <div className="answer-text-section">
                <h4>ANSWER TEXT</h4>
                <div className="text-content">
                  <MarkdownWithMath content={student_answer}/>
                </div>
              </div>
            </div>
          </ResultCard>
        )}

        {/* Score Card */}
        <ResultCard 
          title="Score" 
          icon={faTrophy} 
          color="#f59e0b"
          avatarMood={getMoodFromScore()} 
          avatarMessage={scoreVal >= 4 ? "🎉 Awesome!" : "💪 Keep practicing!"} 
          cardType="score"
          delay={0.25}
        >
          <ScoreRing obtained={scoreVal} total={totalVal} />
        </ResultCard>

        {/* Gap Analysis Card */}
        {gap_analysis && (
          <ResultCard 
            title="Gap Analysis" 
            icon={faFire} 
            color="#ec4899"
            avatarMood="thinking" 
            avatarMessage="🔍 Areas to focus on..." 
            cardType="gap"
            delay={0.3}
          >
            <div className="text-content">
              <MarkdownWithMath content={gap_analysis}/>
            </div>
          </ResultCard>
        )}

        {/* Type of Error Card */}
        {error_type && (
          <ResultCard 
            title="Type of Error" 
            icon={faTimesCircle} 
            color="#ef4444"
            avatarMood="explaining" 
            avatarMessage="⚠️ Common mistake identified..." 
            cardType="error"
            delay={0.35}
          >
            <div className="error-badge">
              <FontAwesomeIcon icon={faExclamationCircle}/> {error_type}
            </div>
          </ResultCard>
        )}

        {/* Time Management Card */}
        {time_analysis && (
          <ResultCard 
            title="Time Management" 
            icon={faClock} 
            color="#06b6d4"
            avatarMood="neutral" 
            avatarMessage="⏱️ Time analysis..." 
            cardType="time"
            delay={0.4}
          >
            <div className="time-info">
              <span className={`time-badge ${time_analysis.toLowerCase().includes('critical') ? 'critical' : ''}`}>
                <FontAwesomeIcon icon={faClock}/> {time_analysis}
              </span>
            </div>
          </ResultCard>
        )}

        {/* Concepts Required Card */}
        {conceptsFormatted && (
          <ResultCard 
            title="Concepts Required" 
            icon={faGraduationCap} 
            color="#8b5cf6"
            avatarMood="proud" 
            avatarMessage="📘 Master these concepts!" 
            cardType="concepts"
            delay={0.45}
          >
            <div className="concepts-grid">
              {conceptsFormatted.split(',').map((c, i) => (
                <span key={i} className="concept-tag">
                  <FontAwesomeIcon icon={faBolt}/> {c.trim()}
                </span>
              ))}
            </div>
          </ResultCard>
        )}

        {/* Comments Card */}
        {comment && (
          <ResultCard 
            title="Comments" 
            icon={faComment} 
            color="#64748b"
            avatarMood="neutral" 
            avatarMessage="💬 Here's some feedback..." 
            cardType="feedback"
            delay={0.5}
          >
            <div className="text-content">
              <MarkdownWithMath content={comment}/>
            </div>
          </ResultCard>
        )}

        {/* Mistakes Made Card */}
        <ResultCard 
          title="Mistakes Made" 
          icon={faExclamationCircle} 
          color="#f97316"
          avatarMood="thinking" 
          avatarMessage="📝 Learning from mistakes..." 
          cardType="mistakes"
          delay={0.55}
        >
          <div className="mistakes-section">
            <p className="coming-soon">Detailed mistake analysis will appear here...</p>
            <ul className="mistake-list">
              <li>Analysis coming soon</li>
            </ul>
          </div>
        </ResultCard>
      </main>

      {/* Bottom Action Buttons */}
      <footer className="result-actions">
        <motion.button
          className="action-btn secondary"
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faQuestionCircle} />
          <span>Question List</span>
        </motion.button>
        
        <motion.button
          className="action-btn primary"
          onClick={practiseSimilar}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faRefresh} />
          <span>Similar Questions</span>
        </motion.button>
      </footer>

      <QuestionListModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        questionList={questionList} 
        onQuestionClick={selectQuestion}
      />
    </div>
  );
};

export default ResultPage;