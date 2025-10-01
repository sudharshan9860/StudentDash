import React, { useContext, useState, useEffect } from 'react';
import { Container, Navbar, Nav, Offcanvas } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, 
  faChartLine, 
  faVolumeUp,
  faVolumeMute,
  faTrophy,
  faUser,
  faSun,
  faMoon,
  faHome,
  faGraduationCap
} from '@fortawesome/free-solid-svg-icons';
import './Layout.css';
import { AuthContext } from './AuthContext';
import NotificationDropdown from './NotificationDropdown';
import SoundConfigModal from './SoundConfigModal';
import { soundManager } from '../utils/SoundManager';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const { username, logout, role } = useContext(AuthContext);
  
  // Sound configuration state
  const [showSoundConfig, setShowSoundConfig] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(soundManager.isSoundEnabled);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // Apply dark mode on component mount and when it changes
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    console.log('Logging out...');
    logout();
    navigate('/');
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  // Updated navigation links with icons
  const navigationLinks = [
    { 
      path: '/student-dash', 
      label: 'Student Dash',
      icon: faHome,
      showFor: ['student', 'teacher']
    },
    { 
      path: '/teacher-dash', 
      label: 'Teacher Dash',
      icon: faGraduationCap,
      showFor: ['teacher']
    },
    { 
      path: '/analytics', 
      label: 'Analytics',
      icon: faChartLine,
      showFor: ['student', 'teacher']
    },
    { 
      path: '/leaderboard', 
      label: 'Leaderboard',
      icon: faTrophy,
      showFor: ['student', 'teacher']
    }
  ];

  // Filter based on role
  const filteredLinks = navigationLinks.filter(link => {
    if (!link.showFor) return true;
    return link.showFor.includes(role);
  });

  return (
    <div id="main-content" className="d-flex flex-column min-vh-100">
      <Navbar 
        expand="lg" 
        className={`custom-navbar ${isDarkMode ? 'navbar-dark' : ''}`}
        style={{
          background: isDarkMode 
            ? 'linear-gradient(to right, #1a1a2e, #16213e)'
            : 'linear-gradient(to right, #00c1d4, #001b6c)',
          transition: 'background 0.3s ease'
        }}
      >
        <Container fluid>
          <Navbar.Brand className="h3 text-white fw-bold">
            📚 Smart Learners
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="offcanvasNavbar" />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
            className={isDarkMode ? 'bg-dark text-white' : ''}
          >
            <Offcanvas.Header closeButton className={isDarkMode ? 'text-white' : ''}>
              <Offcanvas.Title id="offcanvasNavbarLabel">
                Menu
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="ms-auto justify-content-end flex-grow-1 pe-3 align-items-center">
                {/* Navigation Links */}
                {filteredLinks.map((link) => (
                  <Nav.Link
                    key={link.path}
                    className={`custom-nav-link mx-2 d-flex align-items-center ${
                      currentLocation.pathname === link.path ? 'active' : ''
                    }`}
                    onClick={() => navigate(link.path)}
                    style={{
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      background: currentLocation.pathname === link.path 
                        ? 'rgba(255,255,255,0.2)' 
                        : 'transparent'
                    }}
                  >
                    {link.icon && (
                      <FontAwesomeIcon 
                        icon={link.icon} 
                        className="me-2" 
                      />
                    )}
                    {link.label}
                  </Nav.Link>
                ))}
                
                {/* Divider for desktop view */}
                <div className="d-none d-lg-block mx-2" style={{ 
                  width: '1px', 
                  height: '30px', 
                  backgroundColor: 'rgba(255,255,255,0.3)' 
                }}></div>
                
                {/* Sound Toggle */}
                <Nav.Link 
                  className="custom-nav-link mx-2"
                  onClick={() => setShowSoundConfig(true)}
                  title={isSoundEnabled ? 'Sound Settings' : 'Sound Muted'}
                  style={{ color: 'white' }}
                >
                  <FontAwesomeIcon 
                    icon={isSoundEnabled ? faVolumeUp : faVolumeMute} 
                    size="lg"
                  />
                </Nav.Link>

                {/* Notification Bell */}
                <div className="ms-0">
                  <NotificationDropdown />
                </div>
                
                {/* Dark Mode Toggle */}
                <Nav.Link 
                  className="custom-nav-link mx-2"
                  onClick={toggleDarkMode}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  style={{ color: 'white' }}
                >
                  <FontAwesomeIcon 
                    icon={isDarkMode ? faSun : faMoon} 
                    size="lg"
                    style={{
                      transition: 'transform 0.3s ease',
                      transform: isDarkMode ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </Nav.Link>

                {/* Divider for desktop view */}
                <div className="d-none d-lg-block mx-2" style={{ 
                  width: '1px', 
                  height: '30px', 
                  backgroundColor: 'rgba(255,255,255,0.3)' 
                }}></div>
                
                {/* User section */}
                <Nav.Item className="d-flex align-items-center ms-2">
                  <div 
                    className="d-flex align-items-center px-3 py-2 rounded-pill"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={faUser} 
                      className="text-white" 
                    />
                    <span className="ms-2 text-white fw-semibold">
                      {username}
                    </span>
                    <span
                      onClick={handleLogout}  
                      className='ms-3 text-white' 
                      style={{ 
                        cursor: 'pointer',
                        opacity: 0.9,
                        transition: 'opacity 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = '1'}
                      onMouseLeave={(e) => e.target.style.opacity = '0.9'}
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
                      Logout
                    </span>
                  </div>
                </Nav.Item>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>

      <main className={`flex-fill ${isDarkMode ? 'bg-dark-content' : ''}`}>
        <Container>{children}</Container>
      </main>

      <footer className={`footer text-center ${isDarkMode ? 'bg-dark text-white' : ''}`}>
        <p>&copy; AI EDUCATOR</p>
      </footer>

      {/* Sound Configuration Modal */}
      <SoundConfigModal 
        show={showSoundConfig} 
        onHide={() => setShowSoundConfig(false)} 
      />
    </div>
  );
};

export default Layout;