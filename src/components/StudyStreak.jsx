import React, { useState, useEffect, useContext } from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faFire } from '@fortawesome/free-solid-svg-icons';
import { ProgressContext } from '../contexts/ProgressContext';

const StudyStreak = () => {
  const { getProgressSummary } = useContext(ProgressContext);
  
  // Get progress data
  const progressData = getProgressSummary();

  // Streak-related data
  const currentStreak = progressData.streak || 0;
  const longestStreak = progressData.longestStreak || 0;

  // Streak levels and rewards
  const STREAK_LEVELS = [
    { days: 7, badge: 'Bronze', reward: 50 },
    { days: 14, badge: 'Silver', reward: 100 },
    { days: 30, badge: 'Gold', reward: 250 }
  ];

  // Determine current streak level
  const getCurrentStreakLevel = () => {
    for (let level of STREAK_LEVELS) {
      if (currentStreak < level.days) {
        return {
          currentLevel: level,
          daysToNextBadge: level.days - currentStreak,
          progress: (currentStreak / level.days) * 100
        };
      }
    }
    return {
      currentLevel: STREAK_LEVELS[STREAK_LEVELS.length - 1],
      daysToNextBadge: 0,
      progress: 100
    };
  };

  const streakInfo = getCurrentStreakLevel();

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faFire} className="text-warning mr-2" />
            Study Streak
          </h5>
          <span className="text-muted">
            Longest Streak: {longestStreak} Days
          </span>
        </div>

        <div className="streak-days d-flex mb-2">
          {[...Array(7)].map((_, index) => (
            <div 
              key={index} 
              className="streak-day mr-2"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: index < currentStreak ? '#B0F2B6' : '#E0E0E0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: '5px'
              }}
            >
              <FontAwesomeIcon 
                icon={faStar} 
                className={index < currentStreak ? 'text-success' : 'text-muted'}
              />
            </div>
          ))}
        </div>

        <div className="streak-progress mb-2">
          <ProgressBar 
            now={streakInfo.progress} 
            variant="success" 
            className="mb-2"
          />
          <div className="d-flex justify-content-between">
            <small className="text-muted">
              {currentStreak} Day Streak
            </small>
            <small className="text-muted">
              {streakInfo.daysToNextBadge > 0 
                ? `${streakInfo.daysToNextBadge} more days for ${streakInfo.currentLevel.badge} badge` 
                : 'Max streak reached!'}
            </small>
          </div>
        </div>

        {streakInfo.daysToNextBadge > 0 && (
          <div className="streak-motivation text-center mt-3">
            <p className="text-muted mb-0">
              Keep it up! Just {streakInfo.daysToNextBadge} more{' '}
              {streakInfo.daysToNextBadge === 1 ? 'day' : 'days'} 
              {' '}for a new {streakInfo.currentLevel.badge} badge
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default StudyStreak;
