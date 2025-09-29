import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { ProgressContext } from '../contexts/ProgressContext';
import axiosInstance from '../api/axiosInstance';

const StudyTimer = ({ 
  isActive = false, 
  questionId, 
  onTimerComplete,
  className 
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { updateStudySession } = useContext(ProgressContext);

  // Start or pause timer based on isActive prop
  useEffect(() => {
    setIsRunning(isActive);
  }, [isActive]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    } else if (!isRunning && seconds !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, seconds]);

  // Format time as MM:SS
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Called when study session ends
  const endStudySession = async () => {
    if (!isRunning || seconds === 0) return;
    
    setIsRunning(false);
    
    const minutesSpent = Math.ceil(seconds / 60);
    
    // Update local progress tracking
    updateStudySession(
      new Date().toISOString().split('T')[0], // Current date
      minutesSpent,                           // Study time in minutes
      1,                                      // Questions attempted
      0                                       // Accuracy (will be updated later)
    );
    
    // Send study time to backend
    try {
      await axiosInstance.post('/track-study-time/', {
        question_id: questionId,
        study_time_seconds: seconds,
        completion_date: new Date().toISOString()
      });
      
      // Call the callback if provided
      if (onTimerComplete) {
        onTimerComplete(seconds);
      }
    } catch (error) {
      console.error('Failed to track study time:', error);
    }
  };

  return (
    <div className={`study-timer ${className || ''}`}>
      <FontAwesomeIcon icon={faClock} className="timer-icon" />
      <span className="timer-display">{formatTime(seconds)}</span>
    </div>
  );
};

export default StudyTimer;