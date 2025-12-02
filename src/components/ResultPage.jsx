import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import './ResultPage.css';
import QuestionListModal from './QuestionListModal';
import axiosInstance from '../api/axiosInstance';
import MarkdownWithMath from './MarkdownWithMath';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuestionCircle, faLightbulb, faClock, faTimesCircle, faTrophy, 
  faArrowLeft, faList, faRedo, faStar, faFire, faBolt, faGraduationCap, 
  faChevronDown, faComment, faExclamationCircle, faFileAlt, faExpand, 
  faHandPointRight, faHandPointLeft
} from '@fortawesome/free-solid-svg-icons';
import { getImageSrc } from '../utils/imageUtils';

// ==================== HALF-BODY AVATAR (Only for Fullscreen) ====================
const HalfBodyAvatar = ({ mood = 'neutral', size = 'medium', message = '' }) => {
  
  const moodConfig = {
    confused: { eyeType: 'confused', mouthType: 'oh', shirtColor: '#60a5fa' },
    thinking: { eyeType: 'lookUp', mouthType: 'hmm', shirtColor: '#a78bfa' },
    happy: { eyeType: 'happy', mouthType: 'smile', shirtColor: '#4ade80' },
    excited: { eyeType: 'sparkle', mouthType: 'grin', shirtColor: '#fbbf24' },
    sad: { eyeType: 'sad', mouthType: 'frown', shirtColor: '#f87171' },
    worried: { eyeType: 'worried', mouthType: 'nervous', shirtColor: '#fb923c' },
    proud: { eyeType: 'confident', mouthType: 'smirk', shirtColor: '#818cf8' },
    neutral: { eyeType: 'normal', mouthType: 'neutral', shirtColor: '#60a5fa' },
    encouraging: { eyeType: 'kind', mouthType: 'smile', shirtColor: '#10b981' },
    suggesting: { eyeType: 'lookUp', mouthType: 'thinking', shirtColor: '#ec4899' }
  };

  const config = moodConfig[mood] || moodConfig.neutral;
  const skinTone = '#fcd9b6';
  const hairColor = '#5c4033';

  const sizeMap = {
    small: { w: 70, h: 100 },
    medium: { w: 100, h: 140 },
    large: { w: 140, h: 200 },
    xlarge: { w: 200, h: 280 }
  };
  const dim = sizeMap[size] || sizeMap.medium;

  const renderEyes = () => {
    const cx1 = 72, cx2 = 108, cy = 75;
    
    switch (config.eyeType) {
      case 'confused':
        return (
          <>
            <ellipse cx={cx1} cy={cy} rx="10" ry="12" fill="white" stroke="#333" strokeWidth="1"/>
            <circle cx={cx1 + 3} cy={cy + 2} r="5" fill="#333"/>
            <ellipse cx={cx2} cy={cy} rx="10" ry="12" fill="white" stroke="#333" strokeWidth="1"/>
            <circle cx={cx2 - 3} cy={cy + 2} r="5" fill="#333"/>
            <path d={`M${cx1 - 10} 60 L${cx1 + 5} 65`} stroke={hairColor} strokeWidth="3" strokeLinecap="round"/>
            <path d={`M${cx2 - 5} 65 L${cx2 + 10} 60`} stroke={hairColor} strokeWidth="3" strokeLinecap="round"/>
          </>
        );
      case 'happy':
      case 'sparkle':
        return (
          <>
            <path d={`M${cx1 - 8} ${cy} Q${cx1} ${cy - 10} ${cx1 + 8} ${cy}`} fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
            <path d={`M${cx2 - 8} ${cy} Q${cx2} ${cy - 10} ${cx2 + 8} ${cy}`} fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
          </>
        );
      case 'sad':
        return (
          <>
            <ellipse cx={cx1} cy={cy} rx="9" ry="11" fill="white" stroke="#333" strokeWidth="1"/>
            <circle cx={cx1} cy={cy + 3} r="4" fill="#333"/>
            <ellipse cx={cx2} cy={cy} rx="9" ry="11" fill="white" stroke="#333" strokeWidth="1"/>
            <circle cx={cx2} cy={cy + 3} r="4" fill="#333"/>
            <path d={`M${cx1 - 8} 62 L${cx1 + 5} 58`} stroke={hairColor} strokeWidth="3" strokeLinecap="round"/>
            <path d={`M${cx2 - 5} 58 L${cx2 + 8} 62`} stroke={hairColor} strokeWidth="3" strokeLinecap="round"/>
          </>
        );
      case 'worried':
        return (
          <>
            <ellipse cx={cx1} cy={cy} rx="10" ry="13" fill="white" stroke="#333" strokeWidth="1"/>
            <circle cx={cx1} cy={cy} r="5" fill="#333"/>
            <ellipse cx={cx2} cy={cy} rx="10" ry="13" fill="white" stroke="#333" strokeWidth="1"/>
            <circle cx={cx2} cy={cy} r="5" fill="#333"/>
            <path d={`M${cx1 - 10} 58 L${cx1 + 8} 64`} stroke={hairColor} strokeWidth="3" strokeLinecap="round"/>
            <path d={`M${cx2 - 8} 64 L${cx2 + 10} 58`} stroke={hairColor} strokeWidth="3" strokeLinecap="round"/>
            <ellipse cx="130" cy="65" rx="4" ry="6" fill="#60a5fa"/>
          </>
        );
      default:
        return (
          <>
            <ellipse cx={cx1} cy={cy} rx="9" ry="11" fill="white" stroke="#333" strokeWidth="1"/>
            <circle cx={cx1} cy={cy} r="5" fill="#333"/>
            <circle cx={cx1 + 2} cy={cy - 2} r="2" fill="white"/>
            <ellipse cx={cx2} cy={cy} rx="9" ry="11" fill="white" stroke="#333" strokeWidth="1"/>
            <circle cx={cx2} cy={cy} r="5" fill="#333"/>
            <circle cx={cx2 + 2} cy={cy - 2} r="2" fill="white"/>
          </>
        );
    }
  };

  const renderMouth = () => {
    const mx = 90, my = 100;
    switch (config.mouthType) {
      case 'smile':
        return <path d={`M${mx - 15} ${my} Q${mx} ${my + 15} ${mx + 15} ${my}`} fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>;
      case 'grin':
        return <path d={`M${mx - 18} ${my - 3} Q${mx} ${my + 20} ${mx + 18} ${my - 3}`} fill="#333"/>;
      case 'frown':
        return <path d={`M${mx - 12} ${my + 8} Q${mx} ${my - 5} ${mx + 12} ${my + 8}`} fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>;
      case 'oh':
        return <ellipse cx={mx} cy={my + 3} rx="8" ry="10" fill="#333"/>;
      case 'nervous':
        return <path d={`M${mx - 12} ${my + 3} L${mx + 12} ${my + 3}`} stroke="#333" strokeWidth="3" strokeLinecap="round"/>;
      default:
        return <path d={`M${mx - 10} ${my + 2} L${mx + 10} ${my + 2}`} stroke="#333" strokeWidth="3" strokeLinecap="round"/>;
    }
  };

  return (
    <div className="half-body-avatar">
      <motion.svg viewBox="0 0 180 220" width={dim.w} height={dim.h}
        animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
        <defs>
          <linearGradient id={`shirt-${mood}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={config.shirtColor}/>
            <stop offset="100%" stopColor={config.shirtColor} stopOpacity="0.8"/>
          </linearGradient>
        </defs>

        {/* Body */}
        <path d="M50 140 Q40 160 45 220 L135 220 Q140 160 130 140 Q110 130 90 130 Q70 130 50 140" fill={`url(#shirt-${mood})`}/>
        <path d="M75 135 L90 150 L105 135" fill="none" stroke="white" strokeWidth="3"/>

        {/* Arms */}
        <path d="M50 145 Q25 160 20 190" stroke={config.shirtColor} strokeWidth="20" fill="none" strokeLinecap="round"/>
        <circle cx="20" cy="195" r="12" fill={skinTone}/>
        <path d="M130 145 Q155 160 160 190" stroke={config.shirtColor} strokeWidth="20" fill="none" strokeLinecap="round"/>
        <circle cx="160" cy="195" r="12" fill={skinTone}/>

        {/* Neck & Head */}
        <rect x="80" y="120" width="20" height="15" fill={skinTone}/>
        <ellipse cx="90" cy="70" rx="50" ry="55" fill={skinTone}/>

        {/* Hair */}
        <path d="M40 60 Q45 20 90 10 Q135 20 140 60 Q130 35 90 28 Q50 35 40 60" fill={hairColor}/>
        <ellipse cx="45" cy="55" rx="8" ry="18" fill={hairColor}/>
        <ellipse cx="135" cy="55" rx="8" ry="18" fill={hairColor}/>

        {/* Ears */}
        <ellipse cx="40" cy="75" rx="8" ry="12" fill={skinTone}/>
        <ellipse cx="140" cy="75" rx="8" ry="12" fill={skinTone}/>

        {renderEyes()}
        {renderMouth()}

        {['happy', 'excited', 'proud', 'encouraging'].includes(mood) && (
          <>
            <ellipse cx="55" cy="90" rx="10" ry="6" fill="#fca5a5" opacity="0.5"/>
            <ellipse cx="125" cy="90" rx="10" ry="6" fill="#fca5a5" opacity="0.5"/>
          </>
        )}

        {mood === 'confused' && (
          <>
            <text x="25" y="40" fontSize="24" fill="#60a5fa" fontWeight="bold">!</text>
            <text x="140" y="40" fontSize="24" fill="#60a5fa" fontWeight="bold">?</text>
          </>
        )}
      </motion.svg>

      {message && (
        <motion.div className="avatar-bubble"
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <p>{message}</p>
        </motion.div>
      )}
    </div>
  );
};

// ==================== RESULT CARD - NO HOVER MASCOT ====================
const ResultCard = ({ title, icon, color, children, avatarMood, avatarMessage, delay = 0 }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const contentRef = useRef(null);

  // Auto-scroll to content when fullscreen opens
  useEffect(() => {
    if (isFullscreen && contentRef.current) {
      setTimeout(() => {
        contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [isFullscreen]);

  return (
    <>
      {/* Fullscreen Modal - MASCOT ONLY HERE */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div className="fullscreen-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsFullscreen(false)}>
            <motion.div className="fullscreen-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ '--card-accent': color }}>
              
              <div className="fullscreen-header">
                <div className="fullscreen-icon" style={{ backgroundColor: `${color}20`, color }}>
                  <FontAwesomeIcon icon={icon}/>
                </div>
                <h2 style={{ color }}>{title}</h2>
                <button className="close-btn" onClick={() => setIsFullscreen(false)}>×</button>
              </div>
              
              <div className="fullscreen-body">
                <div className="fullscreen-content" ref={contentRef}>
                  {children}
                </div>
                
                {/* MASCOT ONLY IN FULLSCREEN */}
                <div className="fullscreen-avatar">
                  <HalfBodyAvatar mood={avatarMood} size="xlarge" message={avatarMessage}/>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Regular Card - NO MASCOT */}
      <motion.div className="result-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        whileHover={{ scale: 1.02, y: -5 }}
        onClick={() => setIsFullscreen(true)}
        style={{ '--card-color': color }}>
        
        <div className="card-accent" style={{ backgroundColor: color }}/>
        
        <div className="card-header">
          <div className="card-icon" style={{ backgroundColor: `${color}15`, color }}>
            <FontAwesomeIcon icon={icon}/>
          </div>
          <h3 style={{ color }}>{title}</h3>
          <FontAwesomeIcon icon={faExpand} className="expand-icon"/>
        </div>

        <div className="card-body">{children}</div>
        <span className="click-hint">Click to expand</span>
      </motion.div>
    </>
  );
};

// ==================== SCORE RING ====================
const ScoreRing = ({ obtained, total }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const pct = total > 0 ? (obtained / total) * 100 : 0;

  useEffect(() => {
    const duration = 1500;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayScore(Math.round(obtained * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, [obtained]);

  const getColor = () => {
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    if (pct >= 40) return '#f97316';
    return '#ef4444';
  };

  const getMessage = () => {
    if (pct >= 80) return "🎉 Outstanding!";
    if (pct >= 60) return "👍 Good job!";
    if (pct >= 40) return "💪 Keep trying!";
    return "📚 Let's practice!";
  };

  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (circumference * pct / 100);

  return (
    <div className="score-section">
      <div className="score-ring-container">
        <svg viewBox="0 0 120 120" className="score-ring-svg">
          <circle className="ring-bg" cx="60" cy="60" r="50"/>
          <motion.circle className="ring-progress" cx="60" cy="60" r="50"
            style={{ stroke: getColor() }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}/>
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
  const [showBottomButtons, setShowBottomButtons] = useState(false);

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

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

  const conceptsFormatted = Array.isArray(concepts_used) ? concepts_used.join(', ') : concepts_used || '';
  const scoreVal = obtained_marks ?? score ?? autoScore ?? 0;
  const totalVal = total_marks ?? question_marks ?? 5;

  // ========== SCROLL DETECTION - Show buttons only at bottom ==========
  useEffect(() => {
    const handleScroll = () => {
      const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      setShowBottomButtons(scrolledToBottom);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        student_answer, question,
        expected_solution: ai_explaination || solution || [],
        total_marks: totalVal
      }).catch(() => null);
      setAutoScore(res?.data?.score ?? 0);
    } catch { setAutoScore(0); }
    finally { setCalculating(false); }
  };

  const goBack = () => navigate('/solvequestion', {
    state: { question, questionNumber, questionList, class_id, subject_id, topic_ids, subtopic,
      image: questionImage, index: (questionNumber || 1) - 1, selectedQuestions: questionList, question_id, context }
  });

  const selectQuestion = (q, i, img, qId, ctx) => navigate('/solvequestion', {
    state: { question: q, questionNumber: i + 1, questionList, class_id, subject_id, topic_ids, subtopic,
      image: img, question_id: qId || `q_${i}`, context: ctx }
  });

  const practiseSimilar = () => {
    if (!question) { setError('No question available'); return; }
    navigate('/similar-questions', {
      state: { originalQuestion: question, class_id, subject_id, topic_ids, subtopic, questionImage,
        solution: ai_explaination || solution }
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
              <div className="step-content"><MarkdownWithMath content={m ? m[2] : s}/></div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!state) return (
    <div className="result-page-fixed">
      <div className="empty-state">
        <HalfBodyAvatar mood="confused" size="xlarge" message="Oops! No data found."/>
        <button className="primary-btn" onClick={() => navigate('/student-dash')}>Go to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className={`result-page-fixed ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="page-header">
        <motion.button className="back-btn" onClick={goBack} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <FontAwesomeIcon icon={faArrowLeft}/> <span>Back</span>
        </motion.button>
        <h1 className="page-title"><FontAwesomeIcon icon={faStar} className="star-icon"/> Results</h1>
        <div className="spacer"/>
      </header>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {/* Main Grid */}
      <main className="results-grid" id="main-content">
        {/* Question */}
        <ResultCard title="Question" icon={faQuestionCircle} color="#6366f1"
          avatarMood="confused" avatarMessage="🤔 What's being asked here?" delay={0}>
          <div className="question-content">
            <span className="q-number">Q{questionNumber || 1}</span>
            <div className="q-text"><MarkdownWithMath content={question}/></div>
            {questionImage && <img src={getImageSrc(questionImage)} alt="Question" className="q-image"/>}
          </div>
        </ResultCard>

        {/* AI Solution */}
        <ResultCard title="AI Solution" icon={faLightbulb} color="#10b981"
          avatarMood="happy" avatarMessage="💡 Here's how to solve it!" delay={0.1}>
          <div className={`ai-solution ${expanded ? 'expanded' : ''}`}>
            {question_image_base64 && <img src={getImageSrc(question_image_base64, 'image/jpeg')} alt="Solution" className="sol-image"/>}
            {renderSteps(ai_explaination)}
          </div>
          {ai_explaination?.length > 3 && (
            <button className="expand-toggle" onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}>
              <FontAwesomeIcon icon={faChevronDown} className={expanded ? 'rotated' : ''}/> {expanded ? 'Less' : 'More'}
            </button>
          )}
        </ResultCard>

        {/* Your Solution */}
        <ResultCard title="Your Solution" icon={faFileAlt} color="#8b5cf6"
          avatarMood="thinking" avatarMessage="📝 Let me see your work..." delay={0.15}>
          <div className="user-solution">
            <div className="solution-col">
              <h4>UPLOADED IMAGE</h4>
              {studentImages.length > 0 ? (
                <div className="image-preview">
                  {studentImages.map((img, i) => (
                    <img key={i} src={img.startsWith?.('blob:') ? img : getImageSrc(img)} alt={`Upload ${i + 1}`}/>
                  ))}
                </div>
              ) : <div className="placeholder">No image uploaded</div>}
            </div>
            <div className="solution-col">
              <h4>ANSWER TEXT</h4>
              <div className="answer-text">
                {student_answer ? <MarkdownWithMath content={student_answer}/> : <span className="na">No answer provided</span>}
              </div>
            </div>
          </div>
        </ResultCard>

        {/* Score */}
        <ResultCard title="Score" icon={faTrophy} color="#f59e0b"
          avatarMood={scoreVal / totalVal >= 0.6 ? 'excited' : 'encouraging'}
          avatarMessage={scoreVal / totalVal >= 0.6 ? "🏆 Great work!" : "💪 Keep trying!"} delay={0.2}>
          {calculating ? (
            <div className="loading-state"><Spinner animation="border"/><span>Calculating...</span></div>
          ) : (
            <ScoreRing obtained={scoreVal} total={totalVal}/>
          )}
        </ResultCard>

        {/* Gap Analysis */}
        {gap_analysis && (
          <ResultCard title="Gap Analysis" icon={faFire} color="#ec4899"
            avatarMood="suggesting" avatarMessage="🧠 Let's identify the gaps..." delay={0.25}>
            <div className="text-content"><MarkdownWithMath content={gap_analysis}/></div>
          </ResultCard>
        )}

        {/* Type of Error */}
        {error_type && (
          <ResultCard title="Type of Error" icon={faTimesCircle} color="#ef4444"
            avatarMood={getErrorMood()} avatarMessage="😅 Let's learn from this!" delay={0.3}>
            <div className="error-display">
              <span className="error-badge"><FontAwesomeIcon icon={faTimesCircle}/> {error_type}</span>
            </div>
          </ResultCard>
        )}

        {/* Time Management */}
        {time_analysis && (
          <ResultCard title="Time Management" icon={faClock} color="#06b6d4"
            avatarMood={getTimeMood()} avatarMessage={getTimeMood() === 'worried' ? "⏰ Let's speed up!" : "⏱️ Good timing!"} delay={0.35}>
            <div className="time-display">
              <span className={`time-badge ${time_analysis.toLowerCase().includes('critical') ? 'critical' : ''}`}>
                <FontAwesomeIcon icon={faClock}/> {time_analysis}
              </span>
            </div>
          </ResultCard>
        )}

        {/* Concepts Required */}
        {conceptsFormatted && (
          <ResultCard title="Concepts Required" icon={faGraduationCap} color="#8b5cf6"
            avatarMood="proud" avatarMessage="📘 Master these concepts!" delay={0.4}>
            <div className="concepts-grid">
              {conceptsFormatted.split(',').map((c, i) => (
                <span key={i} className="concept-tag"><FontAwesomeIcon icon={faBolt}/> {c.trim()}</span>
              ))}
            </div>
          </ResultCard>
        )}

        {/* Comments */}
        {comment && (
          <ResultCard title="Comments" icon={faComment} color="#64748b"
            avatarMood="neutral" avatarMessage="💬 Here's some feedback..." delay={0.45}>
            <div className="text-content"><MarkdownWithMath content={comment}/></div>
          </ResultCard>
        )}

        {/* Mistakes Made */}
        <ResultCard title="Mistakes Made" icon={faExclamationCircle} color="#f97316"
          avatarMood="thinking" avatarMessage="📝 Learning from mistakes..." delay={0.5}>
          <div className="mistakes-section">
            <p className="coming-soon">Detailed mistake analysis will appear here...</p>
            <ul className="mistake-list"><li>Analysis coming soon</li></ul>
          </div>
        </ResultCard>
      </main>

      {/* ========== FOOTER - Only visible at bottom ========== */}
      <AnimatePresence>
        {showBottomButtons && (
          <motion.footer className="result-footer"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            
            {/* Left Hand Pointer */}
            <motion.div className="hand-pointer left"
              animate={{ x: [0, 8, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <span className="pointer-text">Click here to see question list</span>
              <FontAwesomeIcon icon={faHandPointRight} className="hand-icon"/>
            </motion.div>

            {/* Buttons */}
            <div className="footer-buttons">
              <motion.button className="footer-btn secondary" onClick={() => setShowModal(true)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <FontAwesomeIcon icon={faList}/> Question List
              </motion.button>
              <motion.button className="footer-btn primary" onClick={practiseSimilar}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <FontAwesomeIcon icon={faRedo}/> Similar Questions
              </motion.button>
            </div>

            {/* Right Hand Pointer */}
            <motion.div className="hand-pointer right"
              animate={{ x: [0, -8, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <FontAwesomeIcon icon={faHandPointLeft} className="hand-icon"/>
              <span className="pointer-text">Want to improve? Try similar!</span>
            </motion.div>
          </motion.footer>
        )}
      </AnimatePresence>

      <QuestionListModal show={showModal} onHide={() => setShowModal(false)} questionList={questionList} onQuestionClick={selectQuestion}/>
    </div>
  );
};

export default ResultPage;