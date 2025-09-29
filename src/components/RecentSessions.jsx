import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Nav, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCode, 
  faCalculator, 
  faSquareRootAlt, 
  faBook, 
  faClock,
  faChevronRight,
  faHistory
} from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../api/axiosInstance';
import SessionDetails from './SessionDetails';
import './RecentSessions.css';

const RecentSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // Default to show all sessions
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentSessions();
  }, []);

  const fetchRecentSessions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/sessiondata/');
      console.log("All sessions response:", response.data);

      if (response.data && response.data.status === 'success' && Array.isArray(response.data.sessions)) {
        // Flatten all gap_analysis_data from each session into a single array
        const allGapData = response.data.sessions.flatMap(session => {
          try {
            const parsed = typeof session.session_data === 'string' ? JSON.parse(session.session_data) : session.session_data;
            return parsed.gap_analysis_data || [];
          } catch (e) {
            console.warn("Failed to parse session data:", session.session_data);
            return [];
          }
        });

        setSessions(allGapData);
      } else {
        setError('Unexpected response format');
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
      setError('Failed to fetch session data');
    } finally {
      setLoading(false);
    }
  };


  // Get unique subjects from sessions
  const getUniqueSubjects = () => {
    const subjects = new Set(sessions.map(session => session.subject));
    return Array.from(subjects);
  };

  // Filter sessions based on active tab
  const getFilteredSessions = () => {
    if (activeTab === 'all') {
      return sessions;
    }
    return sessions.filter(session => session.subject === activeTab);
  };

  // Get appropriate icon for session type
  const getSessionIcon = (subject, answeringType) => {
    if (subject && subject.toLowerCase().includes('math')) {
      return faCalculator;
    } else if (subject && subject.toLowerCase().includes('code') || subject && subject.toLowerCase().includes('computer')) {
      return faCode;
    } else if (answeringType === 'solve') {
      return faSquareRootAlt;
    } else {
      return faBook;
    }
  };

  // Format time ago
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

  // Format session color based on subject
  const getSessionColor = (subject, answeringType) => {
    if (subject && subject.toLowerCase().includes('math')) {
      return '#34A853';
    } else if (subject && subject.toLowerCase().includes('code') || subject && subject.toLowerCase().includes('computer')) {
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

  // Get session title from data
  const getSessionTitle = (session) => {
    if (session.subject) {
      // Trim to the first 25 characters
      const title = `${session.subject} - ${session.answering_type === 'correct' ? 'Exercise' : 'Solved Examples'}`;
      return title.length > 25 ? title.substring(0, 22) + '...' : title;
    }
    return 'Session';
  };

  // Handle session click to show details
  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  // Handle close of session details modal
  const handleCloseSessionDetails = () => {
    setShowSessionDetails(false);
  };

  // Get session count by subject for tab badges
  const getSessionCountBySubject = (subject) => {
    if (subject === 'all') {
      return sessions.length;
    }
    return sessions.filter(session => session.subject === subject).length;
  };

  // Create tabs for filtering
  const renderTabNav = () => {
    const subjects = getUniqueSubjects();
    
    return (
      <Nav variant="tabs" className="session-tabs mb-5">
        <Nav.Item>
          <Nav.Link 
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className="d-flex align-items-center"
          >
            <FontAwesomeIcon icon={faHistory} className="me-1" />
            All
            <Badge bg="primary" pill className="ms-2">
              {getSessionCountBySubject('all')}
            </Badge>
          </Nav.Link>
        </Nav.Item>
        
        {subjects.map(subject => (
          <Nav.Item key={subject}>
            <Nav.Link 
              active={activeTab === subject}
              onClick={() => setActiveTab(subject)}
              className="d-flex align-items-center"
              style={{ color: getSessionColor(subject, 'exercise') }}
            >
              <FontAwesomeIcon 
                icon={getSessionIcon(subject, 'exercise')} 
                className="me-1" 
              />
              {subject}
              <Badge 
                pill 
                className="ms-2"
                bg="secondary"
              >
                {getSessionCountBySubject(subject)}
              </Badge>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className="recent-sessions-container">
        <h3 className="section-title">
          <FontAwesomeIcon icon={faClock} className="me-2" />
          Recent Sessions
        </h3>
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="recent-sessions-container">
        <h3 className="section-title">
          <FontAwesomeIcon icon={faClock} className="me-2" />
          Recent Sessions
        </h3>
        <div className="text-center py-4 text-danger">
          {error}
          <div className="mt-2">
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={fetchRecentSessions}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get filtered sessions based on active tab
  const filteredSessions = getFilteredSessions();

  return (
    <div className="recent-sessions-container">
      <h3 className="section-title">
        <FontAwesomeIcon icon={faClock} className="me-2" />
        Recent Sessions
      </h3>
      
      {sessions.length === 0 ? (
        <div className="text-center py-4 text-muted">
          You did not attempt any questions in the previous sessions.
        </div>
      ) : (
        <>
          {/* Tabs for filtering */}
          {renderTabNav()}
          
          {filteredSessions.length === 0 ? (
            <div className="text-center py-4 text-muted">
              No sessions found for this filter. Try another category.
            </div>
          ) : (
            // ...existing code...
        <Row className="session-grid">
          {filteredSessions.map((session, index) => (
            <Col key={index} md={4} sm={6} className="mb-3">
              <Card 
                className="session-card" 
                onClick={() => handleSessionClick(session)}
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
                    {/* Gap Analysis Button */}
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="mt-2"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(
                          `/gap-analysis-report`,
                          { state: { session } } // Pass the session data here
                        );
                      }}
                    >
                      Gap Analysis
                    </Button>
                  </div>
                  <FontAwesomeIcon icon={faChevronRight} className="session-arrow" />
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
          )}
        </>
      )}

      {/* Session Details Modal */}
      <SessionDetails
        show={showSessionDetails}
        onHide={handleCloseSessionDetails}
        session={selectedSession}
      />
    </div>
  );
};

export default RecentSessions;