import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faSignOutAlt,
  faChartLine,
  faVolumeUp,
  faVolumeMute,
  faTrophy,
  faUser,
  faGraduationCap,
  faBell,
  faBars,
  faTimes,
  faHome,
  faCommentDots,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import './Layout.css';
import { AuthContext } from './AuthContext';
import NotificationDropdown from './NotificationDropdown';
import SoundConfigModal from './SoundConfigModal';
import { soundManager } from '../utils/SoundManager';
import FeedbackBox from './FeedbackBox';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const { username, logout, role, fullName } = useContext(AuthContext);

  // Sound configuration state
  const [showSoundConfig, setShowSoundConfig] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(soundManager.isSoundEnabled);

  // Mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Feedback modal state
  const [showFeedback, setShowFeedback] = useState(false);

  // Logout animation state
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check if current route is teacher dashboard
  const isTeacherDashboard = currentLocation.pathname === '/teacher-dash';

  // Get current active tab from URL or location state
  const getCurrentTab = () => {
    if (currentLocation.pathname !== '/teacher-dash') return null;
    if (currentLocation.state?.activeTab) return currentLocation.state.activeTab;
    const params = new URLSearchParams(currentLocation.search);
    return params.get('tab') || 'homework';
  };

  // Handle navigation for teachers with tab state
  const handleTeacherNavigation = (link) => {
    if (role === 'teacher' && link.tabName) {
      navigate(`/teacher-dash?tab=${link.tabName}`, { state: { activeTab: link.tabName } });
    } else {
      navigate(link.path);
    }
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    console.log('Logging out...');
    
    // Trigger animation
    setIsLoggingOut(true);
    
    // Wait for animation to complete before actually logging out
    setTimeout(() => {
      logout();
      navigate('/');
    }, 2000); // 2 seconds for animation to complete
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = fullName || username || 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Navigation links based on role
  const studentLinks = [
    { path: '/student-dash', label: 'Dashboard', icon: faHome },
    { path: '/analytics', label: 'Analytics', icon: faChartLine },
    { path: '/chat', label: 'Chat Rooms', icon: faComments },
  ];

  const teacherLinks = [
    { path: '/student-dash', label: 'Dashboard', icon: faHome },
    { path: '/teacher-dash?tab=exercise', label: 'Homework', icon: '📝', tabName: 'exercise' },
    { path: '/teacher-dash?tab=upload-homework', label: 'Upload Homework', icon: '📑', tabName: 'upload-homework' },
    { path: '/teacher-dash?tab=classwork', label: 'Classwork', icon: '✏', tabName: 'classwork' },
    { path: '/teacher-dash?tab=homework', label: 'Worksheets', icon: '📄', tabName: 'homework' },
    { path: '/teacher-dash?tab=exam-correction', label: 'Exam Correction', icon: '📄', tabName: 'exam-correction' },
    { path: '/teacher-dash?tab=class', label: 'Class Analysis', icon: '📊', tabName: 'class' },
    { path: '/teacher-dash?tab=student', label: 'Student Analysis', icon: '👤', tabName: 'student' },
    { path: '/teacher-dash?tab=progress', label: 'Progress', icon: '📈', tabName: 'progress' },
  ];

  // Get the appropriate links based on role
  const navigationLinks = role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <div id="main-content1">
      {/* Mobile menu toggle button */}
      <button
        className="mobile-menu-toggle d-md-none"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
      </button>

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
      />

      {/* Side Navigation */}
      <aside className={`sidebar-navigation ${isSidebarOpen ? 'open' : ''}`}>
        {/* Brand/Logo */}
        <div className="">
          <div className="sidebar-brand">
            <img src="/images/smart.png" alt="Logo" style={{ width: '100%', height: '20vh', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-menu">
          <ul className="sidebar-menu-list">
            <li className="sidebar-menu-item sidebar-notification-wrapper">
              <NotificationDropdown />
            </li>
            {navigationLinks.map((link) => {
              const currentTab = getCurrentTab();
              const isActive = role === 'teacher' && link.tabName
                ? currentTab === link.tabName
                : currentLocation.pathname === link.path;

              return (
                <li key={link.path} className="sidebar-menu-item">
                  <a
                    className={`sidebar-menu-link ${isActive ? 'active' : ''}`}
                    onClick={() => handleTeacherNavigation(link)}
                  >
                    {typeof link.icon === 'string' ? (
                      <span className="sidebar-menu-icon">{link.icon}</span>
                    ) : (
                      <FontAwesomeIcon icon={link.icon} className="sidebar-menu-icon" />
                    )}
                    <span className="sidebar-menu-text">{link.label}</span>
                  </a>
                </li>
              );
            })}

            {/* Feedback menu item */}
            <li className="sidebar-menu-item">
              <div
                className={`sidebar-menu-link ${showFeedback ? 'active' : ''}`}
                onClick={() => setShowFeedback(!showFeedback)}
              >
                <FontAwesomeIcon icon={faCommentDots} className="sidebar-menu-icon" />
                <span className="sidebar-menu-text">Feedback</span>
              </div>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {/* User Info */}
          {role === 'student' && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                {getUserInitials()}
              </div>
              <div className="sidebar-user-details">
                <p className="sidebar-user-name">{fullName || username}</p>
                <p className="sidebar-user-role">{role === 'student' ? 'Student' : 'Teacher'}</p>
              </div>
            </div>
          )}

          {/* Animated Logout Button */}
          <button
            className={`animated-logout-button ${isLoggingOut ? 'logging-out' : ''}`}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <span className="logout-text">
              {isLoggingOut ? 'Logging Out...' : 'Log Out'}
            </span>
            
            <div className="logout-icon-container">
              {/* Person walking */}
              <svg className="logout-person" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
              </svg>
              
              {/* Door */}
              <svg className="logout-door" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" className="door-frame"/>
                <rect x="3" y="3" width="9" height="18" className="door-left"/>
                <rect x="12" y="3" width="9" height="18" className="door-right"/>
                <circle cx="17" cy="12" r="1" className="door-knob"/>
              </svg>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content-area">
        {children}
      </main>

      {/* Sound Configuration Modal */}
      <SoundConfigModal
        show={showSoundConfig}
        onHide={() => setShowSoundConfig(false)}
      />

      {/* Feedback Box */}
      <FeedbackBox
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />
    </div>
  );
};

export default Layout;