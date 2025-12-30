import React from 'react';
import MarkdownWithMath from '../MarkdownWithMath';
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
    <span className="question-number1">{questionNumber}</span>
   <span className="question-marks1">
    {totalScore} / {maxMarks}
  </span>
  <span className="question-percentage">
    {percentage}%
  </span>
    {hasDiagram === 'yes' && (
      <span className="diagram-indicator" title="Has diagram">📊</span>
    )}
  </div>
  <div className="header-right">
    <span className="status-label">{getStatusLabel(errorType)}</span>
  </div>
</div>

      {/* Body */}
      <div className="question-body">
        {/* Question Text Section - UPDATED: Using MarkdownWithMath */}
        <div className="question-text-section">
          <h6 className="section-label">📝 Question</h6>
          <div className="question-text">
            <MarkdownWithMath content={question} />
          </div>
        </div>

        {/* Mistakes Made */}
        {mistakesMade && mistakesMade !== 'N/A' && mistakesMade !== 'No attempt made.' && (
          <div className="info-section">
            <div className="section-header-bar" style={{ backgroundColor: '#fee2e2' }}>
              <span className="section-icon">⚠️</span>
              <h6 className="section-heading" style={{ color: '#991b1b' }}>Mistakes Made</h6>
            </div>
            <div className="section-content-box">
              <div className="section-text"><MarkdownWithMath content={mistakesMade} /></div>
              {mistakeSection && mistakeSection !== 'N/A' && (
                <p className="section-text" style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#6b7280' }}>
                  Section: {mistakeSection}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Gap Analysis - UPDATED: Using MarkdownWithMath */}
        {gapAnalysis && gapAnalysis !== 'N/A' && gapAnalysis !== 'No gaps identified' && (
          <div className="info-section">
            <div className="section-header-bar" style={{ backgroundColor: '#fef3c7' }}>
              <span className="section-icon">🎯</span>
              <h6 className="section-heading" style={{ color: '#92400e' }}>Gap Analysis</h6>
            </div>
            <div className="section-content-box">
              <div className="section-text">
                <MarkdownWithMath content={gapAnalysis} />
              </div>
            </div>
          </div>
        )}

        {/* Concepts Required */}
        {conceptsRequired && conceptsRequired.length > 0 && (
          <div className="info-section">
            <div className="section-header-bar" style={{ backgroundColor: '#dbeafe' }}>
              <span className="section-icon">💡</span>
              <h6 className="section-heading" style={{ color: '#1e40af' }}>Concepts Required</h6>
            </div>
            <div className="section-content-box">
              <div className="concepts-list">
                {conceptsRequired.map((concept, idx) => {
                  // Handle both string and object formats
                  const conceptName = typeof concept === 'string' 
                    ? concept 
                    : concept?.concept_name || concept?.name || `Concept ${idx + 1}`;
                  const conceptDesc = typeof concept === 'object' 
                    ? concept?.concept_description || concept?.description || null
                    : null;

                  return (
                    <div key={idx} className="concept-card">
                      <div className="concept-header">
                        {/* <span className="concept-number">{idx + 1}</span> */}
                        <span className="concept-name"><MarkdownWithMath content={conceptName} /></span>
                      </div>
                      {conceptDesc && (
                        <div className="concept-desc">
                          <MarkdownWithMath content={conceptDesc} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Teacher View Additional Options */}
        {isTeacherView && errorType === 'no_error' && (
          <div className="success-banner">
            <span className="success-icon">✅</span>
            <span className="success-text">Student answered correctly - No intervention needed</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionEvaluationCard;