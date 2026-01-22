import React, { useState } from 'react';
import './ChairmanLeaderboard.css';

const ChairmanLeaderboard = ({ leaderboardData, selectedClass }) => {
  const [viewType, setViewType] = useState('class'); // 'class' or 'student'

  const filteredClassData = selectedClass === 'all'
    ? leaderboardData.classSectionWise
    : leaderboardData.classSectionWise.filter(item => item.class.startsWith(selectedClass));

  const filteredStudentData = selectedClass === 'all'
    ? leaderboardData.topStudents
    : leaderboardData.topStudents.filter(student => student.class.startsWith(selectedClass));

  const getMedalIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getPerformanceClass = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'average';
    return 'below-average';
  };

  return (
    <div className="chairman-leaderboard">
      <div className="leaderboard-header">
        <h2>Institutional Leaderboard</h2>
        <div className="view-toggles">
          <button 
            className={`toggle-btn ${viewType === 'class' ? 'active' : ''}`}
            onClick={() => setViewType('class')}
          >
            Class/Section Wise
          </button>
          <button 
            className={`toggle-btn ${viewType === 'student' ? 'active' : ''}`}
            onClick={() => setViewType('student')}
          >
            Top Students
          </button>
        </div>
      </div>

      {viewType === 'class' ? (
        <div className="class-leaderboard">
          <table className="chairman-table leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Class</th>
                <th>Section</th>
                <th>Total Students</th>
                <th>Average Score</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {filteredClassData.map((item) => (
                <tr key={item.rank} className={`rank-${item.rank}`}>
                  <td>
                    <div className="rank-cell">
                      <span className="rank-medal">{getMedalIcon(item.rank)}</span>
                      <span className="rank-number">#{item.rank}</span>
                    </div>
                  </td>
                  <td><strong>{item.class}</strong></td>
                  <td>{item.section}</td>
                  <td>{item.totalStudents}</td>
                  <td>
                    <div className="score-display">
                      <div className="score-value">{item.averageScore}%</div>
                      <div className={`score-bar ${getPerformanceClass(item.averageScore)}`}>
                        <div className="score-fill" style={{ width: `${item.averageScore}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`performance-badge ${getPerformanceClass(item.averageScore)}`}>
                      {getPerformanceClass(item.averageScore).replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="student-leaderboard">
          <div className="top-three-podium">
            {filteredStudentData.slice(0, 3).map((student) => (
              <div key={student.rank} className={`podium-position position-${student.rank}`}>
                <div className="podium-medal">{getMedalIcon(student.rank)}</div>
                <div className="podium-student-name">{student.name}</div>
                <div className="podium-score">{student.score}%</div>
                <div className="podium-class">{student.class}</div>
              </div>
            ))}
          </div>

          <div className="remaining-students">
            <table className="chairman-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Score</th>
                  <th>Top Subjects</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudentData.slice(3).map((student) => (
                  <tr key={student.rank}>
                    <td>
                      <div className="rank-cell">
                        <span className="rank-medal">{getMedalIcon(student.rank)}</span>
                        <span className="rank-number">#{student.rank}</span>
                      </div>
                    </td>
                    <td><strong>{student.name}</strong></td>
                    <td>{student.class}</td>
                    <td>
                      <span className={`score-badge ${getPerformanceClass(student.score)}`}>
                        {student.score}%
                      </span>
                    </td>
                    <td>
                      <div className="subjects-list">
                        {student.subjects.map(subject => (
                          <span key={subject} className="subject-tag">{subject}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChairmanLeaderboard;