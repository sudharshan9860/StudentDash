// Achievements.jsx - Sidebar VersionAdd commentMore actions
import React, { useState, useEffect } from 'react';
import './Achievements.css';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Initialize achievements data
    const achievementsData = [
      {
        id: 1,
        title: 'First Steps',
        description: 'Solved your first question',
        icon: '👑',
        earned: true,
        color: 'gold',
        date: '2024-06-20'
      },
      {
        id: 2,
        title: 'Streak Master',
        description: '5 days study streak',
        icon: '🔥',
        earned: true,
        color: 'red',
        date: '2024-06-25'
      },
      {
        id: 3,
        title: 'Problem Solver',
        description: 'Solved 50 questions',
        icon: '⭐',
        earned: true,
        color: 'green',
        date: '2024-06-24'
      },
      {
        id: 4,
        title: 'Math Wizard',
        description: '90% accuracy in Mathematics',
        icon: '🛡️',
        earned: false,
        color: 'silver',
        progress: 75
      },
      {
        id: 5,
        title: 'Speed Demon',
        description: 'Solve 10 questions in 5 minutes',
        icon: '⚡',
        earned: false,
        color: 'silver',
        progress: 60
      },
      {
        id: 6,
        title: 'Diamond Scholar',
        description: 'Complete 100 study sessions',
        icon: '💎',
        earned: false,
        color: 'silver',
        progress: 30
      }
    ];

    setAchievements(achievementsData);
  }, []);

  const earnedAchievements = achievements.filter(a => a.earned);
  const unlockedCount = earnedAchievements.length;
  const totalCount = achievements.length;

  return (
    <div className="achievements-sidebar">
      <div className="achievements-header-sidebar">
        <div className="achievements-title">
          <span className="achievements-icon">🏆</span>
          <span className="achievements-text">Achievements</span>
        </div>
        <div className="achievements-counter-sidebar">
          {unlockedCount}/{totalCount}
        </div>
      </div>
      
      <div className="achievements-progress-sidebar">
        <div className="progress-bar-sidebar">
          <div 
            className="progress-fill-sidebar" 
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="achievements-grid-sidebar">
        {achievements.slice(0, 4).map((achievement) => (
          <div 
            key={achievement.id} 
            className={`achievement-item-sidebar ${achievement.earned ? 'earned' : 'locked'} ${achievement.color}`}
          >
            <div className="achievement-icon-sidebar">
              {achievement.earned ? achievement.icon : '🔒'}
            </div>
            <div className="achievement-content-sidebar">
              <div className="achievement-title-sidebar">{achievement.title}</div>
              {!achievement.earned && achievement.progress && (
                <div className="achievement-progress-small">
                  <div 
                    className="achievement-progress-fill-small"
                    style={{ width: `${achievement.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="achievements-summary-sidebar">
        <span className="next-achievement-sidebar">
          🎯 Next: {achievements.find(a => !a.earned)?.title || 'All unlocked!'}
        </span>
      </div>
    </div>
  );
};

export default Achievements;