import React from 'react';
import './ChairmanOverview.css';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const ChairmanOverview = ({ data, onExamSelect, onTabChange }) => {
  return (
    <div className="chairman-overview">
      <h2 className="overview-title">Institutional Overview</h2>
      
      {/* Metric Cards */}
      <div className="grid-4 mb-24">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">👨‍🏫</div>
            <span className="stat-card-trend positive">+3%</span>
          </div>
          <div className="stat-card-value">{data.totalTeachers}</div>
          <div className="stat-card-label">Total Teachers</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">👨‍🎓</div>
            <span className="stat-card-trend positive">+5%</span>
          </div>
          <div className="stat-card-value">{data.totalStudents}</div>
          <div className="stat-card-label">Total Students</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">📚</div>
            <span className="stat-card-trend positive">+2</span>
          </div>
          <div className="stat-card-value">{data.totalClasses}</div>
          <div className="stat-card-label">Total Classes</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon orange">📝</div>
            <span className="stat-card-trend positive">+12</span>
          </div>
          <div className="stat-card-value">{data.totalExams}</div>
          <div className="stat-card-label">Total Exams</div>
        </div>
      </div>

      {/* Submission Overview */}
      <div className="grid-2 mb-24">
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Correction Status</h3>
          </div>
          <div style={{ height: '300px' }}>
            <Pie data={{
              labels: ['Completed', 'Pending'],
              datasets: [{
                data: [data.completedCorrections, data.pendingCorrections],
                backgroundColor: ['#10b981', '#ef4444'],
              }]
            }} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Average Submission Rate</h3>
          </div>
          <div className="submission-rate-display">
            <div className="rate-circle">
              <span className="rate-value">{data.averageSubmissionRate}%</span>
            </div>
            <p className="rate-label">Overall institutional submission rate</p>
          </div>
        </div>
      </div>

      {/* Recent Exams */}
      <div className="recent-exams-section">
        <div className="section-header">
          <h3>Recent Exams</h3>
          <button className="view-all-btn" onClick={() => onTabChange('exam-analytics')}>
            View All →
          </button>
        </div>
        <table className="chairman-table">
          <thead>
            <tr>
              <th>Exam Name</th>
              <th>Class</th>
              <th>Date</th>
              <th>Students</th>
              <th>Average Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.exams.slice(0, 5).map(exam => (
              <tr key={exam.id} onClick={() => onExamSelect(exam)} style={{ cursor: 'pointer' }}>
                <td>{exam.name}</td>
                <td>{exam.class}-{exam.section}</td>
                <td>{new Date(exam.date).toLocaleDateString()}</td>
                <td>{exam.totalStudents}</td>
                <td><strong>{exam.averageScore}%</strong></td>
                <td>
                  <span className={`status-badge ${exam.status.replace('_', '-')}`}>
                    {exam.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section mt-24">
        <h3>Quick Actions</h3>
        <div className="grid-3">
          <button className="action-card" onClick={() => onTabChange('teacher-tracking')}>
            <span className="action-icon">📊</span>
            <span className="action-label">View Teacher Performance</span>
            <span className="action-count">{data.pendingCorrections} Pending</span>
          </button>
          
          <button className="action-card" onClick={() => onTabChange('gap-analysis')}>
            <span className="action-icon">📈</span>
            <span className="action-label">Review Gap Analysis</span>
            <span className="action-count">{data.gapAnalysis.length} Topics</span>
          </button>
          
          <button className="action-card" onClick={() => onTabChange('parent-comm')}>
            <span className="action-icon">📧</span>
            <span className="action-label">Send Communications</span>
            <span className="action-count">{data.studentSubmissions.length} Students</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChairmanOverview;