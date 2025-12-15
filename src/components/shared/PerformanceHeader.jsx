// src/components/shared/PerformanceHeader.jsx

import React from 'react';
import './PerformanceHeader.css';

const PerformanceHeader = ({ metadata, isTeacherView }) => {
  // Safe access with default values
  const percentage = metadata?.percentage || 0;
  const totalMarks = metadata?.totalMarks || 0;
  const maxMarks = metadata?.maxMarks || 0;
  const grade = metadata?.grade || 'N/A';
  const examType = metadata?.examType || 'N/A';
  const classSection = metadata?.classSection || 'N/A';

  const getGradeColor = (grade) => {
    const colors = {
      'A+': '#10b981', 'A': '#16a34a', 'B+': '#3b82f6', 
      'B': '#2563eb', 'C+': '#06b6d4', 'C': '#f59e0b', 
      'D': '#ef4444', 'F': '#dc2626'
    };
    return colors[grade] || '#6b7280';
  };

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Very Good';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="performance-header">
      <div className="exam-info-grid">
        <div className="info-card">
          <div className="info-icon">📄</div>
          <div className="info-content">
            <span className="info-label">EXAM TYPE</span>
            <span className="info-value">{examType}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">📊</div>
          <div className="info-content">
            <span className="info-label">SCORE</span>
            <span className="info-value">
              {totalMarks} / {maxMarks}
            </span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">🎯</div>
          <div className="info-content">
            <span className="info-label">CLASS/SECTION</span>
            <span className="info-value">{classSection}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">🎨</div>
          <div className="info-content">
            <span className="info-label">PERCENTAGE</span>
            <span className="info-value">{percentage.toFixed(1)}%</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">⭐</div>
          <div className="info-content">
            <span className="info-label">GRADE</span>
            <span 
              className="info-value grade-display"
              style={{ color: getGradeColor(grade) }}
            >
              {grade}
            </span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon">📈</div>
          <div className="info-content">
            <span className="info-label">PERFORMANCE</span>
            <span className="info-value">{getPerformanceLevel(percentage)}</span>
          </div>
        </div>
      </div>

      {/* Overall Performance Bar */}
      <div className="overall-performance">
        <div className="performance-header-row">
          <span className="performance-label">Overall Performance</span>
          <span className="performance-percentage">{percentage.toFixed(1)}%</span>
        </div>
        <div className="progress-bar-full">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Math.min(percentage, 100)}%`,
              background: percentage >= 75 
                ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' 
                : percentage >= 60
                ? 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)'
                : percentage >= 40
                ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PerformanceHeader;