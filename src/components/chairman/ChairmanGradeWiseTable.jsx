// ChairmanGradeWiseTable.jsx - Grade Distribution Tab Component
import React from 'react';
import './ChairmanGradeWiseTable.css';
import { Bar, Pie } from 'react-chartjs-2';

const ChairmanGradeWiseTable = ({ gradeData, selectedClass }) => {
  // Calculate totals
  const totalStudents = gradeData.reduce((sum, grade) => sum + grade.students, 0);
  const passStudents = gradeData
    .filter(g => g.grade !== 'F')
    .reduce((sum, g) => sum + g.students, 0);
  const excellenceStudents = gradeData
    .filter(g => g.grade === 'A+' || g.grade === 'A')
    .reduce((sum, g) => sum + g.students, 0);

  // Chart data for Bar chart
  const barChartData = {
    labels: gradeData.map(g => g.grade),
    datasets: [{
      label: 'Number of Students',
      data: gradeData.map(g => g.students),
      backgroundColor: [
        '#10b981', // A+ - Green
        '#34d399', // A - Light Green
        '#3b82f6', // B+ - Blue
        '#60a5fa', // B - Light Blue
        '#f59e0b', // C - Orange
        '#f97316', // D - Dark Orange
        '#ef4444', // F - Red
      ],
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Chart data for Pie chart
  const pieChartData = {
    labels: gradeData.map(g => `${g.grade} (${g.students})`),
    datasets: [{
      data: gradeData.map(g => g.students),
      backgroundColor: [
        '#10b981', // A+
        '#34d399', // A
        '#3b82f6', // B+
        '#60a5fa', // B
        '#f59e0b', // C
        '#f97316', // D
        '#ef4444', // F
      ],
      borderWidth: 3,
      borderColor: '#ffffff'
    }]
  };

  // Chart options
  const barChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10
        }
      }
    }
  };

  const pieChartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="chairman-grade-table">
      {/* Header */}
      <div className="grade-header">
        <h2>Grade-wise Distribution</h2>
        <p>Comprehensive grade analysis across institution</p>
      </div>

      {/* Summary Card */}
      <div className="grade-summary-card">
        <div className="summary-item">
          <div className="summary-label">Total Students</div>
          <div className="summary-value">{totalStudents}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Pass Percentage</div>
          <div className="summary-value">
            {totalStudents > 0 
              ? ((passStudents / totalStudents) * 100).toFixed(1)
              : 0}%
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Excellence (A+/A)</div>
          <div className="summary-value">{excellenceStudents}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid-2 mb-24">
        {/* Bar Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Distribution Bar Chart</h3>
          <div style={{ height: '300px' }}>
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
        
        {/* Pie Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Distribution Pie Chart</h3>
          <div style={{ height: '300px' }}>
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      {/* Grade Distribution Table */}
      <div className="table-container">
        <table className="chairman-table grade-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Score Range</th>
              <th>Number of Students</th>
              <th>Percentage</th>
              <th>Visual Distribution</th>
            </tr>
          </thead>
          <tbody>
            {gradeData.map((grade) => (
              <tr key={grade.grade}>
                <td>
                  <span className={`grade-label grade-${grade.grade.replace('+', 'plus')}`}>
                    {grade.grade}
                  </span>
                </td>
                <td>{grade.range}</td>
                <td><strong>{grade.students}</strong></td>
                <td>{grade.percentage}%</td>
                <td>
                  <div className="distribution-bar-container">
                    <div 
                      className={`distribution-bar grade-${grade.grade.replace('+', 'plus')}`}
                      style={{ width: `${grade.percentage}%` }}
                    >
                      {grade.percentage >= 8 && (
                        <span className="bar-label">{grade.students}</span>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="2"><strong>TOTAL</strong></td>
              <td><strong>{totalStudents}</strong></td>
              <td><strong>100%</strong></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Additional Insights */}
      <div className="grid-3 mt-24">
        <div className="stat-card">
          <div className="stat-card-icon green">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-card-value">
            {totalStudents > 0 
              ? ((passStudents / totalStudents) * 100).toFixed(1)
              : 0}%
          </div>
          <div className="stat-card-label">Pass Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon blue">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div className="stat-card-value">
            {totalStudents > 0 
              ? ((excellenceStudents / totalStudents) * 100).toFixed(1)
              : 0}%
          </div>
          <div className="stat-card-label">Excellence Rate</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon orange">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="stat-card-value">
            {gradeData.find(g => g.grade === 'F')?.students || 0}
          </div>
          <div className="stat-card-label">Need Attention</div>
        </div>
      </div>
    </div>
  );
};

export default ChairmanGradeWiseTable;