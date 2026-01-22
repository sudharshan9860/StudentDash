import React, { useState } from 'react';
import './ChairmanGapAnalysis.css';
import { Bar } from 'react-chartjs-2';

const ChairmanGapAnalysis = ({ gapData, selectedClass }) => {
  const [selectedTopic, setSelectedTopic] = useState(null);

  const filteredData = selectedClass === 'all' 
    ? gapData 
    : gapData.filter(item => item.class.startsWith(selectedClass));

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const chartData = (item) => ({
    labels: ['High Gap', 'Medium Gap', 'Low Gap', 'No Gap'],
    datasets: [{
      label: 'Number of Students',
      data: [
        item.studentsWithHighGap,
        item.studentsWithMediumGap,
        item.studentsWithLowGap,
        item.studentsWithNoGap
      ],
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'],
    }]
  });

  return (
    <div className="chairman-gap-analysis">
      <div className="gap-header">
        <h2>Learning Gap Analysis & Remedial Actions</h2>
        <p>Identify learning gaps and track improvement initiatives</p>
      </div>

      {/* Summary Cards */}
      <div className="grid-3 mb-24">
        <div className="gap-summary-card high">
          <div className="summary-icon">🚨</div>
          <div className="summary-value">{filteredData.filter(d => d.priority === 'high').length}</div>
          <div className="summary-label">High Priority Topics</div>
        </div>
        <div className="gap-summary-card medium">
          <div className="summary-icon">⚠️</div>
          <div className="summary-value">{filteredData.filter(d => d.priority === 'medium').length}</div>
          <div className="summary-label">Medium Priority Topics</div>
        </div>
        <div className="gap-summary-card low">
          <div className="summary-icon">ℹ️</div>
          <div className="summary-value">{filteredData.filter(d => d.priority === 'low').length}</div>
          <div className="summary-label">Low Priority Topics</div>
        </div>
      </div>

      {/* Gap Analysis List */}
      <div className="gap-list">
        {filteredData.map((item, index) => (
          <div key={index} className="gap-item">
            <div className="gap-item-header">
              <div>
                <h3 className="gap-topic">{item.topic}</h3>
                <span className="gap-class">Class: {item.class}</span>
              </div>
              <div className="gap-priority">
                <span className={`priority-badge ${item.priority}`}>
                  {item.priority.toUpperCase()} PRIORITY
                </span>
              </div>
            </div>

            <div className="gap-stats-grid">
              <div className="gap-stat high">
                <div className="stat-label">High Gap</div>
                <div className="stat-value">{item.studentsWithHighGap}</div>
              </div>
              <div className="gap-stat medium">
                <div className="stat-label">Medium Gap</div>
                <div className="stat-value">{item.studentsWithMediumGap}</div>
              </div>
              <div className="gap-stat low">
                <div className="stat-label">Low Gap</div>
                <div className="stat-value">{item.studentsWithLowGap}</div>
              </div>
              <div className="gap-stat none">
                <div className="stat-label">No Gap</div>
                <div className="stat-value">{item.studentsWithNoGap}</div>
              </div>
            </div>

            <div className="gap-chart-section">
              <div style={{ height: '200px' }}>
                <Bar 
                  data={chartData(item)} 
                  options={{ 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true } }
                  }} 
                />
              </div>
            </div>

            <div className="remedial-action-box">
              <div className="remedial-header">
                <span className="remedial-icon">💊</span>
                <strong>Remedial Action</strong>
              </div>
              <p className="remedial-text">{item.remedialActions}</p>
              <div className="remedial-footer">
                <span className="gap-percentage">Average Gap: {item.averageGapPercentage}%</span>
                <button className="update-action-btn">Update Action</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChairmanGapAnalysis;