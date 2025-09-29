import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, ReferenceLine
} from 'recharts';
import './StudentAnalysis.css';

// Define all students data by class
const STUDENTS_BY_CLASS = {
  '6th': [
    { id: '6HPS17', name: 'Ram', rollNo: '6HPS17', class: '6th', baseEfficiency: 78 },
    { id: '6HPS18', name: 'Bhem', rollNo: '6HPS18', class: '6th', baseEfficiency: 82 },
    { id: '6HPS19', name: 'Shubam', rollNo: '6HPS19', class: '6th', baseEfficiency: 75 }
  ],
  '7th': [
    { id: '7HPS17', name: 'Vasu', rollNo: '7HPS17', class: '7th', baseEfficiency: 85 },
    { id: '7HPS18', name: 'Bhanu', rollNo: '7HPS18', class: '7th', baseEfficiency: 72 },
    { id: '7HPS19', name: 'Sreenu', rollNo: '7HPS19', class: '7th', baseEfficiency: 89 }
  ],
  '8th': [
    { id: '8HPS17', name: 'Gupta', rollNo: '8HPS17', class: '8th', baseEfficiency: 91 },
    { id: '8HPS18', name: 'Pranja', rollNo: '8HPS18', class: '8th', baseEfficiency: 68 },
    { id: '8HPS19', name: 'Srenija', rollNo: '8HPS19', class: '8th', baseEfficiency: 84 }
  ],
  '9th': [
    { id: '9HPS17', name: 'Viswa', rollNo: '9HPS17', class: '9th', baseEfficiency: 76 },
    { id: '9HPS18', name: 'Sana', rollNo: '9HPS18', class: '9th', baseEfficiency: 88 },
    { id: '9HPS19', name: 'Yaseen', rollNo: '9HPS19', class: '9th', baseEfficiency: 79 }
  ],
  '10th': [
    { id: '10HPS17', name: 'Pushpa', rollNo: '10HPS17', class: '10th', baseEfficiency: 93 },
    { id: '10HPS18', name: 'Arya', rollNo: '10HPS18', class: '10th', baseEfficiency: 87 },
    { id: '10HPS19', name: 'Bunny', rollNo: '10HPS19', class: '10th', baseEfficiency: 71 }
  ],
  '11th': [
    { id: '11HPS17', name: 'Virat', rollNo: '11HPS17', class: '11th', baseEfficiency: 95 },
    { id: '11HPS18', name: 'Rohit', rollNo: '11HPS18', class: '11th', baseEfficiency: 92 },
    { id: '11HPS19', name: 'Dhoni', rollNo: '11HPS19', class: '11th', baseEfficiency: 98 }
  ],
  '12th': [
    { id: '12HPS17', name: 'Udham', rollNo: '12HPS17', class: '12th', baseEfficiency: 86 },
    { id: '12HPS18', name: 'Mamatha', rollNo: '12HPS18', class: '12th', baseEfficiency: 90 },
    { id: '12HPS19', name: 'Vikram', rollNo: '12HPS19', class: '12th', baseEfficiency: 83 }
  ]
};

// Generate unique data based on student ID
const generateStudentData = (studentId, timeFilter = '1M') => {
  if (!studentId) return null;
  
  // Use student ID to generate consistent but unique data
  const seed = studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomFactor = (seed % 20) / 100; // 0-0.2 variation
  
  // Generate date ranges based on filter
  const getDates = () => {
    const today = new Date();
    const dates = [];
    let days = 30; // default 1M
    
    switch(timeFilter) {
      case '1D': days = 1; break;
      case '5D': days = 5; break;
      case '10D': days = 10; break;
      case '15D': days = 15; break;
      case '1M': days = 30; break;
      case 'Max': days = 90; break;
    }
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
  };
  
  const dates = getDates();
  
  // Generate homework/classwork data with student-specific patterns
  const generateScores = (base, isHomework) => {
    return dates.map((date, index) => {
      const trend = index / dates.length; // 0 to 1 progress
      const improvement = isHomework ? trend * 20 : trend * 15;
      const variance = Math.sin(index * randomFactor) * 10;
      const score = Math.max(10, Math.min(100, base + improvement + variance));
      return Math.round(score);
    });
  };
  
  const baseHomework = 50 + (seed % 30);
  const baseClasswork = 40 + (seed % 25);
  
  const homeworkScores = generateScores(baseHomework, true);
  const classworkScores = generateScores(baseClasswork, false);
  
  return {
    dateWiseComparison: dates.map((date, i) => ({
      date,
      homework: homeworkScores[i],
      classwork: classworkScores[i]
    })),
    
    topicPerformance: [
      { topic: 'Calculus - Integration', homework: 75 + (seed % 25), classwork: 60 + (seed % 30) },
      { topic: 'Algebra - Linear Equations', homework: 80 + (seed % 20), classwork: 70 + (seed % 25) },
      { topic: 'Statistics', homework: 78 + (seed % 22), classwork: 65 + (seed % 30) },
      { topic: 'Algebra - Rational Functions', homework: 72 + (seed % 28), classwork: 62 + (seed % 28) },
      { topic: 'Probability', homework: 68 + (seed % 32), classwork: 55 + (seed % 35) },
      { topic: 'Trigonometry', homework: 85 + (seed % 15), classwork: 75 + (seed % 20) },
      { topic: 'Quadratic Applications', homework: 70 + (seed % 30), classwork: 60 + (seed % 30) },
      { topic: 'Calculus - Derivatives', homework: 65 + (seed % 35), classwork: 58 + (seed % 32) },
      { topic: 'Functions and Graphs', homework: 60 + (seed % 40), classwork: 50 + (seed % 40) },
      { topic: 'Coordinate Geometry', homework: 82 + (seed % 18), classwork: 72 + (seed % 25) }
    ].map(item => ({
      ...item,
      homework: Math.min(100, Math.round(item.homework)),
      classwork: Math.min(100, Math.round(item.classwork))
    })),
    
    answerCategories: [
      { name: 'Correct', value: 35 + (seed % 20), color: '#22c55e' },
      { name: 'Partially-Correct', value: 10 + (seed % 10), color: '#f59e0b' },
      { name: 'Numerical Error', value: 15 + (seed % 10), color: '#ef4444' },
      { name: 'Irrelevant', value: 20 + (seed % 15), color: '#8b5cf6' },
      { name: 'Unattempted', value: 20 - (seed % 15), color: '#6b7280' }
    ].map(item => ({
      ...item,
      value: Math.max(5, item.value),
      count: Math.round(item.value * 0.3)
    })),
    
    mistakeAnalysis: generateMistakeAnalysisData(studentId, dates.length),
    
    priorityChapters: [
      { 
        chapter: 'Calculus - Integration', 
        performance: `${Math.round(20 + (seed % 30))}%`, 
        weightage: '15%', 
        priority: 'High',
        priorityColor: '#fee2e2'
      },
      { 
        chapter: 'Quadratic Applications', 
        performance: `${Math.round(35 + (seed % 25))}%`, 
        weightage: '12%', 
        priority: 'Medium',
        priorityColor: '#fef3c7'
      },
      { 
        chapter: 'Trigonometry', 
        performance: `${Math.round(70 + (seed % 20))}%`, 
        weightage: '10%', 
        priority: 'Maintain',
        priorityColor: '#d1fae5'
      }
    ],
    
    summaryStats: {
      overallPerformance: Math.round(((baseHomework + baseClasswork) / 2) + (dates.length / 10)),
      homeworkAverage: Math.round(homeworkScores.reduce((a, b) => a + b) / homeworkScores.length),
      classworkAverage: Math.round(classworkScores.reduce((a, b) => a + b) / classworkScores.length),
      improvementRate: Math.round(10 + (seed % 15)),
      totalAssessments: dates.length,
      chaptersAnalyzed: 10,
      questionsAttempted: dates.length * 5,
      overallAccuracy: Math.round(40 + (seed % 30))
    }
  };
};

// Generate mistake analysis data specific to each student
const generateMistakeAnalysisData = (studentId, dateCount) => {
  const seed = studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const chapters = [
    'Quadratic Applications', 'Algebra - Linear Equations', 'Trigonometry', 
    'Calculus - Integration', 'Coordinate Geometry', 'Statistics', 'Probability'
  ];
  
  const statuses = ['IRRELEVANT', 'NO ATTEMPT', 'NUMERICAL ERROR', 'CONCEPTUAL ERROR', 'VALUE ERROR', 'CORRECT', 'PARTIAL'];
  const mistakes = ['Irrelevant formula application', 'Fig = 5', '5y = 6', 'Area = ½ × base × height', 'cos(60°) = 0.5', 'Calculation error', 'Minor oversight'];
  
  const questions = [];
  for (let i = 0; i < Math.min(dateCount * 2, 20); i++) {
    const chapterIndex = (seed + i) % chapters.length;
    const performance = Math.max(0, Math.min(100, 30 + (seed % 50) + i * 2));
    const statusIndex = Math.floor((performance / 100) * statuses.length);
    
    questions.push({
      id: `Q${i + 1}`,
      chapter: chapters[chapterIndex],
      date: new Date(Date.now() - (dateCount - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      question: `Find the ${['shortest distance', 'vertex of parabola', 'system solution', 'equation of line', 'trigonometric value'][i % 5]}...`,
      myScore: `${Math.round(performance / 5)}/20`,
      performance: `${performance.toFixed(1)}%`,
      mistakeTracker: 'First submission, no prior mistakes',
      currentStatus: statuses[Math.min(statusIndex, statuses.length - 1)],
      studentMistake: mistakes[i % mistakes.length],
      correctApproach: 'Minimize the distance function using calculus'
    });
  }
  
  return questions;
};

const StudentAnalysis = ({ 
  selectedClass, 
  selectedStudent, 
  onStudentSelect, 
  classesData, 
  onClassChange,
  isStudentView = false,
  readOnly = false  // Add readOnly prop
}) => {
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
  
  // Time filter state
  const [timeFilter, setTimeFilter] = useState('1M');
  
  // Current student data
  const [currentStudentData, setCurrentStudentData] = useState(null);

  // Function to get students for selected class
  const getStudentsForClass = () => {
    const className = selectedClass?.name || 'Class 6th';
    const classGrade = className.replace('Class ', '').trim();
    return STUDENTS_BY_CLASS[classGrade] || STUDENTS_BY_CLASS['6th'];
  };
  
  // Disable class/student changes if in student view or readOnly
  const handleClassChange = (classId) => {
    if (!isStudentView && !readOnly && onClassChange) {
      onClassChange(classId);
    }
  };

  const handleStudentSelect = (student) => {
    if (!isStudentView && !readOnly && onStudentSelect) {
      onStudentSelect(student);
    }
  };

  // Update data when student or time filter changes
  useEffect(() => {
    if (selectedStudent) {
      const studentId = selectedStudent.rollNo || selectedStudent.id || '6HPS17';
      const data = generateStudentData(studentId, timeFilter);
      setCurrentStudentData(data);
    }
  }, [selectedStudent, timeFilter]);

  // Auto-select first student if none selected
  useEffect(() => {
    const students = getStudentsForClass();
    if (!selectedStudent && students.length > 0 && onStudentSelect) {
      onStudentSelect(students[0]);
    }
  }, [selectedClass, selectedStudent, onStudentSelect]);

  // Get filtered chart data based on view
  const getFilteredDateData = () => {
    if (!currentStudentData) return [];
    const data = currentStudentData.dateWiseComparison;
    
    if (scoreDateView === 'homework') {
      return data.map(item => ({ date: item.date, homework: item.homework }));
    } else if (scoreDateView === 'classwork') {
      return data.map(item => ({ date: item.date, classwork: item.classwork }));
    }
    return data;
  };
  
  const getFilteredChapterData = () => {
    if (!currentStudentData) return [];
    const data = currentStudentData.topicPerformance;
    
    if (chapterView === 'homework') {
      return data.map(item => ({ topic: item.topic, homework: item.homework }));
    } else if (chapterView === 'classwork') {
      return data.map(item => ({ topic: item.topic, classwork: item.classwork }));
    }
    return data;
  };

  // Enhanced Score Date-wise Progression with chart controls
  const renderScoreDatewiseProgression = () => {
    const chartData = getFilteredDateData();
    const stats = currentStudentData?.summaryStats || {};
    
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
                  angle={timeFilter === 'Max' ? -45 : 0}
                  textAnchor={timeFilter === 'Max' ? "end" : "middle"}
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
              {['1D', '5D', '10D', '15D', '1M', 'Max'].map((range) => (
                <button 
                  key={range}
                  className={`time-btn ${timeFilter === range ? 'active' : ''}`}
                  onClick={() => setTimeFilter(range)}
                >
                  {range}
                </button>
              ))}
            </div>
            
            <div className="view-toggle-controls">
              <div className="control-label">📊 View Options:</div>
              <button 
                className={`view-btn ${scoreDateView === 'combined' ? 'active' : ''}`}
                onClick={() => setScoreDateView('combined')}
              >
                📊 Combined View
              </button>
              <button 
                className={`view-btn ${scoreDateView === 'homework' ? 'active' : ''}`}
                onClick={() => setScoreDateView('homework')}
              >
                📚 Homework Only
              </button>
              <button 
                className={`view-btn ${scoreDateView === 'classwork' ? 'active' : ''}`}
                onClick={() => setScoreDateView('classwork')}
              >
                ✏ Classwork Only
              </button>
            </div>

            <div className="performance-indicator">
              <div className="indicator-item">
                <span className="indicator-label">Improvement Trend:</span>
                <span className="indicator-value positive">{stats.improvementRate || 15}% per assignment</span>
              </div>
              <div className="ranking-badge">
                <div className="badge-content">
                  <span className="badge-icon">🏆</span>
                  <div className="badge-text">
                    <div className="badge-title">YOU ARE AMONG TOP 20% STUDENTS</div>
                    <div className="badge-stats">
                      <span>Your Score: {stats.homeworkAverage || 66}%</span>
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
              {['1D', '5D', '10D', '15D', '1M', 'Max'].map((range) => (
                <button 
                  key={range}
                  className={`time-btn ${timeFilter === range ? 'active' : ''}`}
                  onClick={() => setTimeFilter(range)}
                >
                  {range}
                </button>
              ))}
            </div>
            
            <div className="view-toggle-controls">
              <div className="control-label">📊 View Options:</div>
              <button 
                className={`view-btn ${chapterView === 'combined' ? 'active' : ''}`}
                onClick={() => setChapterView('combined')}
              >
                📊 Combined View
              </button>
              <button 
                className={`view-btn ${chapterView === 'homework' ? 'active' : ''}`}
                onClick={() => setChapterView('homework')}
              >
                📚 Homework Only
              </button>
              <button 
                className={`view-btn ${chapterView === 'classwork' ? 'active' : ''}`}
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
    if (!currentStudentData) return null;
    
    const filteredQuestions = currentStudentData.mistakeAnalysis.filter(question => {
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
                    data={currentStudentData.answerCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={160}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {currentStudentData.answerCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name]}
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
                <div className="total-number">{currentStudentData.summaryStats.questionsAttempted}</div>
                <div className="total-description">Questions</div>
              </div>
            </div>
            
            <div className="categories-legend">
              {currentStudentData.answerCategories.map((category, index) => (
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
            {currentStudentData.priorityChapters.map((chapter, index) => (
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
                {[...new Set(currentStudentData.mistakeAnalysis.map(q => q.chapter))].map(chapter => (
                  <option key={chapter} value={chapter}>{chapter}</option>
                ))}
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
              <div className="metric-value">{currentStudentData.summaryStats.homeworkAverage}%</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Room for Improvement</div>
              <div className="metric-value">{100 - currentStudentData.summaryStats.homeworkAverage}%</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Chapters Covered</div>
              <div className="metric-value">{currentStudentData.summaryStats.chaptersAnalyzed} Chapters</div>
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
                    <td className={`status-cell status-${question.currentStatus.toLowerCase().replace(/\s+/g, '-')}`}>
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
    if (!currentStudentData) return null;
    
    const getSummaryData = () => {
      const stats = currentStudentData.summaryStats;
      const performanceGap = stats.homeworkAverage - stats.classworkAverage;
      
      const baseData = {
        overallPerformance: stats.overallPerformance,
        homeworkAverage: stats.homeworkAverage,
        classworkAverage: stats.classworkAverage,
        performanceGap: performanceGap,
        improvementRate: stats.improvementRate,
        totalAssessments: stats.totalAssessments,
        chaptersAnalyzed: stats.chaptersAnalyzed,
        questionsAttempted: stats.questionsAttempted,
        overallAccuracy: stats.overallAccuracy
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
            insight: performanceGap > 0 ? 
              'Strong homework performance indicates good understanding' : 
              'Focus on homework completion to improve understanding'
          };
      }
    };

    const summaryData = getSummaryData();

    return (
      <div className="enhanced-summary-container">
        {/* Compact Header */}
        <div className="compact-header">
          <h2 className="summary-title">📋 Student Performance Summary</h2>
        </div>

        {/* Compact Filters */}
        <div className="compact-filters">
          <span className="filter-label">📊 View:</span>
          <div className="filter-buttons-compact">
            <button 
              className={`filter-btn-compact ${summaryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSummaryFilter('all')}
            >
              📈 All Data
            </button>
            <button 
              className={`filter-btn-compact ${summaryFilter === 'homework' ? 'active' : ''}`}
              onClick={() => setSummaryFilter('homework')}
            >
              📚 Homework
            </button>
            <button 
              className={`filter-btn-compact ${summaryFilter === 'classwork' ? 'active' : ''}`}
              onClick={() => setSummaryFilter('classwork')}
            >
              ✏ Classwork
            </button>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="statistics-summary-compact">
          <h3 className="stats-title-compact">📈 Performance Statistics</h3>
          <div className="stats-grid-compact">
            <div className="stat-card-compact">
              <div className="stat-number-compact">{summaryData.totalAssessments}</div>
              <div className="stat-label-compact">Assessments</div>
            </div>
            <div className="stat-card-compact">
              <div className="stat-number-compact">{summaryData.chaptersAnalyzed}</div>
              <div className="stat-label-compact">Chapters</div>
            </div>
            <div className="stat-card-compact">
              <div className="stat-number-compact">{summaryData.questionsAttempted}</div>
              <div className="stat-label-compact">Questions</div>
            </div>
            <div className="stat-card-compact">
              <div className="stat-number-compact">{summaryData.overallAccuracy}%</div>
              <div className="stat-label-compact">Accuracy</div>
            </div>
          </div>
        </div>

        <div className="summary-grid-compact">
          {/* Overall Performance Overview */}
          <div className="performance-overview-compact">
            <div className="card-header-compact">
              <span className="card-icon-compact">🎯</span>
              <span className="card-title-compact">{summaryData.focus}</span>
            </div>
            
            <div className="main-metric-compact">{summaryData.mainMetric}%</div>
            <div className="metric-insight-compact">{summaryData.insight}</div>
            
            <div className="metrics-grid-compact">
              <div className="metric-item-compact">
                <span className="metric-label-compact">Homework Avg:</span>
                <span className="metric-value-compact">{summaryData.homeworkAverage}%</span>
              </div>
              <div className="metric-item-compact">
                <span className="metric-label-compact">Classwork Avg:</span>
                <span className="metric-value-compact">{summaryData.classworkAverage}%</span>
              </div>
              <div className="metric-item-compact">
                <span className="metric-label-compact">Performance Gap:</span>
                <span className={`metric-value-compact ${summaryData.performanceGap > 0 ? 'positive' : 'negative'}`}>
                  {summaryData.performanceGap > 0 ? '+' : ''}{summaryData.performanceGap.toFixed(1)}%
                </span>
              </div>
              <div className="metric-item-compact">
                <span className="metric-label-compact">Improvement Rate:</span>
                <span className="metric-value-compact positive">+{summaryData.improvementRate}%</span>
              </div>
            </div>
          </div>

          {/* Priority Chapters */}
          <div className="priority-chapters-compact">
            <div className="card-header-compact">
              <span className="card-icon-compact">🎯</span>
              <span className="card-title-compact">Priority Chapters (NCERT Weightage)</span>
            </div>
            
            <div className="priority-list-compact">
              {currentStudentData.priorityChapters.map((chapter, index) => (
                <div 
                  key={index} 
                  className="priority-item-compact"
                  style={{ backgroundColor: chapter.priorityColor }}
                >
                  <div className="priority-badge-compact">
                    {chapter.priority === 'High' && '🔥'}
                    {chapter.priority === 'Medium' && '⚠'}
                    {chapter.priority === 'Maintain' && '✅'}
                    <span className="priority-text-compact">{chapter.priority} Priority</span>
                  </div>
                  <div className="priority-info-compact">
                    <div className="chapter-name-compact">{chapter.chapter}</div>
                    <div className="chapter-stats-compact">
                      {chapter.performance} performance • {chapter.weightage} weightage
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="recommendations-compact">
          <div className="card-header-compact">
            <span className="card-icon-compact">💡</span>
            <span className="card-title-compact">Recommendations</span>
          </div>
          
          <div className="recommendations-grid-compact">
            {summaryData.performanceGap < -10 && (
              <div className="recommendation-item-compact">
                <span className="rec-icon-compact">🎯</span>
                <span className="rec-text-compact">Focus on time management skills for classwork</span>
              </div>
            )}
            {summaryData.overallAccuracy < 50 && (
              <div className="recommendation-item-compact">
                <span className="rec-icon-compact">📖</span>
                <span className="rec-text-compact">Review fundamental concepts thoroughly</span>
              </div>
            )}
            {summaryData.improvementRate < 10 && (
              <div className="recommendation-item-compact">
                <span className="rec-icon-compact">⏱</span>
                <span className="rec-text-compact">Practice more timed exercises</span>
              </div>
            )}
            <div className="recommendation-item-compact">
              <span className="rec-icon-compact">✅</span>
              <span className="rec-text-compact">Continue regular practice to maintain momentum</span>
            </div>
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
            { key: 'score-progression', icon: '📈', label: 'Score- Date-wise progression' },
            { key: 'chapter-analysis', icon: '📚', label: 'Chapter Analysis' },
            { key: 'mistakes', icon: '🔍', label: 'Mistake-Progress-Analysis' },
            { key: 'summary', icon: '📋', label: 'Summary' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStudentAnalysisMainTab(tab.key)}
              className={`main-tab-button ${tab.key} ${studentAnalysisMainTab === tab.key ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className={`content-area ${isTransitioning ? 'loading' : ''}`}>
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
              <h2 className="header-title">
                {isStudentView ? 'My Analysis Dashboard' : 'Student Analysis Dashboard'}
              </h2>
              <p className="header-subtitle">
                {selectedStudent ? 
                  (isStudentView 
                    ? `Analyzing performance for ${selectedStudent.name} (${selectedStudent.rollNo})`
                    : `Analyzing performance for ${selectedStudent.name} (${selectedStudent.rollNo})`) 
                  : 'Select a student to view detailed analysis'
                }
              </p>
            </div>
          </div>
          
          {/* Completely hide dropdowns for students */}
          {!isStudentView && !readOnly && (
            <>
              <div className="header-controls">
                <label className="control-label">Select Class</label>
                <select 
                  className="class-dropdown"
                  value={selectedClass?.id || ''}
                  onChange={(e) => handleClassChange(parseInt(e.target.value))}
                >
                  <option value="">-- Select Class --</option>
                  {Object.values(classesData).map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="header-controls">
                <label className="control-label">Select Student</label>
                <select 
                  className="student-dropdown"
                  value={selectedStudent?.id || ''}
                  onChange={(e) => {
                    const student = getStudentsForClass().find(s => s.id === e.target.value);
                    if (student) handleStudentSelect(student);
                  }}
                  disabled={!selectedClass}
                >
                  <option value="">-- Select Student --</option>
                  {getStudentsForClass().map(student => (
                    <option key={student.id} value={student.id}>
                      {student.rollNo} - {student.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* For student view, show disabled dropdowns with their info */}
          {isStudentView && (
            <div className="student-view-info">
              <div className="header-controls disabled">
                <label className="control-label">Select Class</label>
                <select 
                  className="class-dropdown"
                  value={selectedClass?.id || ''}
                  disabled={true}
                >
                  <option value={selectedClass?.id}>
                    {selectedClass?.name}
                  </option>
                </select>
              </div>
              
              <div className="header-controls disabled">
                <label className="control-label">Select Student</label>
                <select 
                  className="student-dropdown"
                  value={selectedStudent?.id || ''}
                  disabled={true}
                >
                  <option value={selectedStudent?.id}>
                    {selectedStudent?.rollNo} - {selectedStudent?.name}
                  </option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rest of the component remains the same */}
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