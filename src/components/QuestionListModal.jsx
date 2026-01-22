// src/components/QuestionListModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./QuestionListModal.css";
import MarkdownWithMath from "./MarkdownWithMath";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboardCheck, faCheckCircle, faBookOpenReader, faQuestionCircle, faChevronLeft, faChevronRight, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useAlert } from './AlertBox';
import Tutorial from './Tutorial';
import { useTutorial } from '../contexts/TutorialContext';

// ✅ ADD THESE 3 FUNCTIONS
// ✅ FIXED VERSION - Replace your existing parseMCQOptions function with this one

const parseMCQOptions = (questionText) => {
  if (!questionText || typeof questionText !== 'string') return [];
  
  const optionsMap = new Map(); // Use Map to automatically deduplicate by key
  
  // Split by \\\n delimiter
  if (questionText.includes('\\\\\\n')) {
    const parts = questionText.split('\\\\\\n');
    
    parts.forEach(part => {
      const trimmed = part.trim();
      const match = /^\(([a-d])\)\s*(.+)$/i.exec(trimmed);
      if (match) {
        const key = match[1].toLowerCase();
        
        // Only add if this key hasn't been seen before
        if (!optionsMap.has(key)) {
          // Clean the option text - remove trailing backslashes
          let optionText = match[2].trim();
          // Remove trailing backslash(es)
          optionText = optionText.replace(/\\+$/, '');
          // Remove any remaining escaped characters
          optionText = optionText.replace(/\\/g, '');
          
          optionsMap.set(key, optionText);
        }
      }
    });
    
    if (optionsMap.size > 0) {
      // Convert Map to array of objects
      return Array.from(optionsMap.entries()).map(([key, text]) => ({
        key,
        text
      }));
    }
  }
  
  // Fallback to regex
  const optionRegex = /\(([a-d])\)\s*([^\(]+?)(?=\([a-d]\)|$)/gi;
  let match;
  while ((match = optionRegex.exec(questionText)) !== null) {
    const key = match[1].toLowerCase();
    
    // Only add if this key hasn't been seen before
    if (!optionsMap.has(key)) {
      let optionText = match[2].replace(/\\\\/g, '').replace(/\s+/g, ' ').trim();
      optionText = optionText.replace(/\\+$/, ''); // Remove trailing backslashes
      optionText = optionText.replace(/\\/g, ''); // Remove all backslashes
      
      optionsMap.set(key, optionText);
    }
  }
  
  // Convert Map to array of objects
  return Array.from(optionsMap.entries()).map(([key, text]) => ({
    key,
    text
  }));
};

// Keep the other two functions the same
const removeOptionsFromQuestion = (questionText) => {
  if (!questionText || typeof questionText !== 'string') return '';
  
  // Split by \\\n and return first part (question)
  if (questionText.includes('\\\\\\n')) {
    const parts = questionText.split('\\\\\\n');
    let cleanQuestion = parts[0].trim();
    // Remove trailing backslashes from question
    cleanQuestion = cleanQuestion.replace(/\\+$/, '');
    return cleanQuestion;
  }
  
  // Fallback: find where (a) starts
  const optionStartIndex = questionText.search(/\(a\)\s*/i);
  if (optionStartIndex > 0) {
    let cleanQuestion = questionText.substring(0, optionStartIndex).trim();
    cleanQuestion = cleanQuestion.replace(/\\+$/, '');
    return cleanQuestion;
  }
  
  return questionText.trim();
};

const hasMCQOptions = (questionText) => {
  if (!questionText) return false;
  
  // Check for \\\n delimiter format
  if (questionText.includes('\\\\\\n(a)') || questionText.includes('\\\\\\n(b)')) {
    return true;
  }
  
  // Check for standard (a) pattern
  return /\(a\)\s*/.test(questionText);
};

const QuestionListModal = ({
  show,
  onHide,
  questionList = [],
  onQuestionClick,
  isMultipleSelect = false,
  onMultipleSelectSubmit,
  worksheetName = "",
  setName = "", // Add this prop
  mode = "", // Add mode prop (homework/classwork)
  // Pagination props
  paginationInfo = null,
  onNextPage = null,
  onPrevPage = null,
}) => {
  const navigate = useNavigate();
  const { showAlert, AlertContainer } = useAlert();
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const questionListRef = useRef(null);

  // Scroll to top when questions change (pagination)
  useEffect(() => {
    if (questionListRef.current && questionList.length > 0) {
      questionListRef.current.scrollTop = 0;
    }
  }, [questionList]);

  // Tutorial context
  const {
    shouldShowTutorialForPage,
    continueTutorialFlow,
    startTutorialFromToggle,
    startTutorialForPage,
    completedPages,
    tutorialFlow,
  } = useTutorial();

  // Tutorial steps for QuestionListModal
  const tutorialSteps = [

    {
      target: '.question-list ',
      content: 'Each question is displayed as a card. You can see the question text, difficulty level, and sometimes an image or reading context.',
      disableBeacon: true,
    },
    {
      target: '.question-level',
      content: 'Click on any question card to start solving it! Try clicking on the first question now to continue the tutorial.',
    },
  ];

  // Handle tutorial completion for QuestionListModal
  const handleTutorialComplete = () => {
    console.log("QuestionListModal tutorial completed");
    // Tutorial will continue when user clicks on a question
  };

  // In QuestionListModal.jsx, update the handleQuestionClick function:

const handleQuestionClick = (questionData, index) => {
  // Check if we're in teacher mode
  const isTeacherMode = window.location.pathname.includes('teacher-dash');

  if (isTeacherMode || isMultipleSelect) {
    // Multiple selection for teachers
    setSelectedQuestions((prev) => {
      const isSelected = prev.includes(index);
      if (isSelected) {
        return prev.filter((i) => i !== index);
      } else {
        if (prev.length < 20) {
          return [...prev, index];
        } else {
          showAlert("You can select up to 20 questions only", "warning");
        }
        return prev;
      }
    });
  } else {
    // Single selection for students
    const selectedQuestion = {
      question: questionData.question,
      image: questionData.question_image
        ? `${questionData.question_image}`
        : null,
      question_id: questionData.question_id || questionData.id || index,
      context: questionData.context || null,
    };

    // Tutorial no longer auto-continues to other pages (manual mode only)

    onQuestionClick(
      selectedQuestion.question,
      index,
      selectedQuestion.image,
      selectedQuestion.question_id,
      selectedQuestion.context
    );
  }
};

  // Update the modal title
  const getModalTitle = () => {
    const countText = paginationInfo?.count > 0 ? ` (${paginationInfo.count} total)` : '';

    if (setName) {
      return `🎯 ${setName} - Select up to 20 Questions${countText}`;
    }
    if (worksheetName) {
      return `📄 ${worksheetName} - Select up to 20 Questions${countText}`;
    }
    if (paginationInfo?.count > 0) {
      return isMultipleSelect
        ? `Select up to 20 Questions${countText}`
        : `Question List${countText}`;
    }
    return isMultipleSelect ? "Select up to 20 Questions" : "Question List";
  };

  // Handle single question submission (for students)
  const handleSingleQuestionSubmit = (questionData, index) => {
    console.log("Single question selected:", questionData);

    let imageUrl = null;
    if (questionData.question_image) {
      if (questionData.question_image.startsWith('data:image')) {
        imageUrl = questionData.question_image;
      } else {
        imageUrl = `${questionData.question_image}`;
      }
    }

    const selectedQuestion = {
      question: typeof questionData.question === 'string'
        ? questionData.question
        : JSON.stringify(questionData.question),
      questionImage: imageUrl,
      questionNumber: index + 1,
      level: questionData.level || '',
      worksheet_name: worksheetName || ''
    };
    if(questionData.context){
      selectedQuestion.context=questionData.context
    }

    console.log("Navigating to solve page with:", selectedQuestion);
    navigate("/solve", { state: selectedQuestion });
    onHide();
  };

  // Handle multiple question submission (for teachers)
  const handleMultipleSubmit = () => {
    if (selectedQuestions.length === 0) {
      showAlert("Please select at least one question", "warning");
      return;
    }

    const selectedQuestionData = selectedQuestions.map(index => {
      const questionData = questionList[index];
      let imageUrl = null;

      if (questionData.question_image) {
        if (questionData.question_image.startsWith('data:image')) {
          imageUrl = questionData.question_image;
        } else {
          imageUrl = `${questionData.question_image}`;
        }
      }

      return {
        ...questionData,
        questionImage: imageUrl,
        questionNumber: index + 1,
        originalIndex: index,
        source: setName || worksheetName || "Selected Questions",
        mode: mode // Pass the mode (homework/classwork)
      };
    });

    console.log("Submitting selected questions:", selectedQuestionData);

    if (onMultipleSelectSubmit) {
      onMultipleSelectSubmit(selectedQuestionData, mode);
    }

    onHide();
  };

  // Handle worksheet solve action (for students)
  const handleSolveWorksheet = () => {
    if (worksheetName && questionList.length > 0) {
      navigate("/solve-worksheet", {
        state: {
          worksheetName,
          questions: questionList,
        },
      });
      onHide();
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setSelectedQuestions([]);
    onHide();
  };

  const renderQuestionContent = (questionData, questionIndex) => {  let questionText = '';
  
  // Add console log to see full data
  console.log('Full question data:', questionData);
  
  if (typeof questionData.question === 'string') {
    questionText = questionData.question;
    console.log('Question text length:', questionText.length);
    console.log('Full question text:', questionText);
  } else if (typeof questionData.question === 'object' && questionData.question.text) {
    questionText = questionData.question.text;
  } else {
    return <span>{JSON.stringify(questionData.question)}</span>;
  }

  const isMCQ = hasMCQOptions(questionText);
  console.log('Is MCQ?', isMCQ);

  if (isMCQ) {
    const options = parseMCQOptions(questionText);
    const cleanQuestionText = removeOptionsFromQuestion(questionText);
    
    console.log('Clean question:', cleanQuestionText);
    console.log('Parsed options:', options);

    return (
      <div className="mcq-preview">
        <div style={{ marginBottom: '10px', fontWeight: '500' }}>
          <MarkdownWithMath content={cleanQuestionText} />
        </div>
        
        {options.length > 0 && (
          <div style={{
            marginTop: '12px',
            paddingLeft: '8px',
            background: 'rgba(0, 193, 212, 0.05)',
            padding: '10px',
            borderRadius: '6px',
            borderLeft: '3px solid rgba(0, 193, 212, 0.3)',
          }}>
            {options.map((option) => (
              <div key={`${questionIndex}-${option.key}`} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                marginBottom: '6px',
                fontSize: '14px',
                lineHeight: '1.5',
              }}>
                <span style={{ 
                  fontWeight: '600',
                  minWidth: '28px',
                  flexShrink: 0,
                  color: '#555',
                }}>
                  ({option.key})
                </span>
                <div style={{ flex: 1 }}>
                  <MarkdownWithMath content={option.text} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <MarkdownWithMath content={questionText} />;
};

  // Determine if we're in teacher mode with worksheet
  const isTeacherMode = window.location.pathname.includes('teacher-dash');
  const isWorksheetMode = !!worksheetName;
  const showSubmitButton = (isTeacherMode && isWorksheetMode) || isMultipleSelect;

  return (
    <>
      <AlertContainer />
      <Modal
        show={show}
        onHide={handleModalClose}
        size="xl"
        className="question-modal"
        backdrop="static"
      >
      <Modal.Header closeButton>
        <Modal.Title>{getModalTitle()}</Modal.Title>
        {/* Tutorial Toggle Button */}
        <button
          className="tutorial-toggle-btn-modal"
          onClick={(e) => {
            e.stopPropagation();
            startTutorialForPage("questionListModal");
          }}
          title="Start Tutorial"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 12px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            marginLeft: '10px',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <FontAwesomeIcon icon={faQuestionCircle} style={{ marginRight: '5px' }} />
          Tutorial
        </button>
      </Modal.Header>
      <Modal.Body>
        <div className="question-list-container" ref={questionListRef} style={{ position: 'relative' }}>
          {/* Loading Overlay */}
          {paginationInfo?.isLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              borderRadius: '8px'
            }}>
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                style={{ fontSize: '48px', color: '#667eea', marginBottom: '16px' }}
              />
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#4a5568' }}>
                Loading questions...
              </span>
            </div>
          )}
          {Array.isArray(questionList) && questionList.length > 0 ? (
            <ul className="question-list">
              {questionList.map((questionData, index) => (
                <li
                  key={index}
                  className={`question-item ${
                    selectedQuestions.includes(index) ? "selected" : ""
                  } ${isWorksheetMode && !isTeacherMode ? "worksheet-question" : ""}`}
                  onClick={() => handleQuestionClick(questionData, index)}
                  style={{ cursor: "pointer" }}
                >
                  {(isMultipleSelect || (isTeacherMode && isWorksheetMode)) && (
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(index)}
                      onChange={() => handleQuestionClick(questionData, index)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <div className="question-number">{index + 1}</div>
                  <div className="question-content">
                    <div className="question-text">
                      {renderQuestionContent(questionData, index)}                    
                    </div>

                    {questionData.context && (
                      <div className="context-indicator">
                      <FontAwesomeIcon icon={faBookOpenReader} />
                        <span className="context-preview"><MarkdownWithMath content={questionData.context} /></span>
                      </div>
                    )}

                    <div
                      className={`question-level ${
                        questionData.level?.toLowerCase() || "medium"
                      }`}
                    >
                      {questionData.level || 'MEDIUM'}
                    </div>

                    {questionData.question_image && (
                      <div className="question-image-preview">
                        <img
                           src={
                            questionData.question_image?.startsWith("http")
                              ? questionData.question_image // direct URL
                              :`data:image/png;base64,${questionData.question_image}` // plain base64 without prefix
                            // fallback if null
                          }
                          alt={`Question ${index + 1}`}
                          className="preview-image"
                        />
                      </div>
                    )}
                  </div>

                </li>
              ))}
            </ul>
          ) : (
            <p>No questions available.</p>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="modal-footer-content" style={{ width: '100%' }}>
          {/* Pagination Controls - Top Row */}
          {paginationInfo && paginationInfo.count > 0 && (
            <div className="pagination-controls" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '12px 0',
              marginBottom: '12px',
              borderBottom: '1px solid #e2e8f0',
              width: '100%'
            }}>
              {/* Previous Button */}
              <button
                onClick={onPrevPage}
                disabled={!paginationInfo.previous || paginationInfo.isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: paginationInfo.previous && !paginationInfo.isLoading
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#e2e8f0',
                  color: paginationInfo.previous && !paginationInfo.isLoading ? 'white' : '#a0aec0',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: paginationInfo.previous && !paginationInfo.isLoading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: paginationInfo.previous && !paginationInfo.isLoading
                    ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  if (paginationInfo.previous && !paginationInfo.isLoading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = paginationInfo.previous && !paginationInfo.isLoading
                    ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                    : 'none';
                }}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
                Previous
              </button>

              {/* Page Info */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                minWidth: '150px'
              }}>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#2d3748',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {paginationInfo.isLoading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      Loading...
                    </>
                  ) : (
                    <>
                      Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
                    </>
                  )}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#718096',
                  fontWeight: '500'
                }}>
                  Total: {paginationInfo.count} questions
                </span>
              </div>

              {/* Next Button */}
              <button
                onClick={onNextPage}
                disabled={!paginationInfo.next || paginationInfo.isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: paginationInfo.next && !paginationInfo.isLoading
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#e2e8f0',
                  color: paginationInfo.next && !paginationInfo.isLoading ? 'white' : '#a0aec0',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: paginationInfo.next && !paginationInfo.isLoading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  boxShadow: paginationInfo.next && !paginationInfo.isLoading
                    ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                    : 'none',
                }}
                onMouseEnter={(e) => {
                  if (paginationInfo.next && !paginationInfo.isLoading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = paginationInfo.next && !paginationInfo.isLoading
                    ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                    : 'none';
                }}
              >
                Next
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}

          {/* Action Buttons - Bottom Row */}
          <div className="d-flex justify-content-between w-100">
            <div>
              {selectedQuestions.length > 0 && (
                <span className="text-muted" style={{ fontSize: '14px', fontWeight: '500' }}>
                  {selectedQuestions.length}/20 questions selected
                </span>
              )}
            </div>
            <div>
              {worksheetName && !isTeacherMode && (
                <Button
                  variant="success"
                  onClick={handleSolveWorksheet}
                  className="me-2"
                >
                  <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
                  Solve Worksheet
                </Button>
              )}
              {showSubmitButton && (
                <Button
                  variant="primary"
                  onClick={handleMultipleSubmit}
                  disabled={selectedQuestions.length === 0}
                  className="me-2"
                >
                  Submit Selected Questions ({selectedQuestions.length}/20)
                </Button>
              )}
              <Button variant="secondary" onClick={handleModalClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal.Footer>
    </Modal>

    {/* Tutorial Component */}
    {shouldShowTutorialForPage("questionListModal") && show && (
      <Tutorial
        steps={tutorialSteps}
        onComplete={handleTutorialComplete}
      />
    )}
    </>
  );
};

export default QuestionListModal;