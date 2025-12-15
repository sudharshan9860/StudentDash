// src/components/shared/QuestionEvaluationCard.jsx

import React from 'react';
import './QuestionEvaluationCard.css';

const QuestionEvaluationCard = ({ questionNumber, questionData, isTeacherView }) => {
  // Safe property access
  const question = questionData?.question || 'Question not available';
  const errorType = questionData?.error_type || 'unattempted';
  const totalScore = questionData?.total_score || 0;
  const maxMarks = questionData?.max_marks || 0;
  const percentage = questionData?.percentage || 0;
  const mistakesMade = questionData?.mistakes_made || 'N/A';
  const gapAnalysis = questionData?.gap_analysis || 'N/A';
  const mistakeSection = questionData?.mistake_section || 'N/A';
  const hasDiagram = questionData?.has_diagram || 'no';
  const conceptsRequired = questionData?.concepts_required || [];

  // Get status color based on error type
  const getStatusColor = (status) => {
    const colors = {
      'correct': '#10b981',
      'no_error': '#10b981',
      'partially-correct': '#f59e0b',
      'incorrect': '#ef4444',
      'conceptual_error': '#ef4444',
      'numerical_error': '#f59e0b',
      'incomplete': '#f59e0b',
      'unattempted': '#6b7280'
    };
    return colors[status?.toLowerCase()] || '#6b7280';
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      'no_error': 'Correct',
      'correct': 'Correct',
      'partially-correct': 'Partially Correct',
      'incorrect': 'Incorrect',
      'conceptual_error': 'Conceptual Error',
      'numerical_error': 'Numerical Error',
      'incomplete': 'Incomplete',
      'unattempted': 'Unattempted'
    };
    return labels[status?.toLowerCase()] || status;
  };

  const statusColor = getStatusColor(errorType);

  return (
    <div className="question-card">
      {/* Header with gradient background */}
      <div className="question-card-header" style={{ 
        background: `linear-gradient(135deg, ${statusColor}dd 0%, ${statusColor}99 100%)`
      }}>
        <div className="header-left">
          <span className="question-number">{questionNumber}</span>
          <span className="question-marks">
            {Math.round(totalScore)} / {Math.round(maxMarks)}
          </span>
          <span className="question-percentage">({percentage.toFixed(0)}%)</span>
          {hasDiagram === 'yes' && (
            <span className="diagram-indicator" title="Contains diagram">📊</span>
          )}
        </div>
        <div className="header-right">
          <span className="status-label" style={{ 
            background: 'rgba(255, 255, 255, 0.25)',
            color: 'white',
            padding: '0.375rem 0.875rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '600',
            backdropFilter: 'blur(10px)'
          }}>
            {getStatusLabel(errorType)}
          </span>
        </div>
      </div>

      {/* Question Text */}
      <div className="question-body">
        <div className="question-text-section">
          <h5 className="section-label">📝 Question:</h5>
          <p className="question-text">{question}</p>
        </div>

        {/* Mistakes Section */}
        {mistakesMade && mistakesMade !== 'N/A' && mistakesMade !== 'None' && mistakesMade.toLowerCase() !== 'no answer provided' && mistakesMade.toLowerCase() !== 'question was not attempted by the student.' && (
          <div className="info-section mistakes-section">
            <div className="section-header-bar">
              <span className="section-icon">⚠️</span>
              <h5 className="section-heading">Mistakes Made</h5>
            </div>
            <div className="section-content-box">
              <p className="section-text">{mistakesMade}</p>
              {mistakeSection && mistakeSection !== 'N/A' && (
                <div className="mistake-meta">
                  <strong>Section:</strong> {mistakeSection}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gap Analysis Section */}
        {gapAnalysis && gapAnalysis !== 'N/A' && gapAnalysis.toLowerCase() !== 'no gaps identified' && gapAnalysis.toLowerCase() !== 'no gaps identified.' && (
          <div className="info-section gap-section">
            <div className="section-header-bar">
              <span className="section-icon">🎯</span>
              <h5 className="section-heading">Gap Analysis</h5>
            </div>
            <div className="section-content-box">
              <p className="section-text">{gapAnalysis}</p>
            </div>
          </div>
        )}

        {/* Concepts Required Section */}
        {conceptsRequired && conceptsRequired.length > 0 && (
          <div className="info-section concepts-section">
            <div className="section-header-bar">
              <span className="section-icon">📚</span>
              <h5 className="section-heading">Concepts Required</h5>
            </div>
            <div className="section-content-box">
              <div className="concepts-grid">
                {conceptsRequired.map((concept, idx) => (
                  <div key={idx} className="concept-card">
                    <div className="concept-header">
                      <span className="concept-bullet">•</span>
                      <strong className="concept-name">{concept.concept_name}</strong>
                    </div>
                    <p className="concept-desc">{concept.concept_description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Perfect Score Message */}
        {(errorType === 'no_error' || errorType === 'correct') && (
          <div className="success-banner">
            <span className="success-icon">✅</span>
            <span className="success-text">Excellent! No mistakes identified.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionEvaluationCard;