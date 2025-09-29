// StudyStreaks.jsx - Sidebar Version
import React, { useState, useEffect } from 'react';
import './StudyStreaks.css';

const StudyStreaks = () => {
  const [streakData, setStreakData] = useState([]);

  useEffect(() => {
    // Generate streak data for the current week
    const generateStreakData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const today = new Date();
      const currentDay = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert Sunday to 6, Monday to 0

      return days.map((day, index) => ({
        day,
        hasStudied: index <= currentDay && Math.random() > 0.3, // Simulate study activity
        isToday: index === currentDay,
        isFuture: index > currentDay
      }));
    };

    setStreakData(generateStreakData());
  }, []);

  const getStreakCount = () => {
    let count = 0;
    for (let i = streakData.length - 1; i >= 0; i--) {
      if (streakData[i].hasStudied && !streakData[i].isFuture) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  return (
    <div className="study-streaks-sidebar">
      <div className="streaks-header">
        <div className="streak-icon">🔥</div>
        <div className="streak-info">
          <div className="streak-number">{getStreakCount()}</div>
          <div className="streak-label">Day Streak</div>
        </div>
      </div>

      <div className="streak-calendar-sidebar">
        {streakData.map((dayData, index) => (
          <div 
            key={index} 
            className={`streak-day-sidebar ${dayData.hasStudied ? 'completed' : ''} 
                       ${dayData.isToday ? 'today' : ''} 
                       ${dayData.isFuture ? 'future' : ''}`}
          >
            <div className="day-label-sidebar">{dayData.day}</div>
            <div className="day-indicator-sidebar">
              {dayData.hasStudied && !dayData.isFuture ? (
                <div className="flame-icon-sidebar">🔥</div>
              ) : dayData.isToday ? (
                <div className="today-icon-sidebar">📅</div>
              ) : dayData.isFuture ? (
                <div className="future-icon-sidebar">⚪</div>
              ) : (
                <div className="missed-icon-sidebar">⭕</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="streak-message-sidebar">
        {getStreakCount() >= 5 ? (
          <span className="streak-achievement-sidebar">🎉 Amazing streak!</span>
        ) : getStreakCount() >= 3 ? (
          <span className="streak-good-sidebar">💪 Keep it up!</span>
        ) : getStreakCount() >= 1 ? (
          <span className="streak-start-sidebar">🌟 Good start!</span>
        ) : (
          <span className="streak-encourage-sidebar">🚀 Start today!</span>
        )}
      </div>
    </div>
  );
};

export default StudyStreaks;