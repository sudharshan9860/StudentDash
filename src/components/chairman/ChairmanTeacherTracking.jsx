import React, { useState } from 'react';
import './ChairmanTeacherTracking.css';

const ChairmanTeacherTracking = ({ teachers, selectedClass }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Filter teachers
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'all' || teacher.subject === subjectFilter;
    const matchesClass = selectedClass === 'all' || teacher.classes.some(c => c.startsWith(selectedClass));
    
    return matchesSearch && matchesSubject && matchesClass;
  });

  // Sort teachers
  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    switch(sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'submissionRate':
        return b.submissionRate - a.submissionRate;
      case 'pending':
        return b.answersPending - a.answersPending;
      default:
        return 0;
    }
  });

  // Get unique subjects
  const subjects = [...new Set(teachers.map(t => t.subject))];

  const getSubmissionRateClass = (rate) => {
    if (rate >= 95) return 'excellent';
    if (rate >= 85) return 'good';
    if (rate >= 75) return 'average';
    return 'poor';
  };

  return (
    <div className="chairman-teacher-tracking">
      <div className="tracking-header">
        <h2>Teacher Answer Sheets Tracking</h2>
        <p>Monitor teacher submission rates and grading efficiency</p>
      </div>

      {/* Filters */}
      <div className="tracking-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by teacher name or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="filter-select">
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
          <option value="name">Sort by Name</option>
          <option value="submissionRate">Sort by Submission Rate</option>
          <option value="pending">Sort by Pending Count</option>
        </select>
      </div>

      {/* Statistics Cards */}
      <div className="grid-4 mb-24">
        <div className="metric-card">
          <div className="metric-value">{teachers.reduce((sum, t) => sum + t.answersSubmitted, 0)}</div>
          <div className="metric-label">Total Submitted</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{teachers.reduce((sum, t) => sum + t.answersPending, 0)}</div>
          <div className="metric-label">Total Pending</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {(teachers.reduce((sum, t) => sum + t.submissionRate, 0) / teachers.length).toFixed(1)}%
          </div>
          <div className="metric-label">Avg Submission Rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{teachers.filter(t => t.answersPending > 10).length}</div>
          <div className="metric-label">Need Attention</div>
        </div>
      </div>

      {/* Teacher Table */}
      <div className="table-container">
        <table className="chairman-table">
          <thead>
            <tr>
              <th>Teacher Name</th>
              <th>Subject</th>
              <th>Classes</th>
              <th>Submitted</th>
              <th>Pending</th>
              <th>Total</th>
              <th>Submission Rate</th>
              <th>Avg Grading Time</th>
              <th>Last Submission</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeachers.map(teacher => (
              <tr key={teacher.id}>
                <td><strong>{teacher.name}</strong></td>
                <td>{teacher.subject}</td>
                <td>
                  <div className="classes-list">
                    {teacher.classes.map(cls => (
                      <span key={cls} className="class-badge">{cls}</span>
                    ))}
                  </div>
                </td>
                <td><span className="submitted-count">{teacher.answersSubmitted}</span></td>
                <td>
                  <span className={`pending-count ${teacher.answersPending > 10 ? 'warning' : ''}`}>
                    {teacher.answersPending}
                  </span>
                </td>
                <td>{teacher.totalAssignments}</td>
                <td>
                  <div className="rate-display">
                    <div className={`rate-bar ${getSubmissionRateClass(teacher.submissionRate)}`}>
                      <div className="rate-fill" style={{ width: `${teacher.submissionRate}%` }}></div>
                    </div>
                    <span className="rate-text">{teacher.submissionRate}%</span>
                  </div>
                </td>
                <td>{teacher.averageGradingTime}</td>
                <td>{new Date(teacher.lastSubmission).toLocaleDateString()}</td>
                <td>
                  <button className="action-btn">View Details</button>
                  {teacher.answersPending > 10 && (
                    <button className="action-btn reminder">Send Reminder</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChairmanTeacherTracking;