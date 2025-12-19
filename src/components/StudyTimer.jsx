import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { useTimer } from '../contexts/TimerContext';

const StudyTimer = ({ className }) => {
  // Get elapsed time and active state from TimerContext
  const { elapsedTime, isTimerActive } = useTimer();

  // Format time as MM:SS from milliseconds
  const formatTime = (totalMs) => {
    const totalSeconds = Math.floor(totalMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`study-timer ${className || ''} ${isTimerActive ? 'active' : 'stopped'}`}>
      <FontAwesomeIcon icon={faClock} className={`timer-icon ${isTimerActive ? 'pulsing' : ''}`} />
      <span className="timer-display">{formatTime(elapsedTime)}</span>
    </div>
  );
};

export default StudyTimer;
