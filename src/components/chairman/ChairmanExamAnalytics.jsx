// ChairmanExamAnalytics.jsx - Exam Analytics Tab Component
import React, { useState } from 'react';
import './ChairmanExamAnalytics.css';
import { Bar, Line } from 'react-chartjs-2';

const ChairmanExamAnalytics = ({ exams, selectedClass, dateRange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedExam, setSelectedExam] = useState(null);

  // Filter exams based on search, status, and class
  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesClass = selectedClass === 'all' || exam.class.startsWith(selectedClass);
    return matchesSearch && matchesStatus && matchesClass;
  });

  // Handle exam card click to expand/collapse
  const handleExamClick = (exam) => {
    setSelectedExam(selectedExam?.id === exam.id ? null : exam);
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    return status === 'completed' ? 'completed' : 'in-progress';
  };

  return (
    <div className="chairman-exam-analytics">
      {/* Header */}
      <div className="analytics-header">
        <h2>Exam Analytics & Performance</h2>
        <p>Comprehensive exam-wise analysis and insights</p>
      </div>

      {/* Filters */}
      <div className="analytics-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search exams..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
        </select>
      </div>

      {/* Overall Stats */}
      <div className="grid-4 mb-24">
        <div className="metric-card blue">
          <div className="metric-icon">📝</div>
          <div className="metric-value">{filteredExams.length}</div>
          <div className="metric-label">Total Exams</div>
        </div>
        
        <div className="metric-card green">
          <div className="metric-icon">✅</div>
          <div className="metric-value">
            {filteredExams.filter(e => e.status === 'completed').length}
          </div>
          <div className="metric-label">Completed</div>
        </div>
        
        <div className="metric-card orange">
          <div className="metric-icon">⏳</div>
          <div className="metric-value">
            {filteredExams.filter(e => e.status === 'in_progress').length}
          </div>
          <div className="metric-label">In Progress</div>
        </div>
        
        <div className="metric-card purple">
          <div className="metric-icon">📊</div>
          <div className="metric-value">
            {filteredExams.length > 0 
              ? (filteredExams.reduce((sum, e) => sum + e.averageScore, 0) / filteredExams.length).toFixed(1)
              : 0}%
          </div>
          <div className="metric-label">Avg Score</div>
        </div>
      </div>

      {/* Exams List */}
      <div className="exams-list">
        {filteredExams.map(exam => (
          <div key={exam.id} className="exam-card">
            {/* Exam Card Header */}
            <div 
              className="exam-card-header" 
              onClick={() => handleExamClick(exam)}
            >
              <div className="exam-info">
                <h3 className="exam-name">{exam.name}</h3>
                <div className="exam-meta">
                  <span>Class: {exam.class}-{exam.section}</span>
                  <span>•</span>
                  <span>Date: {new Date(exam.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Teacher: {exam.teacher}</span>
                </div>
              </div>
              <span className={`status-badge ${getStatusBadge(exam.status)}`}>
                {exam.status === 'completed' ? 'Completed' : 'In Progress'}
              </span>
            </div>

            {/* Exam Stats Grid */}
            <div className="exam-stats-grid">
              <div className="stat-box">
                <div className="stat-label">Total Students</div>
                <div className="stat-value">{exam.totalStudents}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Submitted</div>
                <div className="stat-value">{exam.submitted}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Corrected</div>
                <div className="stat-value">{exam.corrected}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Pending</div>
                <div className="stat-value">{exam.pending}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Average Score</div>
                <div className="stat-value highlight">{exam.averageScore}%</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Highest Score</div>
                <div className="stat-value success">{exam.highestScore}%</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Lowest Score</div>
                <div className="stat-value warning">{exam.lowestScore}%</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Completion</div>
                <div className="stat-value">
                  {Math.round((exam.corrected / exam.totalStudents) * 100)}%
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedExam?.id === exam.id && (
              <div className="exam-details-expanded">
                <div className="details-section">
                  <h4>Performance Distribution</h4>
                  <div style={{ height: '250px' }}>
                    <Bar 
                      data={{
                        labels: ['90-100', '80-89', '70-79', '60-69', '50-59', 'Below 50'],
                        datasets: [{
                          label: 'Number of Students',
                          data: [
                            Math.floor(exam.totalStudents * 0.15),
                            Math.floor(exam.totalStudents * 0.25),
                            Math.floor(exam.totalStudents * 0.30),
                            Math.floor(exam.totalStudents * 0.15),
                            Math.floor(exam.totalStudents * 0.10),
                            Math.floor(exam.totalStudents * 0.05)
                          ],
                          backgroundColor: [
                            '#10b981', // Green
                            '#3b82f6', // Blue
                            '#f59e0b', // Orange
                            '#f97316', // Dark Orange
                            '#ef4444', // Red
                            '#dc2626'  // Dark Red
                          ],
                        }]
                      }}
                      options={{ 
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                          legend: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="details-actions">
                  <button className="action-btn primary">
                    View Detailed Report
                  </button>
                  <button className="action-btn secondary">
                    Download PDF
                  </button>
                  <button className="action-btn secondary">
                    Export Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {filteredExams.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1a202c' }}>No Exams Found</h3>
            <p style={{ margin: 0 }}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No exams available for this class'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChairmanExamAnalytics;