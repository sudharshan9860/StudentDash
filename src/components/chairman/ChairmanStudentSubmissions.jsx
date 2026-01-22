// ChairmanStudentSubmissions.jsx - Student Submissions Tab Component
import React, { useState } from 'react';
import './ChairmanStudentSubmissions.css';
import { Line } from 'react-chartjs-2';

const ChairmanStudentSubmissions = ({ submissions, selectedClass, dateRange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Filter submissions based on search, status, and class
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesClass = selectedClass === 'all' || sub.class.startsWith(selectedClass);
    
    return matchesSearch && matchesStatus && matchesClass;
  });

  // Sort submissions
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return a.studentName.localeCompare(b.studentName);
      case 'id':
        return a.studentId.localeCompare(b.studentId);
      case 'submissions':
        return b.totalSubmissions - a.totalSubmissions;
      case 'score':
        return b.averageScore - a.averageScore;
      case 'late':
        return b.lateSubmissions - a.lateSubmissions;
      default:
        return 0;
    }
  });

  // Calculate summary statistics
  const totalSubmissions = filteredSubmissions.reduce((sum, s) => sum + s.totalSubmissions, 0);
  const totalOnTime = filteredSubmissions.reduce((sum, s) => sum + s.onTimeSubmissions, 0);
  const totalLate = filteredSubmissions.reduce((sum, s) => sum + s.lateSubmissions, 0);
  const avgScore = filteredSubmissions.length > 0
    ? (filteredSubmissions.reduce((sum, s) => sum + s.averageScore, 0) / filteredSubmissions.length).toFixed(1)
    : 0;

  // Get status class for badge
  const getStatusClass = (status) => {
    switch(status) {
      case 'excellent':
        return 'status-badge excellent';
      case 'good':
        return 'status-badge good';
      case 'needs_attention':
        return 'status-badge needs-attention';
      default:
        return 'status-badge';
    }
  };

  // Chart data for submission trends
  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'On-Time Submissions',
        data: [85, 88, 90, 87],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      },
      {
        label: 'Late Submissions',
        data: [15, 12, 10, 13],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  return (
    <div className="chairman-student-submissions">
      {/* Header */}
      <div className="submissions-header">
        <h2>Student Submissions Tracking</h2>
        <p>Monitor student assignment completion and performance</p>
      </div>

      {/* Filters */}
      <div className="submissions-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by student name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="needs_attention">Needs Attention</option>
        </select>

        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          className="filter-select"
        >
          <option value="name">Sort by Name</option>
          <option value="id">Sort by ID</option>
          <option value="submissions">Sort by Submissions</option>
          <option value="score">Sort by Score</option>
          <option value="late">Sort by Late Count</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid-4 mb-24">
        <div className="metric-card">
          <div className="metric-value">{totalSubmissions}</div>
          <div className="metric-label">Total Submissions</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalOnTime}</div>
          <div className="metric-label">On-Time Submissions</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalLate}</div>
          <div className="metric-label">Late Submissions</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{avgScore}%</div>
          <div className="metric-label">Average Score</div>
        </div>
      </div>

      {/* Submission Trend Chart */}
      <div className="chart-container mb-24">
        <h3 className="chart-title">Submission Trends (Last 4 Weeks)</h3>
        <div style={{ height: '250px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="table-container">
        <table className="chairman-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Total Submissions</th>
              <th>On-Time</th>
              <th>Late</th>
              <th>Average Score</th>
              <th>Last Submission</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedSubmissions.map((sub) => (
              <tr key={sub.studentId}>
                <td>
                  <code style={{ 
                    background: '#f1f5f9', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {sub.studentId}
                  </code>
                </td>
                <td><strong>{sub.studentName}</strong></td>
                <td>{sub.class}</td>
                <td>
                  <span style={{ 
                    fontWeight: '700', 
                    color: '#1a202c' 
                  }}>
                    {sub.totalSubmissions}
                  </span>
                </td>
                <td>
                  <span className="on-time-badge">
                    {sub.onTimeSubmissions}
                  </span>
                </td>
                <td>
                  <span className={`late-badge ${sub.lateSubmissions > 5 ? 'warning' : ''}`}>
                    {sub.lateSubmissions}
                  </span>
                </td>
                <td>
                  <strong style={{ 
                    color: sub.averageScore >= 80 ? '#10b981' : 
                           sub.averageScore >= 60 ? '#f59e0b' : '#ef4444'
                  }}>
                    {sub.averageScore}%
                  </strong>
                </td>
                <td>
                  {new Date(sub.lastSubmission).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td>
                  <span className={getStatusClass(sub.status)}>
                    {sub.status === 'excellent' ? '🌟 Excellent' :
                     sub.status === 'good' ? '✅ Good' :
                     '⚠️ Needs Attention'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {sortedSubmissions.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📤</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1a202c' }}>No Submissions Found</h3>
            <p style={{ margin: 0 }}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No submission data available for this class'}
            </p>
          </div>
        )}
      </div>

      {/* Performance Insights */}
      {sortedSubmissions.length > 0 && (
        <div className="grid-3 mt-24">
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon green">👍</div>
            </div>
            <div className="stat-card-value">
              {sortedSubmissions.filter(s => s.status === 'excellent').length}
            </div>
            <div className="stat-card-label">Excellent Performers</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon orange">⚠️</div>
            </div>
            <div className="stat-card-value">
              {sortedSubmissions.filter(s => s.lateSubmissions > 5).length}
            </div>
            <div className="stat-card-label">High Late Submissions</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-icon blue">📊</div>
            </div>
            <div className="stat-card-value">
              {totalOnTime > 0 ? ((totalOnTime / totalSubmissions) * 100).toFixed(1) : 0}%
            </div>
            <div className="stat-card-label">On-Time Rate</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChairmanStudentSubmissions;