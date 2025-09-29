import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, ReferenceLine
} from 'recharts';
import './StudentAnalysis.css';

const StudentAnalysis = ({ selectedClass, selectedStudent, onStudentSelect, classesData, onClassChange }) => {
  // Main tab state
  const [studentAnalysisMainTab, setStudentAnalysisMainTab] = useState('score-progression');
  
  // View states for interactive charts
  const [scoreDateView, setScoreDateView] = useState('combined');
  const [chapterView, setChapterView] = useState('combined');
  
  // Summary tab filters
  const [summaryFilter, setSummaryFilter] = useState('all');
  
  // Mistake Analysis states
  const [selectedChapterFilter, setSelectedChapterFilter] = useState('All Chapters');
  const [selectedPerformanceFilter, setSelectedPerformanceFilter] = useState('All Percentages');

  // Animation states
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Function to get students for selected class
  const getStudentsForClass = () => {
    if (!selectedClass || !classesData[selectedClass.id]) {
      // Return sample students if no class data
      return [
        { id: 1, name: "Arjun Patel", rollNo: "10HPS21", class: "6th", efficiency: 78 },
        { id: 2, name: "Sneha Gupta", rollNo: "10HPS17", class: "6th", efficiency: 82 },
        { id: 3, name: "Rohit Sharma", rollNo: "10HPS18", class: "6th", efficiency: 75 },
        { id: 4, name: "Priya Sharma", rollNo: "10HPS02", class: "6th", efficiency: 85 },
        { id: 5, name: "Ravi Kumar", rollNo: "10HPS19", class: "6th", efficiency: 72 },
        { id: 6, name: "Anita Singh", rollNo: "10HPS20", class: "6th", efficiency: 89 }
      ];
    }
    
    // Add rollNo to existing students if not present
    const students = classesData[selectedClass.id].students || [];
    return students.map((student, index) => ({
      ...student,
      rollNo: student.rollNo || 10HPS${String(index + 21).padStart(2, '0')}
    }));
  };

  // Auto-select first student if none selected (for testing)
  useEffect(() => {
    const students = getStudentsForClass();
    if (!selectedStudent && students.length > 0 && onStudentSelect) {
      onStudentSelect(students[0]);
    }
  }, [selectedClass, classesData, selectedStudent, onStudentSelect]);

  // Enhanced data for Score Date-wise Progression
  const studentDateWiseComparisonData = [
    { date: 'Jun 23', homework: 18, classwork: 38 },
    { date: 'Jun 25', homework: 35, classwork: 20 },
    { date: 'Jun 27', homework: 78, classwork: 47 },
    { date: 'Jun 29', homework: 80, classwork: 28 },
    { date: 'Jul 01', homework: 85, classwork: 25 },
    { date: 'Jul 03', homework: 92, classwork: 44 }
  ];

  // Enhanced Topic-wise Performance Data for Chapter Analysis
  const topicWisePerformanceData = [
    { topic: 'Calculus - Integration', homework: 100, classwork: 12 },
    { topic: 'Algebra - Linear Equations', homework: 75, classwork: 15 },
    { topic: 'Statistics', homework: 78, classwork: 20 },
    { topic: 'Algebra - Rational Functions', homework: 80, classwork: 32 },
    { topic: 'Probability', homework: 72, classwork: 35 },
    { topic: 'Trigonometry', homework: 79, classwork: 49 },
    { topic: 'Quadratic Applications', homework: 68, classwork: 40 },
    { topic: 'Calculus - Derivatives', homework: 59, classwork: 32 },
    { topic: 'Functions and Graphs', homework: 51, classwork: 58 },
    { topic: 'Coordinate Geometry', homework: 66, classwork: 93 }
  ];

  // Answer Categories Data for Pie Chart
  const answerCategoriesData = [
    { name: 'Correct', value: 43.3, count: 13, color: '#22c55e' },
    { name: 'Partially-Correct', value: 10, count: 3, color: '#f59e0b' },
    { name: 'Numerical Error', value: 13.3, count: 4, color: '#ef4444' },
    { name: 'Irrelevant', value: 23.3, count: 7, color: '#8b5cf6' },
    { name: 'Unattempted', value: 10, count: 3, color: '#6b7280' }
  ];

  // Mistake Analysis Questions Data
  const mistakeAnalysisData = [
    {
      id: 'Q1',
      chapter: 'Quadratic Applications',
      date: '2023-06-23',
      question: 'Find the shortest distance...',
      myScore: '0/20',
      performance: '0.0%',
      mistakeTracker: 'First submission, no prior mistakes',
      currentStatus: 'IRRELEVANT',
      studentMistake: 'Irrelevant formula application',
      correctApproach: 'Minimize the distance function using calculus'
    },
    {
      id: 'Q2',
      chapter: 'Quadratic Applications',
      date: '2023-06-25',
      question: 'Find the vertex of the parabola...',
      myScore: '0/8',
      performance: '0.0%',
      mistakeTracker: 'First submission, no prior mistakes',
      currentStatus: 'NO ATTEMPT',
      studentMistake: 'Fig = 5',
      correctApproach: 'Minimize the distance function using calculus'
    },
    {
      id: 'Q3',
      chapter: 'Algebra - Linear Equations',
      date: '2023-06-23',
      question: 'Solve the system: 2x + 3y = ...',
      myScore: '3/6',
      performance: '50.0%',
      mistakeTracker: 'First submission, no prior mistakes',
      currentStatus: 'NUMERICAL ERROR',
      studentMistake: '5y = 6',
      correctApproach: 'Minimize the distance function using calculus'
    },
    {
      id: 'Q4',
      chapter: 'Coordinate Geometry',
      date: '2023-06-23',
      question: 'Find the equation of line passing...',
      myScore: '1/5',
      performance: '20.0%',
      mistakeTracker: 'First submission, no prior mistakes',
      currentStatus: 'CONCEPTUAL ERROR',
      studentMistake: 'Area = ½ × base × height',
      correctApproach: 'Minimize the distance function using calculus'
    },
    {
      id: 'Q5',
      chapter: 'Coordinate Geometry',
      date: '2023-06-25',
      question: 'Evaluate sin(30°) + cos(60°)',
      myScore: '2/4',
      performance: '50.0%',
      mistakeTracker: 'First submission, no prior mistakes',
      currentStatus: 'VALUE ERROR',
      studentMistake: 'cos(60°) = 0.5',
      correctApproach: 'Minimize the distance function using calculus'
    }
  ];

  // Priority chapters data based on NCERT weightage
  const priorityChaptersData = [
    {
      chapter: 'Calculus - Integration',
      performance: '0%',
      weightage: '15%',
      priority: 'High',
      priorityColor: '#fee2e2',
      recommendation: '🔥 High Priority'
    },
    {
      chapter: 'Quadratic Applications',
      performance: '38%',
      weightage: '12%',
      priority: 'Medium',
      priorityColor: '#fef3c7',
      recommendation: '⚠ Medium Priority'
    },
    {
      chapter: 'Trigonometry',
      performance: '81%',
      weightage: '10%',
      priority: 'Maintain',
      priorityColor: '#d1fae5',
      recommendation: '✅ Maintain'
    }
  ];

  // Function to get filtered chart data based on view
  const getFilteredDateData = () => {
    if (scoreDateView === 'homework') {
      return studentDateWiseComparisonData.map(item => ({
        date: item.date,
        homework: item.homework
      }));
    } else if (scoreDateView === 'classwork') {
      return studentDateWiseComparisonData.map(item => ({
        date: item.date,
        classwork: item.classwork
      }));
    }
    return studentDateWiseComparisonData;
  };

  const getFilteredChapterData = () => {
    if (chapterView === 'homework') {
      return topicWisePerformanceData.map(item => ({
        topic: item.topic,
        homework: item.homework
      }));
    } else if (chapterView === 'classwork') {
      return topicWisePerformanceData.map(item => ({
        topic: item.topic,
        classwork: item.classwork
      }));
    }
    return topicWisePerformanceData;
  };

  // Enhanced Score Date-wise Progression with chart controls
  const renderScoreDatewiseProgression = () => {
    const chartData = getFilteredDateData();
    
    return (
      <div className="score-progression-container">
        <div className="enhanced-header">
          <div className="header-content">
            <h2 className="chart-title">📈 Homework vs Classwork: Date-wise Performance Analysis</h2>
            <p className="chart-subtitle">Score Comparison Over Time with All Submission Dates</p>
          </div>
        </div>

        <div className="chart-with-controls">
          <div className="chart-main-area">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                {(scoreDateView === 'combined' || scoreDateView === 'homework') && (
                  <Line 
                    type="monotone" 
                    dataKey="homework" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    name="Homework Performance (%)"
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: '#16a34a' }}
                  />
                )}
                {(scoreDateView === 'combined' || scoreDateView === 'classwork') && (
                  <Line 
                    type="monotone" 
                    dataKey="classwork" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Classwork Performance (%)"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: '#dc2626' }}
                  />
                )}
                <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-controls">
            <div className="time-range-controls">
              <button className="time-btn active">1D</button>
              <button className="time-btn">5D</button>
              <button className="time-btn">10D</button>
              <button className="time-btn">15D</button>
              <button className="time-btn">1M</button>
              <button className="time-btn">Max</button>
            </div>
            
            <div className="view-toggle-controls">
              <div className="control-label">📊 View Options:</div>
              <button 
                className={view-btn ${scoreDateView === 'combined' ? 'active' : ''}}
                onClick={() => setScoreDateView('combined')}
              >
                📊 Combined View
              </button>
              <button 
                className={view-btn ${scoreDateView === 'homework' ? 'active' : ''}}
                onClick={() => setScoreDateView('homework')}
              >
                📚 Homework Only
              </button>
              <button 
                className={view-btn ${scoreDateView === 'classwork' ? 'active' : ''}}
                onClick={() => setScoreDateView('classwork')}
              >
                ✏ Classwork Only
              </button>
            </div>

            <div className="performance-indicator">
              <div className="indicator-item">
                <span className="indicator-label">Improvement Trend:</span>
                <span className="indicator-value positive">15.07% per assignment</span>
              </div>
              <div className="ranking-badge">
                <div className="badge-content">
                  <span className="badge-icon">🏆</span>
                  <div className="badge-text">
                    <div className="badge-title">YOU ARE AMONG TOP 20% STUDENTS</div>
                    <div className="badge-stats">
                      <span>Your Score: 66.8%</span>
                      <span>Class Avg: 62.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Chapter Analysis
  const renderChapterAnalysis = () => {
    const chartData = getFilteredChapterData();
    
    return (
      <div className="chapter-analysis-container">
        <div className="enhanced-header">
          <div className="header-content">
            <h2 className="chart-title">📚 Topic Analysis</h2>
            <p className="chart-subtitle">Performance comparison across different topics</p>
          </div>
        </div>

        <div className="chart-with-controls">
          <div className="chart-main-area">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="topic" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  fontSize={11}
                  stroke="#6b7280"
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                {(chapterView === 'combined' || chapterView === 'homework') && (
                  <Bar 
                    dataKey="homework" 
                    fill="#22c55e" 
                    name="Homework Performance"
                    radius={[2, 2, 0, 0]}
                  />
                )}
                {(chapterView === 'combined' || chapterView === 'classwork') && (
                  <Bar 
                    dataKey="classwork" 
                    fill="#ef4444" 
                    name="Classwork Performance"
                    radius={[2, 2, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-controls">
            <div className="time-range-controls">
              <button className="time-btn active">1D</button>
              <button className="time-btn">5D</button>
              <button className="time-btn">10D</button>
              <button className="time-btn">15D</button>
              <button className="time-btn">1M</button>
              <button className="time-btn">Max</button>
            </div>
            
            <div className="view-toggle-controls">
              <div className="control-label">📊 View Options:</div>
              <button 
                className={view-btn ${chapterView === 'combined' ? 'active' : ''}}
                onClick={() => setChapterView('combined')}
              >
                📊 Combined View
              </button>
              <button 
                className={view-btn ${chapterView === 'homework' ? 'active' : ''}}
                onClick={() => setChapterView('homework')}
              >
                📚 Homework Only
              </button>
              <button 
                className={view-btn ${chapterView === 'classwork' ? 'active' : ''}}
                onClick={() => setChapterView('classwork')}
              >
                ✏ Classwork Only
              </button>
            </div>

            <div className="chapter-insights">
              <div className="insight-item">
                <span className="insight-icon">💡</span>
                <span className="insight-text">Focus on Calculus Integration</span>
              </div>
              <div className="insight-item">
                <span className="insight-icon">📈</span>
                <span className="insight-text">Strong in Coordinate Geometry</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Mistake Progress Analysis
  const renderMistakeProgressAnalysisTab = () => {
    const filteredQuestions = mistakeAnalysisData.filter(question => {
      const chapterMatch = selectedChapterFilter === 'All Chapters' || question.chapter === selectedChapterFilter;
      const performanceMatch = selectedPerformanceFilter === 'All Percentages' || 
        (selectedPerformanceFilter === '0-25%' && parseFloat(question.performance) <= 25) ||
        (selectedPerformanceFilter === '26-50%' && parseFloat(question.performance) > 25 && parseFloat(question.performance) <= 50) ||
        (selectedPerformanceFilter === '51-75%' && parseFloat(question.performance) > 50 && parseFloat(question.performance) <= 75) ||
        (selectedPerformanceFilter === '76-100%' && parseFloat(question.performance) > 75);
      
      return chapterMatch && performanceMatch;
    });

    return (
      <div className="mistake-analysis-container">
        <div className="enhanced-header">
          <h2 className="section-title">🔍 Mistake-Progress-Analysis</h2>
        </div>

        {/* How Well Did I Do Section */}
        <div className="answer-categories-section">
          <h3 className="categories-title">📊 How Well Did I Do? (Answer Categories)</h3>
          <div className="categories-content">
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={answerCategoriesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={160}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {answerCategoriesData.map((entry, index) => (
                      <Cell key={cell-${index}} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [${value}%, name]}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-center-info">
                <div className="total-label">Total</div>
                <div className="total-number">30</div>
                <div className="total-description">Questions</div>
              </div>
            </div>
            
            <div className="categories-legend">
              {answerCategoriesData.map((category, index) => (
                <div key={index} className="legend-item">
                  <div className="legend-indicator" style={{ backgroundColor: category.color }}></div>
                  <div className="legend-content">
                    <div className="legend-name">{category.name}</div>
                    <div className="legend-stats">
                      <span className="legend-count">{category.count} questions</span>
                    </div>
                  </div>
                  <div className="legend-percentage" style={{ color: category.color }}>
                    {category.value}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Priority Chapters Section */}
        <div className="priority-chapters-section">
          <h3 className="subsection-title">🎯 Priority Chapters (Based on NCERT Weightage)</h3>
          <div className="priority-cards-grid">
            {priorityChaptersData.map((chapter, index) => (
              <div 
                key={index} 
                className="priority-card" 
                style={{ backgroundColor: chapter.priorityColor }}
              >
                <div className="priority-header">
                  <div className="priority-indicator">
                    {chapter.priority === 'High' && '🔥 High Priority:'}
                    {chapter.priority === 'Medium' && '⚠ Medium Priority:'}
                    {chapter.priority === 'Maintain' && '✅ Maintain:'}
                  </div>
                </div>
                <div className="priority-content">
                  <div className="chapter-name">{chapter.chapter}</div>
                  <div className="priority-stats">
                    <span>({chapter.performance} performance, {chapter.weightage} weightage)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Section */}
        <div className="filters-section">
          <h3 className="subsection-title">🔍 Explore Your Questions In Different Ways</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">📊 Filter By Performance Percentage</label>
              <div className="filter-subtitle">Choose A Performance Range:</div>
              <select 
                value={selectedPerformanceFilter}
                onChange={(e) => setSelectedPerformanceFilter(e.target.value)}
                className="filter-dropdown"
              >
                <option value="All Percentages">All Percentages</option>
                <option value="0-25%">0-25%</option>
                <option value="26-50%">26-50%</option>
                <option value="51-75%">51-75%</option>
                <option value="76-100%">76-100%</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">📚 Filter By Chapter</label>
              <div className="filter-subtitle">Choose A Chapter:</div>
              <select 
                value={selectedChapterFilter}
                onChange={(e) => setSelectedChapterFilter(e.target.value)}
                className="filter-dropdown"
              >
                <option value="All Chapters">All Chapters</option>
                <option value="Quadratic Applications">Quadratic Applications</option>
                <option value="Algebra - Linear Equations">Algebra - Linear Equations</option>
                <option value="Coordinate Geometry">Coordinate Geometry</option>
                <option value="Calculus - Integration">Calculus - Integration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-section">
          <div className="results-header">
            <h3 className="results-title">📋 Filtered Results - {filteredQuestions.length} Questions Found</h3>
            <p className="results-subtitle">Showing questions based on your selected filters</p>
          </div>

          {/* Summary Metrics */}
          <div className="results-metrics">
            <div className="metric-card">
              <div className="metric-label">Average Performance</div>
              <div className="metric-value">66.8%</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Room for Improvement</div>
              <div className="metric-value">33.2%</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Chapters Covered</div>
              <div className="metric-value">10 Chapters</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Questions Found</div>
              <div className="metric-value">{filteredQuestions.length} Questions</div>
            </div>
          </div>

          {/* Questions Table */}
          <div className="questions-table-container">
            <table className="questions-table">
              <thead>
                <tr>
                  <th>Question ID</th>
                  <th>Chapter</th>
                  <th>Date</th>
                  <th>Question</th>
                  <th>My Score</th>
                  <th>Performance</th>
                  <th>Mistake Tracker</th>
                  <th>Current Status</th>
                  <th>Student Mistake</th>
                  <th>Correct Approach</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map((question) => (
                  <tr key={question.id} className="question-row">
                    <td className="question-id">{question.id}</td>
                    <td className="chapter-cell">{question.chapter}</td>
                    <td className="date-cell">{question.date}</td>
                    <td className="question-cell">{question.question}</td>
                    <td className="score-cell">{question.myScore}</td>
                    <td className="performance-cell">{question.performance}</td>
                    <td className="tracker-cell">{question.mistakeTracker}</td>
                    <td className={status-cell status-${question.currentStatus.toLowerCase().replace(/\s+/g, '-')}}>
                      {question.currentStatus}
                    </td>
                    <td className="mistake-cell">{question.studentMistake}</td>
                    <td className="approach-cell">{question.correctApproach}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Summary Tab
  const renderSummaryTab = () => {
    const getSummaryData = () => {
      const baseData = {
        overallPerformance: 50.3,
        homeworkAverage: 66.8,
        classworkAverage: 33.8,
        performanceGap: -33.0,
        improvementRate: 15.07,
        totalAssessments: 6,
        chaptersAnalyzed: 10,
        questionsAttempted: 30,
        overallAccuracy: 43.3
      };

      switch (summaryFilter) {
        case 'homework':
          return {
            ...baseData,
            focus: 'Homework Performance',
            mainMetric: baseData.homeworkAverage,
            insight: 'Strong homework performance with consistent improvement trend'
          };
        case 'classwork':
          return {
            ...baseData,
            focus: 'Classwork Performance', 
            mainMetric: baseData.classworkAverage,
            insight: 'Classwork needs significant improvement - focus on time management'
          };
        default:
          return {
            ...baseData,
            focus: 'Overall Performance',
            mainMetric: baseData.overallPerformance,
            insight: 'Large gap between homework and classwork performance indicates time management issues'
          };
      }
    };

    const summaryData = getSummaryData();

    return (
      <div className="enhanced-summary-container">
        <div className="enhanced-header">
          <h2 className="section-title">📋 Student Performance Summary</h2>
        </div>

        {/* Summary Filters */}
        <div className="summary-filters">
          <h3 className="filter-section-title">📊 Filter Summary View:</h3>
          <div className="filter-buttons">
            <button 
              className={filter-btn ${summaryFilter === 'all' ? 'active' : ''}}
              onClick={() => setSummaryFilter('all')}
            >
              📈 All Data
            </button>
            <button 
              className={filter-btn ${summaryFilter === 'homework' ? 'active' : ''}}
              onClick={() => setSummaryFilter('homework')}
            >
              📚 Homework Only
            </button>
            <button 
              className={filter-btn ${summaryFilter === 'classwork' ? 'active' : ''}}
              onClick={() => setSummaryFilter('classwork')}
            >
              ✏ Classwork Only
            </button>
          </div>
        </div>

        {/* Main Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card main-performance">
            <div className="card-header">
              <span className="card-icon">🎯</span>
              <div className="card-title">{summaryData.focus} Overview</div>
            </div>
            <div className="main-metric">{summaryData.mainMetric}%</div>
            <div className="metric-description">{summaryData.insight}</div>
          </div>

          <div className="summary-card key-metrics">
            <div className="card-header">
              <span className="card-icon">📊</span>
              <div className="card-title">Key Metrics</div>
            </div>
            <div className="metrics-list">
              <div className="metric-item">
                <span className="metric-label">Homework Average:</span>
                <span className="metric-value">{summaryData.homeworkAverage}%</span>
                <span className="metric-note">(Above class average of 62.2%)</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Classwork Average:</span>
                <span className="metric-value">{summaryData.classworkAverage}%</span>
                <span className="metric-note">(Below class average of 51.5%)</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Performance Gap:</span>
                <span className="metric-value negative">{summaryData.performanceGap}%</span>
                <span className="metric-note">(Significant difference between HW and CW)</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Improvement Rate:</span>
                <span className="metric-value positive">{summaryData.improvementRate}%</span>
                <span className="metric-note">in homework assignments</span>
              </div>
            </div>
          </div>

          <div className="summary-card recommendations">
            <div className="card-header">
              <span className="card-icon">💡</span>
              <div className="card-title">Recommendations</div>
            </div>
            <div className="recommendations-list">
              <div className="recommendation-item">
                <span className="rec-icon">⏰</span>
                <span>Focus on time management skills for classwork</span>
              </div>
              <div className="recommendation-item">
                <span className="rec-icon">🔄</span>
                <span>Practice more timed exercises</span>
              </div>
              <div className="recommendation-item">
                <span className="rec-icon">🎯</span>
                <span>Reinforce conceptual understanding through targeted practice</span>
              </div>
              <div className="recommendation-item">
                <span className="rec-icon">✅</span>
                <span>Reduce careless errors through careful review processes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="statistics-summary">
          <h3 className="stats-title">📈 Performance Statistics Summary</h3>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-number">{summaryData.totalAssessments}</div>
              <div className="stat-label">Total Assessment Dates</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{summaryData.chaptersAnalyzed}</div>
              <div className="stat-label">Chapters Analyzed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{summaryData.questionsAttempted}</div>
              <div className="stat-label">Total Questions Attempted</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{summaryData.overallAccuracy}%</div>
              <div className="stat-label">Overall Accuracy Rate</div>
            </div>
          </div>
        </div>

        {/* NCERT Priority Chapters */}
        <div className="priority-chapters-summary">
          <h3 className="priority-title">🎯 Priority Chapters (Based on NCERT Weightage)</h3>
          <div className="priority-summary-cards">
            {priorityChaptersData.map((chapter, index) => (
              <div 
                key={index} 
                className="priority-summary-card"
                style={{ backgroundColor: chapter.priorityColor }}
              >
                <div className="priority-badge">
                  {chapter.priority === 'High' && '🔥'}
                  {chapter.priority === 'Medium' && '⚠'}
                  {chapter.priority === 'Maintain' && '✅'}
                  <span className="priority-text">{chapter.recommendation}</span>
                </div>
                <div className="priority-details">
                  <div className="chapter-title">{chapter.chapter}</div>
                  <div className="chapter-stats">({chapter.performance} performance, {chapter.weightage} weightage)</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Main render function for student analysis content
  const renderStudentAnalysisContent = () => {
    return (
      <div className="student-analysis-content">
        {/* Updated Main Tabs */}
        <div className="main-tabs-container">
          {[
            { key: 'score-progression', icon: '📈', label: 'Score- Date-wise progression', color: '#3b82f6' },
            { key: 'chapter-analysis', icon: '📚', label: 'Chapter Analysis', color: '#8b5cf6' },
            { key: 'mistakes', icon: '🔍', label: 'Mistake-Progress-Analysis', color: '#ef4444' },
            { key: 'summary', icon: '📋', label: 'Summary', color: '#22c55e' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStudentAnalysisMainTab(tab.key)}
              className={main-tab-button ${tab.key} ${studentAnalysisMainTab === tab.key ? 'active' : ''}}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className={content-area ${isTransitioning ? 'loading' : ''}}>
          {studentAnalysisMainTab === 'score-progression' && renderScoreDatewiseProgression()}
          {studentAnalysisMainTab === 'chapter-analysis' && renderChapterAnalysis()}
          {studentAnalysisMainTab === 'mistakes' && renderMistakeProgressAnalysisTab()}
          {studentAnalysisMainTab === 'summary' && renderSummaryTab()}
        </div>
      </div>
    );
  };

  return (
    <div className="student-analysis-main-content">
      <div className="student-analysis-header">
        <div className="header-top">
          <div className="header-info">
            <div className="header-icon">👤</div>
            <div>
              <h2 className="header-title">Student Analysis Dashboard</h2>
              <p className="header-subtitle">
                {selectedStudent ? 
                  Detailed performance analysis for ${selectedStudent.rollNo} - ${selectedStudent.name} : 
                  'Select a student from the dropdown above to view detailed analysis'
                }
              </p>
            </div>
          </div>
          <div className="selectors-container">
            {/* Select Class */}
            <div className="selector-group">
              <span className="selector-label">Select Class</span>
              <select
                value={selectedClass.name}
                onChange={(e) => {
                  const classData = Object.values(classesData).find(cls => cls.name === e.target.value);
                  if (classData) {
                    onClassChange(classData);
                  }
                }}
                className="selector-dropdown"
              >
                <option value="Class 6th">Class 6th</option>
                <option value="Class 7th">Class 7th</option>
                <option value="Class 8th">Class 8th</option>
                <option value="Class 9th">Class 9th</option>
                <option value="Class 10th">Class 10th</option>
                <option value="Class 11th">Class 11th</option>
                <option value="Class 12th">Class 12th</option>
              </select>
            </div>

            {/* Select Student */}
            <div className="selector-group">
              <span className="selector-label">Select Student</span>
              <select
                value={selectedStudent ? selectedStudent.rollNo : ''}
                onChange={(e) => {
                  const studentRollNo = e.target.value;
                  if (studentRollNo) {
                    const student = getStudentsForClass().find(s => s.rollNo === studentRollNo);
                    if (student && onStudentSelect) {
                      onStudentSelect(student);
                    }
                  } else {
                    if (onStudentSelect) {
                      onStudentSelect(null);
                    }
                  }
                }}
                className="selector-dropdown"
              >
                <option value="">Select Student</option>
                {getStudentsForClass().map(student => (
                  <option key={student.id || student.rollNo} value={student.rollNo}>
                    {student.rollNo} - {student.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {selectedStudent ? renderStudentAnalysisContent() : (
        <div className="no-student-selected">
          <div className="empty-state-content">
            <div className="empty-state-icon">👆</div>
            <h3 className="empty-state-title">Please select a student to view analysis</h3>
            <p className="empty-state-text">Choose a student from the dropdown above to see detailed performance analysis.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnalysis;