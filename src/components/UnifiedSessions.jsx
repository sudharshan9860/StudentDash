import React, { useState, useEffect } from 'react';
import { Container, Nav, Badge, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser,
  faSchool,
  faHome,
  faChevronRight,
  faCheckCircle,
  faTimesCircle,
  faExclamationCircle,
  faCode,
  faCalculator,
  faSquareRootAlt,
  faBook,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../api/axiosInstance';
import SessionDetails from './SessionDetails';
import './UnifiedSessions.css';
import HomeworkDetailsModal from './HomeworkDetailsModal';
import ClassworkDetailsModal from './ClassworkDetailsModal ';

const UnifiedSessions = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('self');
  
  // Dark mode detection
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  
  // Data state
  const [recentSessions, setRecentSessions] = useState([]);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState([]);
  const [classworkSubmissions, setClassworkSubmissions] = useState([]);

  // Loading/error state
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingHomework, setLoadingHomework] = useState(false);
  const [loadingClasswork, setLoadingClasswork] = useState(false);
  const [error, setError] = useState(null);

  // Selection state for self sessions
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  
  // Selection state for homework
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  
  // Selection state for classwork
  const [selectedClasswork, setSelectedClasswork] = useState(null);
  const [showClassworkModal, setShowClassworkModal] = useState(false);

  const navigate = useNavigate();

  // Detect dark mode changes
  useEffect(() => {
    setIsDarkMode(document.body.classList.contains('dark-mode'));
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const darkModeActive = document.body.classList.contains('dark-mode');
          setIsDarkMode(darkModeActive);
        }
      });
    });
    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Fetch based on active tab
  useEffect(() => {
    if (activeTab === 'self') {
      fetchRecentSessions();
    } else if (activeTab === 'classwork') {
      fetchClassworkSubmissions();
    } else {
      fetchHomeworkSubmissions();
    }
  }, [activeTab]);

  // Fetch recent sessions (self)
  const fetchRecentSessions = async () => {
    try {
      setLoadingSessions(true);
      setError(null);
      const response = await axiosInstance.get('/sessiondata/');
      
      if (response.data && response.data.status === 'success' && Array.isArray(response.data.sessions)) {
        const allGapData = response.data.sessions.flatMap(session => {
          try {
            const parsed = typeof session.session_data === 'string' ? JSON.parse(session.session_data) : session.session_data;
            return parsed?.gap_analysis_data || [];
          } catch (e) {
            console.warn("Failed to parse session data:", session.session_data);
            return [];
          }
        });
        setRecentSessions(allGapData);
      } else {
        setRecentSessions([]);
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
      setError('Failed to fetch session data');
    } finally {
      setLoadingSessions(false);
    }
  };

  // Fetch classwork submissions
  const fetchClassworkSubmissions = async () => {
    try {
      setLoadingClasswork(true);
      setError(null);
      const response = await axiosInstance.get('/student-classwork-submissions/');
      const submissionsArray = Array.isArray(response.data) ? response.data : [];

      const processed = submissionsArray.map((item, idx) => ({
        submission_id: item.classwork_code || `CW-${idx + 1}`,
        submission_date: item.submission_date,
        submitted_file: item.submitted_file,
        worksheet_id: item.classwork_code,
        classwork_code: item.classwork_code,
        total_score: item.score ?? 0,
        score: item.score ?? 0,
        max_total_score: item.max_possible_score ?? 0,
        max_possible_score: item.max_possible_score ?? 0,
        overall_percentage: item.percentage ?? 0,
        percentage: item.percentage ?? 0,
        grade: item.grade ?? 'N/A',
        questions: item.questions || [],
        homework_type: 'classwork',
        raw: item
      }));

      setClassworkSubmissions(processed);
    } catch (error) {
      console.error("Error fetching classwork submissions:", error);
      setError('Failed to fetch classwork submissions');
    } finally {
      setLoadingClasswork(false);
    }
  };

  // Fetch homework submissions
  const fetchHomeworkSubmissions = async () => {
    try {
      setLoadingHomework(true);
      setError(null);
      const response = await axiosInstance.get('/homework-submission/');
      if (!response.data) {
        setHomeworkSubmissions([]);
        return;
      }

      const submissionsArray = Array.isArray(response.data) ? response.data : [];

      const processedSubmissions = submissionsArray.map(item => {
        if (!item.feedback) {
          return {
            submission_id: item.id,
            submission_date: item.submission_date,
            submitted_file: item.submitted_file,
            homework: item.homework,
            result_json: item.result_json,
            worksheet_id: item.homework || `HW-${item.id}`,
            total_score: item.score || 0,
            max_total_score: item.max_possible_score ?? item.max_possible_socre ?? 10,
            overall_percentage: item.score || 0,
            grade: item.score >= 80 ? 'A' : item.score >= 60 ? 'B' : 'C',
            homework_type: 'homework'
          };
        }

        try {
          const parsedFeedback = JSON.parse(item.feedback);
          return {
            ...parsedFeedback,
            submission_id: item.id,
            submission_date: item.submission_date || parsedFeedback.submission_timestamp,
            submitted_file: item.submitted_file,
            homework: item.homework,
            homework_type: item.homework_type || 'homework',
            worksheet_id: parsedFeedback.worksheet_id || item.homework || `HW-${item.id}`,
            total_score: parsedFeedback.total_score ?? item.score ?? 0,
            max_total_score: parsedFeedback.max_total_score ?? item.max_possible_score ?? item.max_possible_socre ?? 10,
            overall_percentage: parsedFeedback.overall_percentage ?? item.score ?? 0,
            grade: parsedFeedback.grade ?? 'N/A'
          };
        } catch (e) {
          console.error("Error parsing feedback for item:", item.id, e);
          return {
            submission_id: item.id,
            submission_date: item.submission_date,
            submitted_file: item.submitted_file,
            homework: item.homework,
            worksheet_id: item.homework || `HW-${item.id}`,
            total_score: item.score || 0,
            max_total_score: item.max_possible_score ?? item.max_possible_socre ?? 10,
            overall_percentage: item.score || 0,
            grade: 'N/A',
            homework_type: 'homework'
          };
        }
      });

      const homeworkItems = processedSubmissions.filter(submission => {
        const worksheetId = (submission.worksheet_id || submission.homework || '').toString().toLowerCase();
        return submission.homework_type === 'homework' ||
               worksheetId.includes('hw') ||
               worksheetId.includes('homework') ||
               worksheetId.includes('hps');
      });

      setHomeworkSubmissions(homeworkItems);
    } catch (error) {
      console.error("Error fetching homework submissions:", error);
      setError('Failed to fetch homework submissions');
    } finally {
      setLoadingHomework(false);
    }
  };

  // Get filtered data based on active tab
  const getFilteredData = () => {
    if (activeTab === 'self') {
      return recentSessions;
    }
    if (activeTab === 'classwork') {
      return classworkSubmissions;
    }
    return homeworkSubmissions;
  };

  // Get count for tab badges
  const getTabCount = (tabType) => {
    if (tabType === 'self') {
      return recentSessions.length;
    }
    if (tabType === 'classwork') {
      return classworkSubmissions.length;
    }
    return homeworkSubmissions.length;
  };

  // Icon/color helpers
  const getSessionIcon = (subject, answeringType) => {
    if (subject && subject.toLowerCase().includes('math')) {
      return faCalculator;
    } else if ((subject && subject.toLowerCase().includes('code')) || (subject && subject.toLowerCase().includes('computer'))) {
      return faCode;
    } else if (answeringType === 'solve') {
      return faSquareRootAlt;
    } else {
      return faBook;
    }
  };

  const getSessionColor = (subject, answeringType) => {
    if (subject && subject.toLowerCase().includes('math')) {
      return '#34A853';
    } else if ((subject && subject.toLowerCase().includes('code')) || (subject && subject.toLowerCase().includes('computer'))) {
      return '#4285F4';
    } else if (subject && subject.toLowerCase().includes('physics')) {
      return '#FBBC05';
    } else if (subject && subject.toLowerCase().includes('chemistry')) {
      return '#EA4335';
    } else if (subject && subject.toLowerCase().includes('biology')) {
      return '#8E44AD';
    } else {
      return '#00C1D4';
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    try {
      const now = new Date();
      const date = new Date(timestamp);
      const diffMs = now - date;
      const diffSec = Math.round(diffMs / 1000);
      const diffMin = Math.round(diffSec / 60);
      const diffHour = Math.round(diffMin / 60);
      const diffDay = Math.round(diffHour / 24);
      if (diffSec < 60) return `${diffSec} sec ago`;
      if (diffMin < 60) return `${diffMin} min ago`;
      if (diffHour < 24) return `${diffHour} hr ago`;
      return `${diffDay} day ago`;
    } catch (e) {
      console.error("Error formatting time:", e);
      return 'recently';
    }
  };

  const getSessionTitle = (session) => {
    if (session.subject) {
      const title = `${session.subject} - ${session.answering_type === 'correct' ? 'Exercise' : 'Solved Examples'}`;
      return title.length > 25 ? title.substring(0, 22) + '...' : title;
    }
    return 'Session';
  };

  // Homework/classwork card helpers
  const getStatusInfo = (submission) => {
    const percentage = submission.overall_percentage || submission.percentage || 0;
    if (percentage >= 80) {
      return { icon: faCheckCircle, color: '#34A853', status: 'Excellent' };
    } else if (percentage >= 60) {
      return { icon: faExclamationCircle, color: '#FBBC05', status: 'Good' };
    } else {
      return { icon: faTimesCircle, color: '#EA4335', status: 'Needs Improvement' };
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Render recent session card (self tab)
  const renderSessionCard = (session, index) => (
    <Col key={index} md={4} sm={6} className="mb-3">
      <Card 
        className={`session-card ${isDarkMode ? 'dark-card' : ''}`} 
        onClick={() => {
          setSelectedSession(session);
          setShowSessionDetails(true);
        }}
        style={{ borderColor: getSessionColor(session.subject, session.answering_type) }}
      >
        <Card.Body className="d-flex align-items-center">
          <div 
            className="session-icon-container"
            style={{ backgroundColor: getSessionColor(session.subject, session.answering_type) }}
          >
            <FontAwesomeIcon 
              icon={getSessionIcon(session.subject, session.answering_type)} 
              className="session-icon" 
            />
          </div>
          <div className="session-info flex-grow-1 ms-3">
            <h5 className="session-title">{getSessionTitle(session)}</h5>
            <div className="d-flex justify-content-between">
              <span className="session-time">{formatTimeAgo(session.date)}</span>
              <span className="session-score">
                Score: <strong>{session.student_score}</strong>
              </span>
            </div>
            {/* <Button
              variant="outline-info"
              size="sm"
              className="mt-2 gap-analysis-btn"
              onClick={e => {
                e.stopPropagation();
                navigate(`/gap-analysis-report`, { state: { session } });
              }}
            >
              Gap Analysis
            </Button> */}
          </div>
          <FontAwesomeIcon icon={faChevronRight} className="session-arrow" />
        </Card.Body>
      </Card>
    </Col>
  );

  // Render homework submission card
  const renderHomeworkCard = (submission, index) => {
    const statusInfo = getStatusInfo(submission);
    const worksheetId = submission.worksheet_id || submission.homework || `HW-${submission.submission_id}`;
    
    return (
      <Col key={index} md={4} sm={6} className="mb-3">
        <Card 
          className={`submission-card ${isDarkMode ? 'dark-card' : ''}`}
          style={{ borderColor: statusInfo.color }}
        >
          <Card.Body>
            <div className="d-flex align-items-start">
              {/* <div className="submission-status-icon me-3">
                <FontAwesomeIcon 
                  icon={statusInfo.icon} 
                  size="2x" 
                  style={{ color: statusInfo.color }}
                />
              </div> */}
              <div className="submission-info flex-grow-1">
                <h5 className="submission-title mb-1">
                  {worksheetId}
                </h5>
                <div className="submission-meta mb-2">
                  <small className="text-muted d-block">
                    {formatDate(submission.submission_date)}
                  </small>
                  {/* <div className="mt-1">
                    <Badge bg={statusInfo.status === 'Excellent' ? 'success' : 
                              statusInfo.status === 'Good' ? 'warning' : 'danger'}>
                      {submission.grade || 'N/A'} - {submission.overall_percentage || 0}%
                    </Badge>
                  </div> */}
                </div>

                <div className="mt-3 d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="view-details-btn"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedHomework(submission);
                      setShowHomeworkModal(true);
                    }}
                  >
                    View Details
                  </Button>
                  {/* <Button
                    variant="outline-info"
                    size="sm"
                    className="gap-analysis-btn"
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/homework-gap-analysis/${worksheetId}`, { state: { submission } });
                    }}
                  >
                    Gap Analysis
                  </Button> */}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  // Render classwork submission card
  const renderClassworkCard = (submission, index) => {
    const statusInfo = getStatusInfo(submission);
    const worksheetId = submission.classwork_code || submission.worksheet_id || `CW-${submission.submission_id}`;
    
    return (
      <Col key={index} md={4} sm={6} className="mb-3">
        <Card 
          className={`submission-card ${isDarkMode ? 'dark-card' : ''}`}
          style={{ borderColor: statusInfo.color }}
        >
          <Card.Body>
            <div className="d-flex align-items-start">
              {/* <div className="submission-status-icon me-3">
                <FontAwesomeIcon 
                  icon={statusInfo.icon} 
                  size="2x" 
                  style={{ color: statusInfo.color }}
                />
              </div> */}
              <div className="submission-info flex-grow-1">
                <h5 className="submission-title mb-1">
                  {worksheetId}
                </h5>
                <div className="submission-meta mb-2">
                  <small className="text-muted d-block">
                    {formatDate(submission.submission_date)}
                  </small>
                  <div className="mt-1">
                    {/* <Badge bg={statusInfo.status === 'Excellent' ? 'success' : 
                              statusInfo.status === 'Good' ? 'warning' : 'danger'}>
                      {submission.grade || 'N/A'} - {submission.percentage || 0}%
                    </Badge> */}
                  </div>
                </div>

                <div className="mt-3 d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="view-details-btn"
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedClasswork(submission);
                      setShowClassworkModal(true);
                    }}
                  >
                    View Details
                  </Button>
                  {/* <Button
                    variant="outline-info"
                    size="sm"
                    className="gap-analysis-btn"
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/classwork-gap-analysis/${worksheetId}`, { state: { submission } });
                    }}
                  >
                    Gap Analysis
                  </Button> */}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  // Grid data + loading
  const filteredData = getFilteredData();
  const isLoading = 
    (activeTab === 'self' && loadingSessions) ||
    (activeTab === 'classwork' && loadingClasswork) ||
    (activeTab === 'homework' && loadingHomework);

  return (
    <Container fluid className="unified-sessions-container">
      <h3 className="section-title">
        <FontAwesomeIcon icon={faClock} className="me-2" />
        Learning Activity
      </h3>

      {/* Tabs */}
      <Nav variant="tabs" className="unified-tabs">
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'self'}
            onClick={() => setActiveTab('self')}
            className={`d-flex align-items-center ${activeTab === 'self' ? 'active' : ''}`}
            data-tab="self"
          >
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Self
            <Badge pill className="ms-2 tab-badge">
              {getTabCount('self')}
            </Badge>
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'classwork'}
            onClick={() => setActiveTab('classwork')}
            className={`d-flex align-items-center ${activeTab === 'classwork' ? 'active' : ''}`}
            data-tab="classwork"
          >
            <FontAwesomeIcon icon={faSchool} className="me-2" />
            Classwork
            <Badge pill className="ms-2 tab-badge">
              {getTabCount('classwork')}
            </Badge>
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'homework'}
            onClick={() => setActiveTab('homework')}
            className={`d-flex align-items-center ${activeTab === 'homework' ? 'active' : ''}`}
            data-tab="homework"
          >
            <FontAwesomeIcon icon={faHome} className="me-2" />
            Homework
            <Badge pill className="ms-2 tab-badge">
              {getTabCount('homework')}
            </Badge>
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Content */}
      <div className="content-container">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-danger">
            {error}
            <div className="mt-2">
              <Button 
                variant="outline-primary"
                size="sm" 
                onClick={() => {
                  if (activeTab === 'self') fetchRecentSessions();
                  else if (activeTab === 'classwork') fetchClassworkSubmissions();
                  else fetchHomeworkSubmissions();
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-4 no-data-message">
            {activeTab === 'self' 
              ? 'You have not attempted any questions in recent sessions.'
              : `No ${activeTab} submissions found.`}
          </div>
        ) : (
          <Row className="content-grid">
            {activeTab === 'self' && 
              filteredData.map((session, index) => renderSessionCard(session, index))
            }
            {activeTab === 'homework' && 
              filteredData.map((submission, index) => renderHomeworkCard(submission, index))
            }
            {activeTab === 'classwork' && 
              filteredData.map((submission, index) => renderClassworkCard(submission, index))
            }
          </Row>
        )}
      </div>

      {/* Session Details Modal (Self tab) */}
      {selectedSession && (
        <SessionDetails
          show={showSessionDetails}
          onHide={() => setShowSessionDetails(false)}
          session={selectedSession}
        />
      )}

      {/* Homework Details Modal */}
      {selectedHomework && (
        <HomeworkDetailsModal
          show={showHomeworkModal}
          onHide={() => setShowHomeworkModal(false)}
          submission={selectedHomework}
        />
      )}

      {/* Classwork Details Modal */}
      {selectedClasswork && (
        <ClassworkDetailsModal
          show={showClassworkModal}
          onHide={() => setShowClassworkModal(false)}
          submission={selectedClasswork}
        />
      )}
    </Container>
  );
};

export default UnifiedSessions;