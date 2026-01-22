// ChairmanDashboard.jsx - Main Dashboard Container
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ChairmanDashboard.css';
import axiosInstance from '../../api/axiosInstance';

// Import all sub-components
import ChairmanOverview from './ChairmanOverview';
import ChairmanExamAnalytics from './ChairmanExamAnalytics';
import ChairmanTeacherTracking from './ChairmanTeacherTracking';
import ChairmanStudentSubmissions from './ChairmanStudentSubmissions';
import ChairmanGapAnalysis from './ChairmanGapAnalysis';
import ChairmanLeaderboard from './ChairmanLeaderboard';
import ChairmanGradeWiseTable from './ChairmanGradeWiseTable';
import ChairmanParentCommunication from './ChairmanParentCommunication';
import { useAlert } from '../AlertBox';               
// Mock data for chairman dashboard
const MOCK_CHAIRMAN_DATA = {
  totalTeachers: 45,
  totalStudents: 1250,
  totalClasses: 24,
  totalExams: 156,
  pendingCorrections: 23,
  completedCorrections: 133,
  averageSubmissionRate: 87.5,
  
  teachers: [
    {
      id: 1,
      name: "Mrs. Sharma",
      subject: "Mathematics",
      classes: ["10A", "10B", "9A"],
      answersSubmitted: 145,
      answersPending: 12,
      totalAssignments: 157,
      submissionRate: 92.4,
      averageGradingTime: "2.3 days",
      lastSubmission: "2024-01-15T10:30:00"
    },
    {
      id: 2,
      name: "Mr. Patel",
      subject: "Physics",
      classes: ["12A", "12B", "11A"],
      answersSubmitted: 198,
      answersPending: 8,
      totalAssignments: 206,
      submissionRate: 96.1,
      averageGradingTime: "1.8 days",
      lastSubmission: "2024-01-16T14:20:00"
    },
    {
      id: 3,
      name: "Ms. Gupta",
      subject: "Chemistry",
      classes: ["11B", "11C", "10C"],
      answersSubmitted: 167,
      answersPending: 18,
      totalAssignments: 185,
      submissionRate: 90.3,
      averageGradingTime: "2.7 days",
      lastSubmission: "2024-01-14T09:15:00"
    },
    {
      id: 4,
      name: "Dr. Kumar",
      subject: "Biology",
      classes: ["12C", "11D", "10D"],
      answersSubmitted: 189,
      answersPending: 5,
      totalAssignments: 194,
      submissionRate: 97.4,
      averageGradingTime: "1.5 days",
      lastSubmission: "2024-01-17T11:45:00"
    },
    {
      id: 5,
      name: "Mrs. Reddy",
      subject: "English",
      classes: ["9B", "9C", "8A"],
      answersSubmitted: 134,
      answersPending: 25,
      totalAssignments: 159,
      submissionRate: 84.3,
      averageGradingTime: "3.2 days",
      lastSubmission: "2024-01-13T16:30:00"
    }
  ],

  exams: [
    {
      id: 1,
      name: "Mid-Term Mathematics",
      class: "10A",
      section: "A",
      date: "2024-01-10",
      totalStudents: 42,
      submitted: 42,
      corrected: 42,
      pending: 0,
      averageScore: 76.5,
      highestScore: 98,
      lowestScore: 45,
      teacher: "Mrs. Sharma",
      status: "completed"
    },
    {
      id: 2,
      name: "Physics Unit Test",
      class: "12A",
      section: "A",
      date: "2024-01-12",
      totalStudents: 38,
      submitted: 38,
      corrected: 35,
      pending: 3,
      averageScore: 82.3,
      highestScore: 97,
      lowestScore: 52,
      teacher: "Mr. Patel",
      status: "in_progress"
    },
    {
      id: 3,
      name: "Chemistry Final",
      class: "11B",
      section: "B",
      date: "2024-01-08",
      totalStudents: 40,
      submitted: 40,
      corrected: 40,
      pending: 0,
      averageScore: 71.8,
      highestScore: 94,
      lowestScore: 38,
      teacher: "Ms. Gupta",
      status: "completed"
    }
  ],

  studentSubmissions: [
    {
      studentId: "10A001",
      studentName: "Arjun Sharma",
      class: "10A",
      totalSubmissions: 45,
      onTimeSubmissions: 42,
      lateSubmissions: 3,
      averageScore: 85.6,
      lastSubmission: "2024-01-15T10:30:00",
      status: "excellent"
    },
    {
      studentId: "10A002",
      studentName: "Priya Patel",
      class: "10A",
      totalSubmissions: 43,
      onTimeSubmissions: 38,
      lateSubmissions: 5,
      averageScore: 78.4,
      lastSubmission: "2024-01-16T09:20:00",
      status: "good"
    },
    {
      studentId: "10A003",
      studentName: "Rahul Kumar",
      class: "10A",
      totalSubmissions: 38,
      onTimeSubmissions: 30,
      lateSubmissions: 8,
      averageScore: 65.2,
      lastSubmission: "2024-01-14T15:45:00",
      status: "needs_attention"
    }
  ],

  gapAnalysis: [
    {
      topic: "Calculus - Integration",
      class: "12A",
      studentsWithHighGap: 15,
      studentsWithMediumGap: 18,
      studentsWithLowGap: 8,
      studentsWithNoGap: 5,
      averageGapPercentage: 62.3,
      remedialActions: "Extra classes scheduled for Mondays",
      priority: "high"
    },
    {
      topic: "Organic Chemistry - Reactions",
      class: "11B",
      studentsWithHighGap: 12,
      studentsWithMediumGap: 20,
      studentsWithLowGap: 10,
      studentsWithNoGap: 8,
      averageGapPercentage: 54.7,
      remedialActions: "Practice worksheets distributed",
      priority: "medium"
    },
    {
      topic: "Trigonometry - Applications",
      class: "10A",
      studentsWithHighGap: 8,
      studentsWithMediumGap: 15,
      studentsWithLowGap: 12,
      studentsWithNoGap: 12,
      averageGapPercentage: 45.2,
      remedialActions: "Peer tutoring program initiated",
      priority: "low"
    }
  ],

  leaderboard: {
    classSectionWise: [
      { rank: 1, class: "12A", section: "A", averageScore: 85.6, totalStudents: 38 },
      { rank: 2, class: "11B", section: "B", averageScore: 82.3, totalStudents: 40 },
      { rank: 3, class: "10A", section: "A", averageScore: 79.8, totalStudents: 42 },
      { rank: 4, class: "10B", section: "B", averageScore: 76.5, totalStudents: 41 },
      { rank: 5, class: "9A", section: "A", averageScore: 74.2, totalStudents: 45 }
    ],
    topStudents: [
      { rank: 1, name: "Amit Verma", class: "12A", score: 98.5, subjects: ["Math", "Physics", "Chemistry"] },
      { rank: 2, name: "Sneha Reddy", class: "12A", score: 97.2, subjects: ["Biology", "Chemistry", "English"] },
      { rank: 3, name: "Rohan Singh", class: "11B", score: 95.8, subjects: ["Math", "Physics", "CS"] },
      { rank: 4, name: "Ananya Gupta", class: "11B", score: 94.6, subjects: ["Chemistry", "Biology", "Math"] },
      { rank: 5, name: "Karthik Nair", class: "10A", score: 93.4, subjects: ["Math", "Science", "English"] }
    ]
  },

  gradeWiseData: [
    { grade: "A+", students: 125, percentage: 10, range: "90-100" },
    { grade: "A", students: 250, percentage: 20, range: "80-89" },
    { grade: "B+", students: 312, percentage: 25, range: "70-79" },
    { grade: "B", students: 275, percentage: 22, range: "60-69" },
    { grade: "C", students: 188, percentage: 15, range: "50-59" },
    { grade: "D", students: 75, percentage: 6, range: "40-49" },
    { grade: "F", students: 25, percentage: 2, range: "Below 40" }
  ]
};

const ChairmanDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert, AlertContainer } = useAlert();

  // Get initial tab from URL or default to overview
  const getInitialTab = () => {
    if (location.state?.activeTab) return location.state.activeTab;
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'overview';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [chairmanData, setChairmanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedExam, setSelectedExam] = useState(null);
  const [dateRange, setDateRange] = useState('last_30_days');

  // Fetch chairman data (will use mock data for now)
  useEffect(() => {
    fetchChairmanData();
  }, []);

  // Update active tab when location changes
  useEffect(() => {
    const newTab = getInitialTab();
    setActiveTab(newTab);
  }, [location.state, location.search]);

  const fetchChairmanData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await axiosInstance.get('/chairman-dashboard/');
      // setChairmanData(response.data);
      
      // For now, use mock data
      setTimeout(() => {
        setChairmanData(MOCK_CHAIRMAN_DATA);
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error fetching chairman data:', error);
      showAlert('Using sample data - Backend API not yet configured', 'warning');
      setChairmanData(MOCK_CHAIRMAN_DATA);
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/chairman-dash?tab=${tab}`, { state: { activeTab: tab } });
  };

  const handleClassFilter = (classValue) => {
    setSelectedClass(classValue);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
  };

  const handleRefresh = () => {
    fetchChairmanData();
    showAlert('Data refreshed successfully', 'success');
  };

  // Loading state
  if (loading) {
    return (
      <div className="chairman-dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <h3>Loading Chairman Dashboard...</h3>
          <p>Please wait while we fetch institutional data</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertContainer />
      <div className="chairman-dashboard-container">
        {/* Header */}
        <div className="chairman-header">
          <div className="chairman-header-content">
            <div className="header-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div className="header-text">
              <h1>Chairman Dashboard</h1>
              <p>Comprehensive Institutional Oversight & Analytics</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="filter-btn" onClick={handleRefresh}>
              <span>🔄</span> Refresh
            </button>
            <select 
              className="class-filter" 
              value={selectedClass}
              onChange={(e) => handleClassFilter(e.target.value)}
            >
              <option value="all">All Classes</option>
              <option value="12">Class 12</option>
              <option value="11">Class 11</option>
              <option value="10">Class 10</option>
              <option value="9">Class 9</option>
              <option value="8">Class 8</option>
            </select>
            
            <select 
              className="date-filter"
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
            >
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="current_term">Current Term</option>
              <option value="current_year">Current Year</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="chairman-tabs">
          <button 
            className={`chairman-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <span className="tab-icon">📊</span>
            <span className="tab-label">Overview</span>
          </button>
          
          <button 
            className={`chairman-tab ${activeTab === 'exam-analytics' ? 'active' : ''}`}
            onClick={() => handleTabChange('exam-analytics')}
          >
            <span className="tab-icon">📝</span>
            <span className="tab-label">Exam Analytics</span>
          </button>
          
          <button 
            className={`chairman-tab ${activeTab === 'teacher-tracking' ? 'active' : ''}`}
            onClick={() => handleTabChange('teacher-tracking')}
          >
            <span className="tab-icon">👨‍🏫</span>
            <span className="tab-label">Teacher Answer Sheets</span>
          </button>
          
          <button 
            className={`chairman-tab ${activeTab === 'student-submissions' ? 'active' : ''}`}
            onClick={() => handleTabChange('student-submissions')}
          >
            <span className="tab-icon">📤</span>
            <span className="tab-label">Student Submissions</span>
          </button>
          
          <button 
            className={`chairman-tab ${activeTab === 'gap-analysis' ? 'active' : ''}`}
            onClick={() => handleTabChange('gap-analysis')}
          >
            <span className="tab-icon">📈</span>
            <span className="tab-label">Gap Analysis</span>
          </button>
          
          <button 
            className={`chairman-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('leaderboard')}
          >
            <span className="tab-icon">🏆</span>
            <span className="tab-label">Leaderboard</span>
          </button>
          
          <button 
            className={`chairman-tab ${activeTab === 'grade-table' ? 'active' : ''}`}
            onClick={() => handleTabChange('grade-table')}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-label">Grade-wise Table</span>
          </button>
          
          <button 
            className={`chairman-tab ${activeTab === 'parent-comm' ? 'active' : ''}`}
            onClick={() => handleTabChange('parent-comm')}
          >
            <span className="tab-icon">📧</span>
            <span className="tab-label">Parent Communication</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="chairman-content">
          {activeTab === 'overview' && (
            <ChairmanOverview 
              data={chairmanData}
              onExamSelect={handleExamSelect}
              onTabChange={handleTabChange}
            />
          )}
          
          {activeTab === 'exam-analytics' && (
            <ChairmanExamAnalytics 
              exams={chairmanData.exams}
              selectedClass={selectedClass}
              dateRange={dateRange}
            />
          )}
          
          {activeTab === 'teacher-tracking' && (
            <ChairmanTeacherTracking 
              teachers={chairmanData.teachers}
              selectedClass={selectedClass}
            />
          )}
          
          {activeTab === 'student-submissions' && (
            <ChairmanStudentSubmissions 
              submissions={chairmanData.studentSubmissions}
              selectedClass={selectedClass}
              dateRange={dateRange}
            />
          )}
          
          {activeTab === 'gap-analysis' && (
            <ChairmanGapAnalysis 
              gapData={chairmanData.gapAnalysis}
              selectedClass={selectedClass}
            />
          )}
          
          {activeTab === 'leaderboard' && (
            <ChairmanLeaderboard 
              leaderboardData={chairmanData.leaderboard}
              selectedClass={selectedClass}
            />
          )}
          
          {activeTab === 'grade-table' && (
            <ChairmanGradeWiseTable 
              gradeData={chairmanData.gradeWiseData}
              selectedClass={selectedClass}
            />
          )}
          
          {activeTab === 'parent-comm' && (
            <ChairmanParentCommunication 
              students={chairmanData.studentSubmissions}
              selectedClass={selectedClass}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ChairmanDashboard;