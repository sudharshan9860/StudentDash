import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuestionCircle,
  faLightbulb,
  faFileAlt,
  faTrophy,
  faTimesCircle,
  faClock,
  faGraduationCap,
  faComment,
  faExclamationCircle,
  faArrowLeft,
  faStar,
  faCompress,
  faChevronDown,
  faChevronUp,
  faRefresh,
  faListAlt
} from '@fortawesome/free-solid-svg-icons';
import MarkdownWithMath from './MarkdownWithMath';
import QuestionListModal from './QuestionListModal';
import axiosInstance from '../api/axiosInstance';
import Avatar3DModel from './Avatar3DModel';
import './ResultPage.css';

// ==================== ANIMATION MAPPING ====================
const ANIMATION_MAP = {
  question: {
    url: '/animations/Thinking (2).fbx',
    name: '🤔 What\'s being asked here?'
  },
  solution: {
    url: '/animations/Talking.fbx',
    name: '💡 Here\'s how to solve it!'
  },
  userSolution: {
    url: '/animations/Looking (1).fbx',
    name: '📝 Let me check your work...'
  },
  scoreHigh: {
    url: '/animations/Golf Putt Victory.fbx',
    name: '🎉 Awesome work!'
  },
  scoreLow: {
    url: '/animations/Defeated.fbx',
    name: '💪 Keep practicing!'
  },
  concepts: {
    url: '/animations/salsa.fbx',
    name: '🎓 Key Concepts'
  },
  gapAnalysis: {
    url: '/animations/Tripping.fbx',
    name: '📊 Gap Analysis'
  },
  errorType: {
    url: '/animations/Defeated.fbx',
    name: '⚠️ Error Detection'
  },
  timeManagement: {
    url: '/animations/Running To Turn.fbx',
    name: '⏱️ Time Analysis'
  },
  feedback: {
    url: '/animations/Talking.fbx',
    name: '💬 AI Feedback'
  }
};

// ==================== UTILITY FUNCTIONS ====================
const getImageSrc = (image) => {
  if (!image) return null;
  if (typeof image === 'string' && image.startsWith('data:')) return image;
  if (image instanceof File) return URL.createObjectURL(image);
  if (typeof image === 'string' && image.match(/^[A-Za-z0-9+/=]+$/)) {
    return `data:image/png;base64,${image}`;
  }
  if (typeof image === 'string' && image.match(/^https?:\/\//)) return image;
  return null;
};

// ==================== RESULT CARD WITH HOVER ====================
const ResultCard = ({ 
  title, 
  icon, 
  color, 
  cardType,
  delay = 0,
  children,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <motion.div
      className="result-card-hoverable"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="card-header-modern" style={{ borderTopColor: color }}>
        <div className="header-left">
          <div className="icon-wrapper-fixed" style={{ backgroundColor: color }}>
            <FontAwesomeIcon icon={icon} />
          </div>
          <h3 className="card-title-modern">{title}</h3>
        </div>
        <div className="hover-indicator">
          <span>Hover to expand</span>
          <FontAwesomeIcon icon={faChevronUp} className="hover-icon" />
        </div>
      </div>
      
      <div className="card-content-modern">
        {children}
      </div>
    </motion.div>
  );
};

// ==================== FULLSCREEN MODAL WITH FIXED 3D MODEL ====================
const FullscreenModal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  color, 
  children,
  cardType
}) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleScroll = (e) => {
    setScrollY(e.target.scrollTop);
  };

  if (!isOpen) return null;

  const animation = ANIMATION_MAP[cardType];

  return (
    <AnimatePresence>
      <motion.div
        className="fullscreen-modal-overlay-new"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="fullscreen-modal-content-new"
          initial={{ scale: 0.8, opacity: 0, rotateX: -15 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotateX: 15 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25 
          }}
        >
          {/* Fixed 3D Model - Small size, stays in place */}
          <div className="fixed-avatar-container">
            <Avatar3DModel
              animationUrl={animation?.url}
              animationName={animation?.name}
              size="medium"
            />
          </div>

          {/* Header */}
          <div className="fullscreen-header-new" style={{ borderBottomColor: color }}>
            <div className="header-left">
              <div className="icon-wrapper-fixed" style={{ backgroundColor: color }}>
                <FontAwesomeIcon icon={icon} />
              </div>
              <h2 className="fullscreen-title-new">{title}</h2>
            </div>
            <button 
              className="close-btn-modern-new" 
              onClick={onClose}
              aria-label="Close fullscreen"
            >
              <FontAwesomeIcon icon={faCompress} />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="fullscreen-body-new" onScroll={handleScroll}>
            <div className="fullscreen-content-wrapper-new">
              {children}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ==================== SCORE RING COMPONENT ====================
const ScoreRing = ({ obtained, total }) => {
  const displayScore = obtained != null ? Math.round(obtained * 10) / 10 : 0;
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
    <div className="score-section-modern">
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
        <div className="score-text-overlay">
          <span className="score-num" style={{ color: getColor() }}>{displayScore}</span>
          <span className="score-divider">/</span>
          <span className="score-total">{total}</span>
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
  
  // Hover states
  const [fullscreenCard, setFullscreenCard] = useState(null);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [showMoreSolution, setShowMoreSolution] = useState(false);

  const contentRef = useRef(null);

  const [darkMode] = useState(() => 
    localStorage.getItem('darkMode') === 'true'
  );

  const { state } = location;
  const {
    ai_data, 
    actionType, 
    questionList, 
    class_id, 
    subject_id, 
    topic_ids,
    subtopic, 
    questionImage, 
    questionNumber, 
    studentImages = [], 
    question_id, 
    context
  } = state || {};

  const {
    question, 
    ai_explaination, 
    student_answer, 
    comment, 
    gap_analysis,
    time_analysis, 
    error_type, 
    concepts_used, 
    solution, 
    score,
    obtained_marks, 
    total_marks, 
    question_marks, 
    question_image_base64
  } = ai_data || {};

  const scoreVal = obtained_marks ?? score ?? autoScore ?? 0;
  const totalVal = total_marks ?? question_marks ?? 5;

  // ==================== HOVER HANDLERS ====================
  const handleMouseEnter = (cardType) => {
    const timer = setTimeout(() => {
      setFullscreenCard(cardType);
    }, 800); // 800ms hover delay
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }
  };

  // ==================== AUTO-SCORE FALLBACK ====================
  useEffect(() => {
    const calculateAutoScore = async () => {
      if (!obtained_marks && !score && student_answer && question) {
        setCalculating(true);
        
        try {
          const response = await axiosInstance.post('/auto-score/', {
            student_answer: student_answer,
            question: question,
            expected_solution: ai_explaination?.join(' ') || solution,
            total_marks: total_marks || question_marks || 5
          });
          
          setAutoScore(response.data.score);
        } catch (error) {
          console.error('Auto-score failed:', error);
          const clientScore = calculateClientSideScore(
            student_answer,
            ai_explaination?.join(' ') || solution,
            total_marks || 5
          );
          setAutoScore(clientScore);
        } finally {
          setCalculating(false);
        }
      }
    };
    
    calculateAutoScore();
  }, [student_answer, question, obtained_marks, score, ai_explaination, solution, total_marks, question_marks]);

  // ==================== HELPER FUNCTIONS ====================
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

  const getScoreCardType = () => {
    const pct = totalVal > 0 ? (scoreVal / totalVal) * 100 : 0;
    return pct >= 60 ? 'scoreHigh' : 'scoreLow';
  };

  const calculateClientSideScore = (studentAns, expectedSol, totalMarks) => {
    if (!studentAns || !expectedSol) return 0;
    
    const keywords = expectedSol.toLowerCase().split(/\s+/)
      .filter(word => word.length > 3);
    const uniqueKeywords = [...new Set(keywords)];
    
    const matchedCount = uniqueKeywords.filter(kw => 
      studentAns.toLowerCase().includes(kw)
    ).length;
    
    const matchPercentage = (matchedCount / uniqueKeywords.length) * 100;
    return Math.round((matchPercentage / 100) * totalMarks * 10) / 10;
  };

  const renderSteps = (steps, isPreview = false) => {
    if (!steps?.length) return <p className="empty-text">No solution available.</p>;
    
    const stepsToShow = isPreview ? steps.slice(0, 3) : steps;
    
    return (
      <div className="solution-steps-modern">
        {stepsToShow.map((s, i) => {
          const m = s.match(/^Step\s+(\d+):\s*(.*)/is);
          return (
            <div key={i} className="step-item-modern">
              <div className="step-badge-modern">{m ? m[1] : i + 1}</div>
              <div className="step-content-modern">
                <MarkdownWithMath content={m ? m[2] : s}/>
              </div>
            </div>
          );
        })}
        {isPreview && steps.length > 3 && (
          <div className="fade-out-overlay">
            <p className="view-full-text">Hover to view complete solution</p>
          </div>
        )}
      </div>
    );
  };

  // ==================== RENDER ====================
  return (
    <div className={`result-page-enhanced ${darkMode ? 'dark' : ''}`} ref={contentRef}>
      {/* Header */}
      <header className="page-header-modern">
        <motion.button 
          className="back-btn-modern" 
          onClick={goBack} 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft}/> <span>Back</span>
        </motion.button>
        <h1 className="page-title-modern">
          <FontAwesomeIcon icon={faStar} className="star-icon"/> Results
        </h1>
        <div className="spacer"/>
      </header>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible className="error-alert-modern">
          {error}
        </Alert>
      )}

      {/* Vertical Cards Layout */}
      <main className="results-vertical-layout">
        {/* Question Card */}
        <ResultCard 
          title="Question" 
          icon={faQuestionCircle} 
          color="#6366f1"
          cardType="question"
          delay={0}
          onMouseEnter={() => handleMouseEnter('question')}
          onMouseLeave={handleMouseLeave}
        >
          <div className="question-content-enhanced">
            <span className="q-number-modern">Q{questionNumber || 1}</span>
            <div className="q-text-container">
              <MarkdownWithMath content={question}/>
            </div>
            {(questionImage || question_image_base64) && (
              <div className="q-image-wrapper">
                <img 
                  src={getImageSrc(questionImage || question_image_base64)} 
                  alt="Question" 
                  className="q-image-modern"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>
        </ResultCard>

        {/* AI Solution Card */}
        {ai_explaination && ai_explaination.length > 0 && (
          <ResultCard 
            title="AI Solution" 
            icon={faLightbulb} 
            color="#10b981"
            cardType="solution"
            delay={0.1}
            onMouseEnter={() => handleMouseEnter('solution')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="ai-solution-preview">
              {renderSteps(ai_explaination, true)}
            </div>
          </ResultCard>
        )}

        {/* Your Solution Card */}
        {student_answer && (
          <ResultCard 
            title="Your Solution" 
            icon={faFileAlt} 
            color="#8b5cf6"
            cardType="userSolution"
            delay={0.2}
            onMouseEnter={() => handleMouseEnter('userSolution')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="user-solution-preview">
              {studentImages && studentImages.length > 0 && (
                <div className="preview-image-wrapper">
                  <img 
                    src={getImageSrc(studentImages[0])} 
                    alt="Answer preview" 
                    className="preview-image"
                  />
                  {studentImages.length > 1 && (
                    <div className="more-images-badge">
                      +{studentImages.length - 1} more
                    </div>
                  )}
                </div>
              )}
              <div className="preview-text">
                <p className="preview-label">ANSWER TEXT (Preview)</p>
                <div className="preview-content">
                  {student_answer.substring(0, 150)}
                  {student_answer.length > 150 && '...'}
                </div>
                <p className="expand-hint">Hover to view full answer</p>
              </div>
            </div>
          </ResultCard>
        )}

        {/* Score Card */}
        <ResultCard 
          title="Score" 
          icon={faTrophy} 
          color="#f59e0b"
          cardType={getScoreCardType()}
          delay={0.3}
          onMouseEnter={() => handleMouseEnter('score')}
          onMouseLeave={handleMouseLeave}
        >
          {calculating ? (
            <div className="calculating-spinner">
              <Spinner animation="border" variant="primary" />
              <p>Calculating score...</p>
            </div>
          ) : (
            <ScoreRing obtained={scoreVal} total={totalVal} />
          )}
        </ResultCard>

        {/* Gap Analysis Card */}
        {gap_analysis && (
          <ResultCard 
            title="Gap Analysis" 
            icon={faExclamationCircle} 
            color="#ec4899"
            cardType="gapAnalysis"
            delay={0.4}
            onMouseEnter={() => handleMouseEnter('gapAnalysis')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="gap-analysis-preview">
              <MarkdownWithMath content={gap_analysis.substring(0, 200) + '...'}/>
              <p className="expand-hint">Hover to view full analysis</p>
            </div>
          </ResultCard>
        )}

        {/* Type of Error Card */}
        {error_type && (
          <ResultCard 
            title="Type of Error" 
            icon={faTimesCircle} 
            color="#ef4444"
            cardType="errorType"
            delay={0.45}
            onMouseEnter={() => handleMouseEnter('errorType')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="error-type-badge">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error_type}</span>
            </div>
            <p className="expand-hint">Hover for more details</p>
          </ResultCard>
        )}

        {/* Time Management Card */}
        {time_analysis && (
          <ResultCard 
            title="Time Management" 
            icon={faClock} 
            color="#06b6d4"
            cardType="timeManagement"
            delay={0.5}
            onMouseEnter={() => handleMouseEnter('timeManagement')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="time-analysis-preview">
              <MarkdownWithMath content={time_analysis.substring(0, 150) + '...'}/>
              <p className="expand-hint">Hover to view analysis</p>
            </div>
          </ResultCard>
        )}  

        {/* Concepts Required Card */}
        {concepts_used && (
          <ResultCard 
            title="Concepts Required" 
            icon={faGraduationCap} 
            color="#8b5cf6"
            cardType="concepts"
            delay={0.55}
            onMouseEnter={() => handleMouseEnter('concepts')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="concepts-tags-container-preview">
              {Array.isArray(concepts_used) ? (
                concepts_used.slice(0, 3).map((concept, idx) => (
                  <div key={idx} className="concept-tag-modern">
                    <FontAwesomeIcon icon={faLightbulb} className="concept-icon"/>
                    {typeof concept === 'object' ? concept.concept : concept}
                  </div>
                ))
              ) : (
                <div className="concept-tag-modern">
                  <FontAwesomeIcon icon={faLightbulb} className="concept-icon"/>
                  {concepts_used}
                </div>
              )}
              {Array.isArray(concepts_used) && concepts_used.length > 3 && (
                <p className="expand-hint">+{concepts_used.length - 3} more concepts</p>
              )}
            </div>
          </ResultCard>
        )}

        {/* AI Feedback Card */}
        {comment && (
          <ResultCard 
            title="AI Feedback" 
            icon={faComment} 
            color="#10b981"
            cardType="feedback"
            delay={0.6}
            onMouseEnter={() => handleMouseEnter('feedback')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="ai-feedback-preview">
              <MarkdownWithMath content={comment.substring(0, 200) + '...'}/>
              <p className="expand-hint">Hover to view full feedback</p>
            </div>
          </ResultCard>
        )}
      </main>

      {/* Bottom Action Buttons - Fixed */}
      <div className="bottom-actions-fixed">
        <button 
          className="action-btn-modern question-list-btn"
          onClick={() => setShowModal(true)}
        >
          <FontAwesomeIcon icon={faListAlt} />
          <span>Question List</span>
        </button>
        <button 
          className="action-btn-modern similar-btn"
          onClick={practiseSimilar}
        >
          <FontAwesomeIcon icon={faRefresh} />
          <span>Similar Questions</span>
        </button>
      </div>

      {/* Question List Modal */}
      {showModal && (
        <QuestionListModal
          show={showModal}
          onHide={() => setShowModal(false)}
          questionList={questionList || []}
          onQuestionClick={selectQuestion}
        />
      )}

      {/* FULLSCREEN MODALS WITH FIXED 3D MODELS */}
      
      {/* Question Fullscreen */}
      <FullscreenModal
        isOpen={fullscreenCard === 'question'}
        onClose={() => setFullscreenCard(null)}
        title="Question"
        icon={faQuestionCircle}
        color="#6366f1"
        cardType="question"
      >
        <div className="fullscreen-question-content">
          <div className="question-header-fullscreen">
            <span className="q-number-fullscreen">Question {questionNumber || 1}</span>
          </div>
          <div className="question-body-fullscreen">
            <MarkdownWithMath content={question}/>
          </div>
          {(questionImage || question_image_base64) && (
            <div className="question-image-fullscreen">
              <img 
                src={getImageSrc(questionImage || question_image_base64)} 
                alt="Question" 
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
        </div>
      </FullscreenModal>

      {/* AI Solution Fullscreen */}
      <FullscreenModal
        isOpen={fullscreenCard === 'solution'}
        onClose={() => setFullscreenCard(null)}
        title="AI Solution"
        icon={faLightbulb}
        color="#10b981"
        cardType="solution"
      >
        <div className="fullscreen-solution-content">
          <div className="solution-header-fullscreen">
            <h3>Step-by-Step Solution</h3>
            {ai_explaination && ai_explaination.length > 6 && (
              <button 
                className="toggle-solution-btn"
                onClick={() => setShowMoreSolution(!showMoreSolution)}
              >
                {showMoreSolution ? (
                  <>
                    <FontAwesomeIcon icon={faChevronUp} /> Show Less
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faChevronDown} /> Show More
                  </>
                )}
              </button>
            )}
          </div>
          <div className="solution-steps-fullscreen">
            {renderSteps(
              showMoreSolution ? ai_explaination : ai_explaination?.slice(0, 6),
              false
            )}
          </div>
        </div>
      </FullscreenModal>

      {/* Your Solution Fullscreen */}
      <FullscreenModal
        isOpen={fullscreenCard === 'userSolution'}
        onClose={() => setFullscreenCard(null)}
        title="Your Solution"
        icon={faFileAlt}
        color="#8b5cf6"
        cardType="userSolution"
      >
        <div className="fullscreen-user-solution">
          {studentImages && studentImages.length > 0 && (
            <div className="uploaded-images-fullscreen">
              <h4>UPLOADED IMAGES</h4>
              <div className="images-grid-fullscreen">
                {studentImages.map((img, idx) => (
                  <div key={idx} className="image-item-fullscreen">
                    <img 
                      src={getImageSrc(img)} 
                      alt={`Answer ${idx + 1}`}
                      onError={(e) => {
                        console.error(`Image ${idx + 1} failed to load`);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="answer-text-fullscreen">
            <h4>EXTRACTED ANSWER TEXT</h4>
            <div className="answer-content-fullscreen">
              <MarkdownWithMath content={student_answer}/>
            </div>
          </div>
        </div>
      </FullscreenModal>

      {/* Score Fullscreen */}
      <FullscreenModal
        isOpen={fullscreenCard === 'score'}
        onClose={() => setFullscreenCard(null)}
        title="Score"
        icon={faTrophy}
        color="#f59e0b"
        cardType={getScoreCardType()}
      >
        <div className="fullscreen-score-content">
          <ScoreRing obtained={scoreVal} total={totalVal} />
          <div className="score-details-fullscreen">
            <div className="score-stat">
              <span className="stat-label">Obtained Marks</span>
              <span className="stat-value">{scoreVal}</span>
            </div>
            <div className="score-stat">
              <span className="stat-label">Total Marks</span>
              <span className="stat-value">{totalVal}</span>
            </div>
            <div className="score-stat">
              <span className="stat-label">Percentage</span>
              <span className="stat-value">
                {totalVal > 0 ? Math.round((scoreVal / totalVal) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </FullscreenModal>

      {/* Gap Analysis Fullscreen */}
      <FullscreenModal
        isOpen={fullscreenCard === 'gapAnalysis'}
        onClose={() => setFullscreenCard(null)}
        title="Gap Analysis"
        icon={faExclamationCircle}
        color="#ec4899"
        cardType="gapAnalysis"
      >
        <div className="fullscreen-gap-analysis">
          <h4>📊 DETAILED GAP ANALYSIS</h4>
          <MarkdownWithMath content={gap_analysis}/>
        </div>
      </FullscreenModal>

      {/* Error Type Fullscreen */}
      <FullscreenModal
        isOpen={fullscreenCard === 'errorType'}
        onClose={() => setFullscreenCard(null)}
        title="Type of Error"
        icon={faTimesCircle}
        color="#ef4444"
        cardType="errorType"
      >
        <div className="fullscreen-error-type">
          <div className="error-type-badge-large">
            <span className="error-icon-large">⚠️</span>
            <span className="error-text-large">{error_type}</span>
          </div>
          <div className="error-explanation">
            <h4>What does this mean?</h4>
            <p>This type of error indicates a specific issue in your understanding or approach to the problem.</p>
          </div>
        </div>
      </FullscreenModal>

      {/* Time Management Fullscreen */}
      <FullscreenModal
        isOpen={fullscreenCard === 'timeManagement'}
        onClose={() => setFullscreenCard(null)}
        title="Time Management"
        icon={faClock}
        color="#06b6d4"
        cardType="timeManagement"
      >
        <div className="fullscreen-time-analysis">
          <h4>⏱️ TIME MANAGEMENT ANALYSIS</h4>
          <MarkdownWithMath content={time_analysis}/>
        </div>
      </FullscreenModal>

      {/* Concepts Fullscreen */}
      <FullscreenModal
        isOpen={fullscreenCard === 'concepts'}
        onClose={() => setFullscreenCard(null)}
        title="Concepts Required"
        icon={faGraduationCap}
        color="#8b5cf6"
        cardType="concepts"
      >
        <div className="fullscreen-concepts">
          <h4>🎓 KEY CONCEPTS</h4>
          <div className="concepts-tags-container-fullscreen">
            {Array.isArray(concepts_used) ? (
              concepts_used.map((concept, idx) => (
                <div key={idx} className="concept-tag-modern-large">
                  <FontAwesomeIcon icon={faLightbulb} className="concept-icon"/>
                  {typeof concept === 'object' ? concept.concept : concept}
                </div>
              ))
            ) : (
              <div className="concept-tag-modern-large">
                <FontAwesomeIcon icon={faLightbulb} className="concept-icon"/>
                {concepts_used}
              </div>
            )}
          </div>
        </div>
      </FullscreenModal>

      {/* Feedback Fullscreen */}
      <FullscreenModal
        isOpen={fullscreenCard === 'feedback'}
        onClose={() => setFullscreenCard(null)}
        title="AI Feedback"
        icon={faComment}
        color="#10b981"
        cardType="feedback"
      >
        <div className="fullscreen-feedback">
          <h4>💬 AI FEEDBACK</h4>
          <MarkdownWithMath content={comment}/>
        </div>
      </FullscreenModal>

    </div>
  );  
};

export default ResultPage;