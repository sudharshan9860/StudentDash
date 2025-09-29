import React from 'react';
import './StudentDashboard.css';

const StudentDashboard = ({ user, assignments, notifications, submissions, onNotificationClick }) => {
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  const getSubmissionStatus = (assignmentId) => {
    return submissions.find((s) => s.assignmentId === assignmentId);
  };

  const isOverdue = (dueDate) => {
    return new Date() > dueDate;
  };

  return (
    <div className="student-dashboard">
      {/* Notifications */}
      <div className="dashboard-card notifications-card">
        <div className="card-header">
          <div className="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadNotifications.length > 0 && (
              <span className="notification-count">{unreadNotifications.length}</span>
            )}
          </div>
          <div>
            <h2 className="card-title">Notifications</h2>
            <p className="card-description">New homework assignments and updates</p>
          </div>
        </div>
        
        <div className="card-content">
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => onNotificationClick(notification)}
                  >
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <p className="notification-time">{notification.createdAt.toLocaleString()}</p>
                    </div>
                    {!notification.isRead && <div className="unread-indicator"></div>}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Assignments Overview */}
      <div className="dashboard-card assignments-card">
        <div className="card-header">
          <div className="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <h2 className="card-title">All Assignments</h2>
            <p className="card-description">View all assignments and their status</p>
          </div>
        </div>
        
        <div className="card-content">
          <div className="assignments-list">
            {assignments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <p>No assignments available</p>
              </div>
            ) : (
              assignments
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((assignment) => {
                  const submission = getSubmissionStatus(assignment.id);
                  const overdue = isOverdue(assignment.dueDate);

                  return (
                    <div key={assignment.id} className="assignment-item">
                      <div className="assignment-header">
                        <h3 className="assignment-title">{assignment.title}</h3>
                        <div className="status-badges">
                          {submission ? (
                            <div className="status-badge submitted">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22,4 12,14.01 9,11.01"/>
                              </svg>
                              Submitted
                            </div>
                          ) : overdue ? (
                            <div className="status-badge overdue">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                              </svg>
                              Overdue
                            </div>
                          ) : (
                            <div className="status-badge pending">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                              </svg>
                              Pending
                            </div>
                          )}
                        </div>
                      </div>

                      {assignment.description && (
                        <p className="assignment-description">{assignment.description}</p>
                      )}

                      {assignment.imageUrl && (
                        <img
                          src={assignment.imageUrl}
                          alt="Assignment"
                          className="assignment-image"
                        />
                      )}

                      <div className="assignment-dates">
                        <span>Assigned: {assignment.createdAt.toLocaleDateString()}</span>
                        <span className={overdue ? "due-date overdue-text" : "due-date"}>
                          Due: {assignment.dueDate.toLocaleDateString()}
                        </span>
                      </div>

                      {submission && (
                        <div className="submission-info">
                          <p className="submission-date">
                            Submitted on {submission.submittedAt.toLocaleDateString()}
                          </p>
                          {submission.textResponse && (
                            <p className="submission-preview">
                              Response: {submission.textResponse.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;