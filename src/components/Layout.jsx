///Layout.Jsx
import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  faEdit,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import "./Layout.css";
import { AuthContext } from "./AuthContext";
import NotificationDropdown from "./NotificationDropdown";
import SoundConfigModal from "./SoundConfigModal";
import { soundManager } from "../utils/SoundManager";
import FeedbackBox from "./FeedbackBox";
import TrialModal from "./TrialModal";
import axiosInstance from "../api/axiosInstance";
import { Form } from "react-bootstrap";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const { username, logout, role, fullName } = useContext(AuthContext);
  // const school=localStorage.getItem("school")

  // Sound configuration state
  const [showSoundConfig, setShowSoundConfig] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(
    soundManager.isSoundEnabled,
  );

  // Mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Feedback modal state
  const [showFeedback, setShowFeedback] = useState(false);

  // Trial modal — hide if already dismissed this session
  const trialDismissed =
    sessionStorage.getItem(`trial_dismissed_${username}`) === "true";

  // Fetch fullName from API if not available in context
  const [fetchedFullName, setFetchedFullName] = useState("");
  useEffect(() => {
    if (!fullName && username) {
      axiosInstance
        .get("/api/user-info/", { credentials: "include" })
        .then((res) => {
          const name = res.data.fullname || res.data.full_name || "";
          if (name) {
            setFetchedFullName(name);
            localStorage.setItem("fullName", name);
          }
        })
        .catch(() => {});
    }
  }, [fullName, username]);

  const displayName = fullName || fetchedFullName || username;

  // Edit profile state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [phoneMissing, setPhoneMissing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullname: "",
    phone_number: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Auto-open edit profile if phone number is missing
  useEffect(() => {
    if (role === "student" && username) {
      axiosInstance
        .get("api/auth/edit-profile/")
        .then((res) => {
          const phone = res.data.phone_number || "";
          setProfileData({
            fullname: res.data.fullname || "",
            phone_number: phone,
          });
          if (!phone.trim()) {
            setPhoneMissing(true);
            setShowEditProfile(true);
          }
        })
        .catch(() => {});
    }
  }, [role, username]);

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

  const validatePhone = (phone) => {
    const trimmed = phone.trim();
    if (!trimmed) return "Phone number is required";
    if (!/^\d{10}$/.test(trimmed))
      return "Phone number must be exactly 10 digits";
    return "";
  };

  const updateProfile = async () => {
    const error = validatePhone(profileData.phone_number);
    if (error) {
      setPhoneError(error);
      return;
    }
    try {
      await axiosInstance.post("api/auth/edit-profile/", profileData);
      setPhoneMissing(false);
      setShowEditProfile(false);
      // Update local name
      localStorage.setItem("fullName", profileData.fullname);
      window.location.reload(); // Refresh to show updated name
    } catch (error) {
      console.error("Profile update failed", error);
    }
  };

  // Check if current route is teacher dashboard
  const isTeacherDashboard = currentLocation.pathname === "/teacher-dash";

  // Get current active tab from URL or location state
  const getCurrentTab = () => {
    if (currentLocation.pathname !== "/teacher-dash") return null;
    if (currentLocation.state?.activeTab)
      return currentLocation.state.activeTab;
    const params = new URLSearchParams(currentLocation.search);
    return params.get("tab") || "homework";
  };

  // Handle navigation for teachers with tab state
  const handleNavigation = (link) => {
    if (role === "teacher" && link.tabName) {
      navigate(`/teacher-dash?tab=${link.tabName}`, {
        state: { activeTab: link.tabName },
      });
    } else {
      navigate(link.path);
    }
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    logout();
    navigate("/");
  };

  // Navigation links based on role
  const studentLinks = [
    { path: "/student-dash", label: "Dashboard", icon: faHome },
    { path: "/ai-assistant", label: "AI Assistant", icon: faRobot },
    {
      path: "/jee-dashboard",
      label: "JEE Preparation",
      icon: faGraduationCap,
      isJEE: true,
    }, // ← ADD
    { path: "/quiz-mode", label: "Test Prep", icon: faTrophy },
    // { path: '/exam-mode', label: 'Exam Mode', icon: faGraduationCap },
    { path: "/analytics", label: "Analytics", icon: faChartLine },
    // { path: '/chat', label: 'Chat Rooms', icon: faComments }, // <-- Chat link for students
  ];

  const teacherLinks = [
    { path: "/ai-assistant", label: "AI Assistant", icon: faRobot },
    {
      path: "/teacher-dash?tab=exam-correction",
      label: "Exam Correction",
      icon: "📄",
      tabName: "exam-correction",
    },

    // ...(school!=="HPS"?
    // [
    {
      path: "/teacher-dash?tab=question-paper",
      label: "Question Paper",
      icon: "📋",
      tabName: "question-paper",
    },
    { path: "/student-dash", label: "Dashboard", icon: faHome },
    {
      path: "/teacher-dash?tab=exercise",
      label: "Homework",
      icon: "📝",
      tabName: "exercise",
    },
    {
      path: "/teacher-dash?tab=upload-homework",
      label: "Upload Homework",
      icon: "📑",
      tabName: "upload-homework",
    },
    {
      path: "/teacher-dash?tab=classwork",
      label: "Classwork",
      icon: "✏",
      tabName: "classwork",
    },
    // { path: '/teacher-dash?tab=upload-classwork', label: 'Upload Classwork', icon: '📑', tabName: 'upload-classwork' },
    {
      path: "/teacher-dash?tab=homework",
      label: "Worksheets",
      icon: "📄",
      tabName: "homework",
    },
    {
      path: "/teacher-dash?tab=class",
      label: "Class Analysis",
      icon: "📊",
      tabName: "class",
    },
    {
      path: "/teacher-dash?tab=student",
      label: "Student Analysis",
      icon: "👤",
      tabName: "student",
    },
    {
      path: "/teacher-dash?tab=progress",
      label: "Progress",
      icon: "📈",
      tabName: "progress",
    },
    // ]:[])
    // Teachers may not need chat UI for 'A' option, but you can include if desired:
    // { path: '/chat', label: 'Chat Rooms', icon: faComments },
  ];

  // Get the appropriate links based on role
  const navigationLinks = role === "teacher" ? teacherLinks : studentLinks;

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = displayName || "U";
    const names = name.split(" ");
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
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={toggleSidebar}
      />

      {/* Side Navigation */}
      <aside className={`sidebar-navigation ${isSidebarOpen ? "open" : ""}`}>
        {/* Brand/Logo */}
        <div className="">
          <div className="sidebar-brand">
            <img
              src="/images/Frame 13.png"
              alt="Logo"
              style={{ width: "30vw", height: "20vh", objectFit: "contain" }}
            />
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
              const isActive =
                role === "teacher" && link.tabName
                  ? currentTab === link.tabName
                  : currentLocation.pathname === link.path;

              return (
                <li key={link.path} className="sidebar-menu-item">
                  <a
                    className={`sidebar-menu-link ${isActive ? "active" : ""}`}
                    onClick={() => handleNavigation(link)}
                  >
                    {typeof link.icon === "string" ? (
                      <span className="sidebar-menu-icon">{link.icon}</span>
                    ) : (
                      <FontAwesomeIcon
                        icon={link.icon}
                        className="sidebar-menu-icon"
                      />
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
                className={`sidebar-menu-link ${showFeedback ? "active" : ""}`}
                onClick={() => setShowFeedback(!showFeedback)}
              >
                <FontAwesomeIcon
                  icon={faCommentDots}
                  className="sidebar-menu-icon"
                />
                <span className="sidebar-menu-text">Feedback</span>
              </div>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          {/* User Info */}

          {role === "student" && (
            <div
              className="sidebar-user-info"
              onClick={() => {
                fetchProfile();
                setPhoneError("");
                setShowEditProfile(true);
              }}
              style={{ cursor: "pointer" }}
              title="Edit Profile"
            >
              {/* <div className="sidebar-user-avatar">
                  {getUserInitials()}
                </div> */}
              <div className="sidebar-user-details">
                <p className="sidebar-user-name">{displayName}</p>
                <p className="sidebar-user-role">Student</p>
              </div>
              <FontAwesomeIcon
                icon={faEdit}
                style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}
              />
            </div>
          )}

          {/* Logout Button */}
          <button className="sidebar-logout" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content-area">{children}</main>

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

      {/* Trial Modal — blocks entire app when expired (students only) */}
      {role === "student" && !trialDismissed && <TrialModal />}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div
          className="modal-backdrop-custom"
          onClick={() => {
            if (!phoneMissing) setShowEditProfile(false);
          }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 20, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="edit-profile-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "32px",
              width: "90%",
              maxWidth: "420px",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: phoneMissing ? "16px" : "24px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: " #001b6c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  flexShrink: 0,
                }}
              >
                {getUserInitials()}
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.2rem",
                    color: "#1a1a2e",
                    fontWeight: 700,
                  }}
                >
                  {phoneMissing ? "Complete Your Profile" : "Edit Profile"}
                </h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#888" }}>
                  {phoneMissing
                    ? "One quick step before you start"
                    : "Update your personal details"}
                </p>
              </div>
              {!phoneMissing && (
                <button
                  onClick={() => setShowEditProfile(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.3rem",
                    color: "#aaa",
                    cursor: "pointer",
                    padding: "4px",
                    lineHeight: 1,
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>

            {/* Phone required message */}
            {phoneMissing && (
              <div
                style={{
                  background: "#f0f7ff",
                  border: "1px solid #d0e3ff",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "20px",
                  fontSize: "0.85rem",
                  color: "#1a1a2e",
                  lineHeight: 1.5,
                }}
              >
                Please enter your mobile number to continue learning and get
                updates and support on WhatsApp.
              </div>
            )}

            <Form>
              <Form.Group style={{ marginBottom: "18px" }}>
                <Form.Label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#444",
                    marginBottom: "6px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faUser}
                    style={{ marginRight: "6px", color: "#001b6c" }}
                  />
                  Full Name
                </Form.Label>
                <Form.Control
                  value={profileData.fullname}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullname: e.target.value })
                  }
                  disabled={profileLoading}
                  style={{
                    borderRadius: "10px",
                    border: "1.5px solid #e0e4ec",
                    padding: "10px 14px",
                    fontSize: "0.95rem",
                  }}
                />
              </Form.Group>

              <Form.Group style={{ marginBottom: "24px" }}>
                <Form.Label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#444",
                    marginBottom: "6px",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faBell}
                    style={{ marginRight: "6px", color: "#001b6c" }}
                  />
                  Phone Number{" "}
                  {phoneMissing && <span style={{ color: "#e53e3e" }}>*</span>}
                </Form.Label>
                <Form.Control
                  value={profileData.phone_number}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setProfileData({ ...profileData, phone_number: val });
                    if (phoneError) setPhoneError("");
                  }}
                  disabled={profileLoading}
                  placeholder="Enter your 10-digit mobile number"
                  maxLength={10}
                  style={{
                    borderRadius: "10px",
                    border: phoneError
                      ? "1.5px solid #e53e3e"
                      : "1.5px solid #e0e4ec",
                    padding: "10px 14px",
                    fontSize: "0.95rem",
                  }}
                />
                {phoneError && (
                  <p
                    style={{
                      color: "#e53e3e",
                      fontSize: "0.8rem",
                      margin: "6px 0 0 2px",
                    }}
                  >
                    {phoneError}
                  </p>
                )}
              </Form.Group>

              <div style={{ display: "flex", gap: "10px" }}>
                {!phoneMissing && (
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(false)}
                    style={{
                      flex: 1,
                      padding: "11px 20px",
                      borderRadius: "10px",
                      border: "1.5px solid #e0e4ec",
                      background: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "#555",
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={updateProfile}
                  style={{
                    flex: 1,
                    padding: "11px 20px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#001b6c",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    boxShadow: "0 4px 14px rgba(0, 27, 108, 0.3)",
                  }}
                >
                  Save Changes
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
