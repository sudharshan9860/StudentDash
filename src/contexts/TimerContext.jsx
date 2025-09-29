import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [studyTimeLog, setStudyTimeLog] = useState([]);
  const [currentSessionStartTime, setCurrentSessionStartTime] = useState(null);

  // Start timer for a question
  const startTimer = (questionId) => {
    setIsTimerActive(true);
    setCurrentQuestionId(questionId);
    setCurrentSessionStartTime(Date.now());
  };

  // Stop timer and record time spent
  const stopTimer = () => {
    if (isTimerActive && currentSessionStartTime) {
      const endTime = Date.now();
      const timeSpent = endTime - currentSessionStartTime;
      
      // Add to study time log
      setStudyTimeLog(prev => [
        ...prev, 
        {
          questionId: currentQuestionId,
          startTime: currentSessionStartTime,
          endTime,
          timeSpentMs: timeSpent,
        }
      ]);
      
      // Reset current session
      setIsTimerActive(false);
      setCurrentSessionStartTime(null);
      
      return timeSpent;
    }
    return 0;
  };

  // Get total study time for the day
  const getTotalStudyTimeForDay = (date = new Date()) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return studyTimeLog
      .filter(log => {
        const logDate = new Date(log.startTime);
        return logDate >= startOfDay && logDate <= endOfDay;
      })
      .reduce((total, log) => total + log.timeSpentMs, 0);
  };

  // Get total study time for all sessions
  const getTotalStudyTime = () => {
    return studyTimeLog.reduce((total, log) => total + log.timeSpentMs, 0);
  };

  // Export context value
  const contextValue = {
    isTimerActive,
    currentQuestionId,
    studyTimeLog,
    startTimer,
    stopTimer,
    getTotalStudyTimeForDay,
    getTotalStudyTime
  };

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
};

// Custom hook for using the timer context
export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};