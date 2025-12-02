// src/components/ResultPage.jsx
// FIXED VERSION - All issues resolved
// Replace your entire ResultPage.jsx with this

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
      {/* CARD IN NORMAL VIEW - Now fully clickable */}
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
        
        {/* Hover overlay effect */}
        <div className={`card-hover-overlay ${isHovered ? 'visible' : ''}`} />
      </motion.div>

      {/* FULLSCREEN MODAL WITH 3D AVATAR */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            className="modal-overlay-fullscreen" 
            onClick={handleClose}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content-fullscreen" 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Close Button - FIXED */}
              <button 
                className="close-modal-btn" 
                onClick={handleClose}
              >
                <FontAwesomeIcon icon={faTimesCircle} />
                <span>Close</span>
              </button>
              
              {/* Modal Header */}
              <div className="modal-header-fullscreen">
                <div className="modal-header-content">
                  <div className="card-icon" style={{ background: color }}>
                    <FontAwesomeIcon icon={icon} />
                  </div>
                  <div className="modal-title-section">
                    <h2>{title}</h2>
                    <p className="modal-subtitle">Interactive 3D View</p>
                  </div>
                </div>
              </div>
              
              {/* Modal Body with Enhanced Grid Layout */}
              <div className="modal-body-grid-enhanced">
                {/* Left: Content Section with Custom Scrollbar */}
                <div className="modal-content-section-enhanced">
                  <div className="content-wrapper">
                    {children}
                  </div>
                </div>
                
                {/* Right: 3D Avatar Section */}
                <div className="fullscreen-avatar-3d-enhanced">
                  {/* Decorative gradient orbs */}
                  <div className="avatar-backdrop">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                  </div>
                  
                  {/* 3D Model Container - FIXED */}
                  <div className="avatar-model-container">
                    <Avatar3DModel 
                      modelUrl="https://models.readyplayer.me/692dee017b7a88e1f657e662.glb"
                      containerType={cardType}
                      size="xlarge"
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

  useEffect(() => {
    const check = () => setDarkMode(localStorage.getItem('darkMode') === 'true');
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  useEffect(() => {
    if ((actionType === 'submit' || actionType === 'correct') &&
      student_answer && obtained_marks === undefined && score === undefined) {
      calcScore();
    }
  }, [ai_data, actionType]);

  const calcScore = async () => {
    if (!student_answer || !question) return;
    setCalculating(true);
    try {
      const res = await axiosInstance.post('/auto-score/', {
        student_answer, 
        question,
        expected_solution: ai_explaination || solution || [],
        total_marks: totalVal
      }).catch(() => null);
      setAutoScore(res?.data?.score ?? 0);
    } catch { 
      setAutoScore(0); 
    } finally { 
      setCalculating(false); 
    }
  };

  const goBack = () => navigate('/solvequestion', {
    state: { 
      question, questionNumber, questionList, class_id, subject_id, 
      topic_ids, subtopic, image: questionImage, 
      index: (questionNumber || 1) - 1, 
      selectedQuestions: questionList, question_id, context 
    }
  });

  const selectQuestion = (q, i, img, qId, ctx) => navigate('/solvequestion', {
    state: { 
      question: q, questionNumber: i + 1, questionList, 
      class_id, subject_id, topic_ids, subtopic,
      image: img, question_id: qId || `q_${i}`, context: ctx 
    }
  });

  const practiseSimilar = () => {
    if (!question) { 
      setError('No question available'); 
      return; 
    }
    navigate('/similar-questions', {
      state: { 
        originalQuestion: question, class_id, subject_id, 
        topic_ids, subtopic, questionImage,
        solution: ai_explaination || solution 
      }
    });
  };

  const getErrorMood = () => {
    if (!error_type) return 'neutral';
    const e = error_type.toLowerCase();
    if (e.includes('conceptual')) return 'thinking';
    if (e.includes('calculation') || e.includes('irrelevant')) return 'confused';
    if (e.includes('unattempted')) return 'worried';
    if (e.includes('no error')) return 'excited';
    return 'sad';
  };

  const getTimeMood = () => {
    if (!time_analysis) return 'neutral';
    return time_analysis.toLowerCase().includes('critical') ? 'worried' : 'happy';
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
        {/* Question */}
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
            {questionImage && (
              <img src={getImageSrc(questionImage)} alt="Question" className="q-image"/>
            )}
          </div>
        </ResultCard>

        {/* AI Solution */}
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
            {question_image_base64 && (
              <img 
                src={getImageSrc(question_image_base64, 'image/jpeg')} 
                alt="Solution" 
                className="sol-image"
              />
            )}
            {renderSteps(ai_explaination)}
          </div>
          {ai_explaination?.length > 3 && (
            <button 
              className="expand-toggle" 
              onClick={e => { 
                e.stopPropagation(); 
                setExpanded(!expanded); 
              }}
            >
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className={expanded ? 'rotated' : ''}
              /> 
              {expanded ? 'Less' : 'More'}
            </button>
          )}
        </ResultCard>

        {/* Your Solution */}
        <ResultCard 
          title="Your Solution" 
          icon={faFileAlt} 
          color="#8b5cf6"
          avatarMood="thinking" 
          avatarMessage="📝 Let me see your work..." 
          cardType="userSolution"
          delay={0.15}
        >
          <div className="user-solution">
            <div className="solution-col">
              <h4>UPLOADED IMAGE</h4>
              {studentImages.length > 0 ? (
                <div className="image-preview">
                  {studentImages.map((img, i) => (
                    <img 
                      key={i} 
                      src={img.startsWith?.('blob:') ? img : getImageSrc(img)} 
                      alt={`Upload ${i + 1}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="placeholder">No image uploaded</div>
              )}
            </div>
            <div className="solution-col">
              <h4>ANSWER TEXT</h4>
              <div className="answer-text">
                {student_answer ? (
                  <MarkdownWithMath content={student_answer}/>
                ) : (
                  <span className="na">No answer provided</span>
                )}
              </div>
            </div>
          </div>
        </ResultCard>

        {/* Score */}
        <ResultCard 
          title="Score" 
          icon={faTrophy} 
          color="#f59e0b"
          avatarMood={scoreVal / totalVal >= 0.6 ? 'excited' : 'encouraging'}
          avatarMessage={scoreVal / totalVal >= 0.6 ? "🏆 Great work!" : "💪 Keep trying!"} 
          cardType="score"
          delay={0.2}
        >
          {calculating ? (
            <div className="loading-state">
              <Spinner animation="border"/>
              <span>Calculating...</span>
            </div>
          ) : (
            <ScoreRing obtained={scoreVal} total={totalVal}/>
          )}
        </ResultCard>

        {/* Gap Analysis */}
        {gap_analysis && (
          <ResultCard 
            title="Gap Analysis" 
            icon={faFire} 
            color="#ec4899"
            avatarMood="suggesting" 
            avatarMessage="🧠 Let's identify the gaps..." 
            cardType="gap"
            delay={0.25}
          >
            <div className="text-content">
              <MarkdownWithMath content={gap_analysis}/>
            </div>
          </ResultCard>
        )}

        {/* Type of Error */}
        {error_type && (
          <ResultCard 
            title="Type of Error" 
            icon={faTimesCircle} 
            color="#ef4444"
            avatarMood={getErrorMood()} 
            avatarMessage="😅 Let's learn from this!" 
            cardType="error"
            delay={0.3}
          >
            <div className="error-display">
              <span className="error-badge">
                <FontAwesomeIcon icon={faTimesCircle}/> {error_type}
              </span>
            </div>
          </ResultCard>
        )}

        {/* Time Management */}
        {time_analysis && (
          <ResultCard 
            title="Time Management" 
            icon={faClock} 
            color="#06b6d4"
            avatarMood={getTimeMood()} 
            avatarMessage={getTimeMood() === 'worried' ? "⏰ Let's speed up!" : "⏱️ Good timing!"} 
            cardType="time"
            delay={0.35}
          >
            <div className="time-display">
              <span className={`time-badge ${time_analysis.toLowerCase().includes('critical') ? 'critical' : ''}`}>
                <FontAwesomeIcon icon={faClock}/> {time_analysis}
              </span>
            </div>
          </ResultCard>
        )}

        {/* Concepts Required */}
        {conceptsFormatted && (
          <ResultCard 
            title="Concepts Required" 
            icon={faGraduationCap} 
            color="#8b5cf6"
            avatarMood="proud" 
            avatarMessage="📘 Master these concepts!" 
            cardType="concepts"
            delay={0.4}
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

        {/* Comments */}
        {comment && (
          <ResultCard 
            title="Comments" 
            icon={faComment} 
            color="#64748b"
            avatarMood="neutral" 
            avatarMessage="💬 Here's some feedback..." 
            cardType="feedback"
            delay={0.45}
          >
            <div className="text-content">
              <MarkdownWithMath content={comment}/>
            </div>
          </ResultCard>
        )}

        {/* Mistakes Made */}
        <ResultCard 
          title="Mistakes Made" 
          icon={faExclamationCircle} 
          color="#f97316"
          avatarMood="thinking" 
          avatarMessage="📝 Learning from mistakes..." 
          cardType="error"
          delay={0.5}
        >
          <div className="mistakes-section">
            <p className="coming-soon">Detailed mistake analysis will appear here...</p>
            <ul className="mistake-list">
              <li>Analysis coming soon</li>
            </ul>
          </div>
        </ResultCard>
      </main>

      {/* FIXED: Bottom Action Buttons */}
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