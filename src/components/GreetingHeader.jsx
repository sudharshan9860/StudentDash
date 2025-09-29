// GreetingHeader.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import './GreetingHeader.css';

const GreetingHeader = ({ username }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getGreetingEmoji = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀';
    return '🌙';
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Extract class from username (e.g., 10HPS24 -> Class 10)
  const getClassFromUsername = (username) => {
    if (!username) return 'Student';
    const classNumber = username.substring(0, 2);
    return isNaN(classNumber) ? 'Student' : `Class ${classNumber} Student`;
  };

  return (
    <div className="greeting-header">
      <Row className="align-items-center">
        <Col md={8}>
          <div className="greeting-content">
            <div className="greeting-icon">
              🎓 {getGreetingEmoji()}
            </div>
            <div className="greeting-text">
              <h1 className="greeting-title">
                {getGreeting()}, {username}! 🎓
              </h1>
              <p className="greeting-subtitle">
                {getClassFromUsername(username)} • Ready to learn something amazing today? Let's explore together! 🚀
              </p>
            </div>
          </div>
        </Col>
        <Col md={4} className="text-end">
          <div className="time-display">
            <div className="current-time">{formatTime()}</div>
            <div className="current-date">{formatDate()}</div>
          </div>
        </Col>
      </Row>
      
      {/* Motivational buttons */}
      <div className="motivation-badges">
        <span className="motivation-badge keep-going">
          👍 Keep Going!
        </span>
        <span className="motivation-badge awesome">
          ⭐ You're Awesome!
        </span>
      </div>
    </div>
  );
};

export default GreetingHeader;