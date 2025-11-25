import React, { useContext, useEffect, useState, useRef } from "react";
import { NotificationContext } from "../contexts/NotificationContext"; // adjust path
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "./ChatRoom.css"; // create minimal styles if you want
import {
  faPaperPlane,
  faShareSquare,
  faCheckCircle,
  faTimesCircle,
  faListAlt,
  faQuestionCircle,
  faSearch,
  faChevronDown,
  faChevronUp,
  faUsers,
  faUserPlus,
  faBookOpen,
  faSun,
  faMoon,
  faFilter,
  faTimes,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarkdownWithMath from "./MarkdownWithMath";
import { Modal, Button, Form, Badge, Tooltip, OverlayTrigger } from "react-bootstrap";

const ChatRoom = () => {
  const {
    groups,
    groupInvitations,
    groupMessages,
    createGroup,
    inviteToGroup,
    respondToGroupInvite,
    sendGroupMessage,
  } = useContext(NotificationContext);

  const { username,fullName } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedGroup, setSelectedGroup] = useState(groups && groups[0] ? groups[0] : null);
  const [messageText, setMessageText] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [inviteInput, setInviteInput] = useState(""); // comma separated usernames
  const messagesEndRef = useRef(null);

  // Question sharing states
  const [lastSession, setLastSession] = useState(null);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionsToShare, setSelectedQuestionsToShare] = useState([]);
  const [showQuestionList, setShowQuestionList] = useState(false);

  // UI/UX enhancement states
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showShareConfirmModal, setShowShareConfirmModal] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    groups: true,
    invites: true,
    questions: false,
    create: true
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load last session from localStorage
  useEffect(() => {
    const loadLastSession = () => {
      try {
        const savedSession = localStorage.getItem(`lastSession_${username}`);
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          // Check if session is recent (within last 7 days)
          const sessionDate = new Date(sessionData.timestamp);
          const daysSinceSession = (new Date() - sessionDate) / (1000 * 60 * 60 * 24);

          if (daysSinceSession <= 7 && sessionData.questionList && sessionData.questionList.length > 0) {
            setLastSession(sessionData);
            setAvailableQuestions(sessionData.questionList);
            console.log("✅ Last session loaded for chat sharing:", sessionData);
          }
        }
      } catch (error) {
        console.error("Error loading last session:", error);
      }
    };

    if (username) {
      loadLastSession();
    }
  }, [username]);

  // Apply dark mode
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    // if groups change and no group selected, select first
    if ((!selectedGroup || !selectedGroup.id) && groups && groups.length > 0) {
      setSelectedGroup(groups[0]);
    }
  }, [groups]); // eslint-disable-line

  useEffect(() => {
    // scroll to bottom when messages change
    scrollToBottom();
  }, [groupMessages, selectedGroup]); // eslint-disable-line

  // Toggle dark mode - dispatches custom event to prevent forced reflow
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('darkModeChange', {
      detail: { isDarkMode: newMode }
    }));
  };

  // Toggle section collapse
  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Filtered questions based on search
  const filteredQuestions = availableQuestions.filter(q =>
    q.question?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    try {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    } catch (_) {}
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      alert("Please enter a group name");
      return;
    }
    setIsLoading(true);
    // parse invite list
    const invitees = inviteInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    createGroup(newGroupName, invitees);
    setNewGroupName("");
    setInviteInput("");
    setShowCreateGroupModal(false);
    setIsLoading(false);
  };

  const handleSendMessage = () => {
    if (!selectedGroup || !messageText.trim()) return;
    sendGroupMessage(selectedGroup.id, messageText.trim());
    setMessageText("");
  };

  const handleAcceptInvite = (group) => {
    respondToGroupInvite(group.id, "accept");
    // UI update will be driven by context (group_joined)
  };

  const handleIgnoreInvite = (group) => {
    respondToGroupInvite(group.id, "ignore");
  };

  const handleInviteMore = (group) => {
    const invitees = prompt("Enter comma-separated usernames to invite:");
    if (!invitees) return;
    const list = invitees.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.length) inviteToGroup(group.id, list);
  };

  // Toggle question selection
  const handleQuestionToggle = (index) => {
    setSelectedQuestionsToShare((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Initiate share questions (show confirmation modal)
  const initiateShareQuestions = () => {
    if (!selectedGroup || selectedQuestionsToShare.length === 0) {
      alert("Please select at least one question to share");
      return;
    }
    setShowShareConfirmModal(true);
  };

  // Share selected questions with the group (after confirmation)
  const handleShareQuestions = () => {
    setIsLoading(true);

    // Get selected question data
    const questionsToShare = selectedQuestionsToShare.map((index) => availableQuestions[index]);

    // Create a message with question data
    const messageData = {
      type: "shared_questions",
      questions: questionsToShare,
      session_metadata: {
        class_id: lastSession.class_id,
        subject_id: lastSession.subject_id,
        subject_name: lastSession.subject_name,
        topic_ids: lastSession.topic_ids,
        chapter_names: lastSession.chapter_names,
        subtopic: lastSession.subtopic,
        worksheet_id: lastSession.worksheet_id,
      },
      shared_by: username,
    };

    // Send as a special message
    sendGroupMessage(selectedGroup.id, JSON.stringify(messageData));

    // Reset selection
    setSelectedQuestionsToShare([]);
    setShowQuestionList(false);
    setShowShareConfirmModal(false);
    setIsLoading(false);
    setSearchQuery(""); // Clear search
  };

  // Handle clicking on a shared question message
  const handleSharedQuestionClick = (messageData) => {
    try {
      const data = typeof messageData === 'string' ? JSON.parse(messageData) : messageData;

      if (data.type === "shared_questions" && data.questions && data.questions.length > 0) {
        // Navigate to SolveQuestion with the first question and the full list
        const firstQuestion = data.questions[0];

        navigate("/solvequestion", {
          state: {
            question: firstQuestion.question,
            question_id: firstQuestion.question_id || firstQuestion.id,
            questionNumber: 1,
            questionList: data.questions,
            class_id: data.session_metadata.class_id,
            subject_id: data.session_metadata.subject_id,
            subject_name: data.session_metadata.subject_name,
            topic_ids: data.session_metadata.topic_ids,
            chapter_names: data.session_metadata.chapter_names,
            subtopic: data.session_metadata.subtopic,
            worksheet_id: data.session_metadata.worksheet_id,
            image: firstQuestion.image,
            context: firstQuestion.context,
            selectedQuestions: data.questions,
            sharedBy: data.shared_by,
          },
        });
      }
    } catch (error) {
      console.error("Error handling shared question:", error);
    }
  };

  const messagesForSelected = selectedGroup ? (groupMessages[selectedGroup.id] || []) : [];

  return (
    <div className={`chatroot ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <div>
            <h3>
              <FontAwesomeIcon icon={faUsers} style={{ marginRight: '10px', color: '#667eea' }} />
              Study Rooms
            </h3>
            <div className="chat-user-small">
              <Badge bg="primary" style={{ fontSize: '11px' }}>
                {fullName}
              </Badge>
            </div>
          </div>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</Tooltip>}
          >
            <button
              className="dark-mode-toggle"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
            </button>
          </OverlayTrigger>
        </div>

        {/* Groups Section - Collapsible */}
        <div className="chat-section">
          <div
            className="section-header-collapsible"
            onClick={() => toggleSection('groups')}
          >
            <h4>
              <FontAwesomeIcon icon={faUsers} className="section-icon" />
              Your Groups
              <Badge bg="info" className="ms-2" style={{ fontSize: '10px' }}>
                {groups?.length || 0}
              </Badge>
            </h4>
            <FontAwesomeIcon
              icon={collapsedSections.groups ? faChevronDown : faChevronUp}
              className="collapse-icon"
            />
          </div>
          {!collapsedSections.groups && (
            <div className="section-content">
              <ul className="group-list">
                {groups && groups.length ? (
                  groups.map((g) => (
                    <li
                      key={g.id}
                      className={`group-item ${selectedGroup && selectedGroup.id === g.id ? "active" : ""}`}
                      onClick={() => setSelectedGroup(g)}
                    >
                      <div className="group-item-content">
                        <FontAwesomeIcon icon={faUsers} className="group-icon" />
                        <div className="group-info">
                          <div className="group-name">{g.name}</div>
                          <div className="group-code">
                            <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '4px', fontSize: '10px' }} />
                            {g.code}
                          </div>
                        </div>
                        {selectedGroup && selectedGroup.id === g.id && (
                          <FontAwesomeIcon icon={faCheckCircle} className="selected-icon" />
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="empty-state">
                    <FontAwesomeIcon icon={faUsers} style={{ fontSize: '32px', color: '#ccc', marginBottom: '8px' }} />
                    <p>No groups yet</p>
                    <small>Create your first group below!</small>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Create Group Section */}
        <div className="chat-section">
          <Button
            variant="primary"
            className="w-100 create-group-btn"
            onClick={() => setShowCreateGroupModal(true)}
          >
            <FontAwesomeIcon icon={faUserPlus} className="me-2" />
            Create New Group
          </Button>
        </div>

        {/* Pending Invites Section - Collapsible */}
        <div className="chat-section">
          <div
            className="section-header-collapsible"
            onClick={() => toggleSection('invites')}
          >
            <h4>
              <FontAwesomeIcon icon={faUserPlus} className="section-icon" />
              Pending Invites
              {groupInvitations && groupInvitations.length > 0 && (
                <Badge bg="warning" className="ms-2" style={{ fontSize: '10px' }}>
                  {groupInvitations.length}
                </Badge>
              )}
            </h4>
            <FontAwesomeIcon
              icon={collapsedSections.invites ? faChevronDown : faChevronUp}
              className="collapse-icon"
            />
          </div>
          {!collapsedSections.invites && (
            <div className="section-content">
              {groupInvitations && groupInvitations.length ? (
                groupInvitations.map((inv, idx) => (
                  <div key={idx} className="invite-item-enhanced">
                    <div className="invite-header">
                      <FontAwesomeIcon icon={faUsers} style={{ color: '#f59e0b' }} />
                      <div className="invite-details">
                        <strong>{inv.group.name}</strong>
                        <small>by {inv.inviter?.fullname || inv.inviter?.username || "Unknown"}</small>
                      </div>
                    </div>
                    <div className="invite-actions">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleAcceptInvite(inv.group)}
                      >
                        <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleIgnoreInvite(inv.group)}
                      >
                        <FontAwesomeIcon icon={faTimes} className="me-1" />
                        Ignore
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FontAwesomeIcon icon={faUserPlus} style={{ fontSize: '32px', color: '#ccc', marginBottom: '8px' }} />
                  <p>No pending invites</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Question Sharing Section - Enhanced */}
        <div className="chat-section">
          <div
            className="section-header-collapsible"
            onClick={() => toggleSection('questions')}
          >
            <h4>
              <FontAwesomeIcon icon={faBookOpen} className="section-icon" />
              Share Questions
              {selectedQuestionsToShare.length > 0 && (
                <Badge bg="success" className="ms-2" style={{ fontSize: '10px' }}>
                  {selectedQuestionsToShare.length} selected
                </Badge>
              )}
            </h4>
            <FontAwesomeIcon
              icon={collapsedSections.questions ? faChevronDown : faChevronUp}
              className="collapse-icon"
            />
          </div>
          {!collapsedSections.questions && (
            <div className="section-content">
              {lastSession && availableQuestions.length > 0 ? (
                <>
                  <div className="session-info-enhanced">
                    <div className="info-row">
                      <FontAwesomeIcon icon={faBookOpen} />
                      <span><strong>Subject:</strong> {lastSession.subject_name || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <FontAwesomeIcon icon={faQuestionCircle} />
                      <span><strong>Total:</strong> {availableQuestions.length} questions</span>
                    </div>
                  </div>

                  {/* Search Bar */}
                  {/* <div className="search-container">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        className="clear-search-btn"
                        onClick={() => setSearchQuery("")}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    )}
                  </div> */}

                  {/* Question List */}
                  <div className="question-list-container-enhanced">
                    {filteredQuestions.length > 0 ? (
                      filteredQuestions.map((q, index) => {
                        const originalIndex = availableQuestions.indexOf(q);
                        return (
                          <div
                            key={originalIndex}
                            className={`question-item-enhanced ${
                              selectedQuestionsToShare.includes(originalIndex) ? 'selected' : ''
                            }`}
                            onClick={() => handleQuestionToggle(originalIndex)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedQuestionsToShare.includes(originalIndex)}
                              onChange={() => handleQuestionToggle(originalIndex)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="question-content">
                              <div className="question-number-badge">Q{originalIndex + 1}</div>
                              <div className="question-preview">
                                <MarkdownWithMath content={q.question?.substring(0, 100) || 'Question'}/>
                                {/* {q.question?.substring(0, 100) || 'Question'} */}
                                {q.question?.length > 100 && '...'}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-state">
                        <FontAwesomeIcon icon={faSearch} style={{ fontSize: '24px', color: '#ccc' }} />
                        <p>No questions match your search</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="question-actions">
                    {selectedQuestionsToShare.length > 0 && (
                      <>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => setSelectedQuestionsToShare([])}
                          className="me-2"
                        >
                          <FontAwesomeIcon icon={faTimes} className="me-1" />
                          Clear
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={initiateShareQuestions}
                          disabled={!selectedGroup}
                          className="flex-grow-1"
                        >
                          <FontAwesomeIcon icon={faShareSquare} className="me-1" />
                          Share {selectedQuestionsToShare.length}
                        </Button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <FontAwesomeIcon icon={faBookOpen} style={{ fontSize: '32px', color: '#ccc', marginBottom: '8px' }} />
                  <p>No recent questions</p>
                  <small>Solve some questions first to share with your group!</small>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-header">
          <h3>{selectedGroup ? selectedGroup.name : "Select a group"}</h3>
          {selectedGroup && (
            <div className="chat-header-actions">
              <button onClick={() => handleInviteMore(selectedGroup)}>Invite</button>
            </div>
          )}
        </div>

        <div className="chat-messages" id="chatMessages">
          {selectedGroup ? (
            messagesForSelected.length ? (
              messagesForSelected.map((m, i) => {
                const isSystem = m.type === "group_system_message";
                const fromMe = m.sender && m.sender.username === username;

                // Check if this is a shared questions message
                let isSharedQuestion = false;
                let sharedData = null;
                try {
                  const parsed = JSON.parse(m.message);
                  if (parsed.type === "shared_questions") {
                    isSharedQuestion = true;
                    sharedData = parsed;
                  }
                } catch (e) {
                  // Not a JSON message, regular text
                }

                return (
                  <div key={i} className={`chat-msg ${isSystem ? "system" : fromMe ? "me" : "other"}`}>
                    {!isSystem && (
                      <div className="msg-meta">
                        <strong>{m.sender?.fullname || m.sender?.username}</strong>
                        <span className="msg-timestamp">{new Date(m.timestamp).toLocaleString()}</span>
                      </div>
                    )}

                    {isSharedQuestion && sharedData ? (
                      <div
                        className="shared-questions-card"
                        onClick={() => handleSharedQuestionClick(m.message)}
                        style={{
                          backgroundColor: '#f0f9ff',
                          border: '2px solid #3b82f6',
                          borderRadius: '8px',
                          padding: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dbeafe';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f9ff';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#1e40af'
                        }}>
                          <FontAwesomeIcon icon={faQuestionCircle} />
                          <span>Shared Questions</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                          <div><strong>Subject:</strong> {sharedData.session_metadata.subject_name}</div>
                          <div><strong>Questions:</strong> {sharedData.questions.length}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                            Shared by: {sharedData.shared_by}
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          color: '#1e40af',
                          fontWeight: '500'
                        }}>
                          <FontAwesomeIcon icon={faCheckCircle} />
                          <span>Click to start solving →</span>
                        </div>
                      </div>
                    ) : (
                      <div className="msg1-body">{m.message}</div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty">No messages yet — say hi 👋</div>
            )
          ) : (
            <div className="empty">Select a group to see messages</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            placeholder={selectedGroup ? "Type a message..." : "Select a group to send messages"}
            disabled={!selectedGroup}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />
          <button disabled={!selectedGroup || !messageText.trim()} onClick={handleSendMessage}><FontAwesomeIcon icon={faPaperPlane} /></button>
        </div>
      </div>

      {/* Create Group Modal */}
      <Modal show={showCreateGroupModal} onHide={() => setShowCreateGroupModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUsers} className="me-2" />
            Create New Group
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Group Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Invite Members (Optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="username1, username2, username3"
                value={inviteInput}
                onChange={(e) => setInviteInput(e.target.value)}
              />
              <Form.Text className="text-muted">
                Enter usernames separated by commas
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateGroupModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim() || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Share Questions Confirmation Modal */}
      <Modal show={showShareConfirmModal} onHide={() => setShowShareConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faShareSquare} className="me-2" />
            Confirm Share Questions
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="confirm-share-content">
            <p><strong>You are about to share:</strong></p>
            <ul>
              <li><strong>{selectedQuestionsToShare.length}</strong> question(s)</li>
              <li>Subject: <strong>{lastSession?.subject_name}</strong></li>
              <li>Group: <strong>{selectedGroup?.name}</strong></li>
            </ul>
            <div className="alert alert-info mt-3">
              <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
              All group members will be able to solve these questions.
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowShareConfirmModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleShareQuestions}
            disabled={isLoading}
          >
            {isLoading ? 'Sharing...' : 'Share Questions'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChatRoom;
