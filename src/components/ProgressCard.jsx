// ProgressCard.jsx - Sidebar Version
import React, { useState, useEffect } from 'react';
import './ProgressCard.css';

const ProgressCard = () => {
  const [progressData, setProgressData] = useState({
    completionPercentage: 89,
    questionsSolved: 127,
    studySessions: 23,
    accuracyRate: 92,
    weeklyGoal: 150,
    weeklyProgress: 127
  });

  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    // Animate progress circle
    const timer = setTimeout(() => {
      setAnimatedProgress(progressData.completionPercentage);
    }, 500);

    return () => clearTimeout(timer);
  }, [progressData.completionPercentage]);

  const calculateStrokeDasharray = (percentage) => {
    const radius = 30; // Smaller for sidebar
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    return { strokeDasharray, strokeDashoffset };
  };

  const { strokeDasharray, strokeDashoffset } = calculateStrokeDasharray(animatedProgress);

  return (
    <div className="progress-card-sidebar">
      {/* Circular Progress */}
      <div className="progress-circle-sidebar">
        <svg className="progress-svg" width="70" height="70">
          <circle
            cx="35"
            cy="35"
            r="30"
            stroke="var(--border-color)"
            strokeWidth="5"
            fill="none"
          />
          <circle
            cx="35"
            cy="35"
            r="30"
            stroke="#10b981"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="progress-circle-fill-sidebar"
          />
        </svg>
        <div className="progress-text-sidebar">
          <div className="progress-percentage-sidebar">{progressData.completionPercentage}%</div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="progress-stats-sidebar">
        <div className="stat-row">
          <span className="stat-label-sidebar">Questions</span>
          <span className="stat-value-sidebar">{progressData.questionsSolved}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label-sidebar">Sessions</span>
          <span className="stat-value-sidebar">{progressData.studySessions}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label-sidebar">Accuracy</span>
          <span className="stat-value-sidebar">{progressData.accuracyRate}%</span>
        </div>
      </div>

      {/* Weekly Goal */}
      <div className="weekly-goal-sidebar">
        <div className="weekly-header">
          <span className="weekly-title">Weekly Goal</span>
          <span className="weekly-count">{progressData.weeklyProgress}/{progressData.weeklyGoal}</span>
        </div>
        <div className="weekly-progress-bar-sidebar">
          <div 
            className="weekly-progress-fill-sidebar"
            style={{ 
              width: `${Math.min((progressData.weeklyProgress / progressData.weeklyGoal) * 100, 100)}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;