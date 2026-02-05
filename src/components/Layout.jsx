 ///Layout.Jsx
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
    faComments,
    faEdit
  } from '@fortawesome/free-solid-svg-icons';
  import './Layout.css';
  import { AuthContext } from './AuthContext';
  import NotificationDropdown from './NotificationDropdown';
  import SoundConfigModal from './SoundConfigModal';
  import { soundManager } from '../utils/SoundManager';
  import FeedbackBox from './FeedbackBox';
  import axiosInstance from '../api/axiosInstance';
  import { Form } from 'react-bootstrap';

  const Layout = ({ children }) => {
    const navigate = useNavigate();
    const currentLocation = useLocation();
    const { username, logout, role, fullName } = useContext(AuthContext);
  // const school=localStorage.getItem("school")

    // Sound configuration state
    const [showSoundConfig, setShowSoundConfig] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(soundManager.isSoundEnabled);

    // Mobile sidebar toggle
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Feedback modal state
    const [showFeedback, setShowFeedback] = useState(false);

    // Edit profile state
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [profileData, setProfileData] = useState({
      fullname: "",
      phone_number: "",
    });
    const [profileLoading, setProfileLoading] = useState(false);

    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await axiosInstance.get("api/auth/edit-profile/");
        setProfileData({
          fullname: res.data.fullname || "",
          phone_number: res.data.phone_number || "",
        });
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setProfileLoading(false);
      }
    };

    const updateProfile = async () => {
      try {
        await axiosInstance.post("api/auth/edit-profile/", profileData);
        setShowEditProfile(false);
        // Update local name
        localStorage.setItem("fullName", profileData.fullname);
        window.location.reload(); // Refresh to show updated name
      } catch (error) {
        console.error("Profile update failed", error);
      }
    };

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
    const handleNavigation  = (link) => {
      if (role === 'teacher' && link.tabName) {
        navigate(`/teacher-dash?tab=${link.tabName}`, { state: { activeTab: link.tabName } });
      } else {
        navigate(link.path);
      }
      setIsSidebarOpen(false);
    };

    const handleLogout = () => {
      console.log('Logging out...');
      logout();
      navigate('/');
    };

    // Navigation links based on role
    const studentLinks = [
      { path: '/student-dash', label: 'Dashboard', icon: faHome },
      { path: '/jee-dashboard', label: 'JEE Preparation', icon: faGraduationCap, isJEE: true }, // ← ADD
      { path: '/exam-mode', label: 'Exam Mode', icon: faGraduationCap },
      { path: '/analytics', label: 'Analytics', icon: faChartLine },
      // { path: '/chat', label: 'Chat Rooms', icon: faComments }, // <-- Chat link for students
    ];

  const teacherLinks = [
    { path: '/teacher-dash?tab=exam-correction', label: 'Exam Correction', icon: '📄', tabName: 'exam-correction' },

    // ...(school!=="HPS"?
      // [
        { path: '/teacher-dash?tab=question-paper', label: 'Question Paper', icon: '📋', tabName: 'question-paper' },
    { path: '/student-dash', label: 'Dashboard', icon: faHome },
    { path: '/teacher-dash?tab=exercise', label: 'Homework', icon: '📝', tabName: 'exercise' },
    { path: '/teacher-dash?tab=upload-homework', label: 'Upload Homework', icon: '📑', tabName: 'upload-homework' },
    { path: '/teacher-dash?tab=classwork', label: 'Classwork', icon: '✏', tabName: 'classwork' },
    // { path: '/teacher-dash?tab=upload-classwork', label: 'Upload Classwork', icon: '📑', tabName: 'upload-classwork' },
    { path: '/teacher-dash?tab=homework', label: 'Worksheets', icon: '📄', tabName: 'homework' },
    { path: '/teacher-dash?tab=class', label: 'Class Analysis', icon: '📊', tabName: 'class' },
    { path: '/teacher-dash?tab=student', label: 'Student Analysis', icon: '👤', tabName: 'student' },
    { path: '/teacher-dash?tab=progress', label: 'Progress', icon: '📈', tabName: 'progress' },
  // ]:[])
    // Teachers may not need chat UI for 'A' option, but you can include if desired:
    // { path: '/chat', label: 'Chat Rooms', icon: faComments },
  ];

    // Get the appropriate links based on role
    const navigationLinks = role === 'teacher' ? teacherLinks : studentLinks;

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
              <img src="/images/logo.png" alt="Logo" style={{ width: '15vw', height: '20vh', objectFit: 'cover' }} />
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
                    onClick={() => handleNavigation(link)}
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

              {/* Notifications Dropdown */}

              {/* Sound Toggle as menu item */}
              {/* <li className="sidebar-menu-item">
                <div
                  className="sidebar-menu-link"
                  onClick={() => setShowSoundConfig(true)}
                >
                  <FontAwesomeIcon
                    icon={isSoundEnabled ? faVolumeUp : faVolumeMute}
                    className="sidebar-menu-icon"
                  />
                  <span className="sidebar-menu-text">Sound</span>
                </div>
              </li> */}

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


        { role==='student' && (<div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                {getUserInitials()}
              </div>
              <div className="sidebar-user-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p className="sidebar-user-name" style={{ margin: 0 }}>{fullName || username}</p>
                  <button
                    onClick={() => {
                      fetchProfile();
                      setShowEditProfile(true);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#667eea',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                    title="Edit Profile"
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} style={{ fontSize: '14px' }} />
                  </button>
                </div>
                <p className="sidebar-user-role">{role === 'student' ? 'Student' : 'Teacher'}</p>
              </div>
            </div>)}

            {/* Logout Button */}
            <button
              className="sidebar-logout"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
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

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="modal-backdrop-custom" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}>
            <div className="edit-profile-modal" style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}>
              <h3 style={{ marginBottom: '20px', color: '#333' }}>Edit Profile</h3>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    value={profileData.fullname}
                    onChange={(e) =>
                      setProfileData({ ...profileData, fullname: e.target.value })
                    }
                    disabled={profileLoading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    value={profileData.phone_number}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone_number: e.target.value })
                    }
                    disabled={profileLoading}
                  />
                </Form.Group>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(false)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      background: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={updateProfile}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Save
                  </button>
                </div>
              </Form>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default Layout;
