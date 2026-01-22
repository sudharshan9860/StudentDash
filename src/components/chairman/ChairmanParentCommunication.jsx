// ChairmanParentCommunication.jsx - Parent Communication Tab Component
import React, { useState } from 'react';
import './ChairmanParentCommunication.css';

const ChairmanParentCommunication = ({ students, selectedClass }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [messageType, setMessageType] = useState('general');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Message templates
  const messageTemplates = {
    general: 'Dear Parent,\n\nWe would like to inform you about your child\'s progress and achievements in school...\n\nBest regards,\nSchool Administration',
    
    performance: 'Dear Parent,\n\nThis is to update you on your child\'s academic performance. We have observed significant progress in the following areas:\n\n[Add specific details here]\n\nWe encourage continued support at home to maintain this positive momentum.\n\nBest regards,\nAcademic Team',
    
    attendance: 'Dear Parent,\n\nWe have noticed your child\'s attendance pattern and would like to discuss any challenges they may be facing.\n\nRegular attendance is crucial for academic success. Please contact us at your earliest convenience.\n\nBest regards,\nSchool Administration',
    
    gap_analysis: 'Dear Parent,\n\nBased on our assessment, we have identified areas where your child needs additional support:\n\n[Add gap analysis details here]\n\nWe recommend the following remedial actions:\n[Add recommendations here]\n\nPlease schedule a meeting to discuss a personalized learning plan.\n\nBest regards,\nAcademic Support Team',
    
    remedial: 'Dear Parent,\n\nWe are conducting remedial classes for students who need additional support in specific subjects.\n\nSchedule:\n- Subject: [Subject Name]\n- Days: [Days]\n- Time: [Time]\n- Venue: [Location]\n\nYour child\'s participation would be highly beneficial.\n\nBest regards,\nRemedial Programs Team'
  };

  // Filter students based on search and class
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class.startsWith(selectedClass);
    return matchesSearch && matchesClass;
  });

  // Handle student selection
  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.studentId));
    }
  };

  // Handle template change
  const handleTemplateChange = (type) => {
    setMessageType(type);
    setMessageBody(messageTemplates[type]);
    
    // Set appropriate subject based on template
    const subjects = {
      general: 'General Information',
      performance: 'Academic Performance Update',
      attendance: 'Attendance Notice',
      gap_analysis: 'Learning Gap Analysis Report',
      remedial: 'Remedial Classes Notification'
    };
    setMessageSubject(subjects[type]);
  };

  // Handle send message
  const handleSendMessage = () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }
    if (!messageSubject.trim() || !messageBody.trim()) {
      alert('Please fill in subject and message');
      return;
    }
    
    // TODO: Implement actual send functionality with API
    console.log('Sending message to:', selectedStudents);
    console.log('Subject:', messageSubject);
    console.log('Message:', messageBody);
    
    alert(`Message sent to ${selectedStudents.length} parent(s) successfully!`);
    
    // Reset form
    setSelectedStudents([]);
    setMessageSubject('');
    setMessageBody('');
    setMessageType('general');
  };

  // Handle preview
  const handlePreview = () => {
    const previewWindow = window.open('', 'Message Preview', 'width=600,height=800');
    previewWindow.document.write(`
      <html>
        <head>
          <title>Message Preview</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: #f5f5f5;
            }
            .preview-container {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h2 { color: #333; margin-top: 0; }
            .subject { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 20px;
              color: #555;
            }
            .message { 
              line-height: 1.6; 
              white-space: pre-wrap;
              color: #333;
            }
            .recipients {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #eee;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            <h2>Message Preview</h2>
            <div class="subject">Subject: ${messageSubject}</div>
            <div class="message">${messageBody}</div>
            <div class="recipients">
              <strong>Recipients:</strong> ${selectedStudents.length} parent(s)
            </div>
          </div>
        </body>
      </html>
    `);
    previewWindow.document.close();
  };

  return (
    <div className="chairman-parent-communication">
      {/* Header */}
      <div className="communication-header">
        <h2>Parent Communication</h2>
        <p>Send notifications and updates to parents</p>
      </div>

      {/* Communication Layout - 2 columns */}
      <div className="communication-layout">
        {/* Left Panel - Student Selection */}
        <div className="student-selection-panel">
          <div className="panel-header">
            <h3>Select Students</h3>
            <button className="select-all-btn" onClick={handleSelectAll}>
              {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Search Input */}
          <input
            type="text"
            className="search-input"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Selected Count */}
          <div className="selected-count">
            {selectedStudents.length} student(s) selected
          </div>

          {/* Students List */}
          <div className="students-list">
            {filteredStudents.map(student => (
              <div 
                key={student.studentId}
                className={`student-item ${selectedStudents.includes(student.studentId) ? 'selected' : ''}`}
                onClick={() => handleSelectStudent(student.studentId)}
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.studentId)}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="student-info">
                  <div className="student-name">{student.studentName}</div>
                  <div className="student-details">
                    {student.studentId} • {student.class}
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {filteredStudents.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: '#64748b' 
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>👨‍👩‍👧‍👦</div>
                <p style={{ margin: 0 }}>No students found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Message Composition */}
        <div className="message-composition-panel">
          <h3>Compose Message</h3>

          {/* Template Selector */}
          <div className="template-selector">
            <label>Message Template:</label>
            <select 
              value={messageType} 
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <option value="general">General Message</option>
              <option value="performance">Performance Update</option>
              <option value="attendance">Attendance Notice</option>
              <option value="gap_analysis">Gap Analysis Report</option>
              <option value="remedial">Remedial Classes</option>
            </select>
          </div>

          {/* Subject Field */}
          <div className="message-field">
            <label>Subject:</label>
            <input
              type="text"
              className="message-input"
              value={messageSubject}
              onChange={(e) => setMessageSubject(e.target.value)}
              placeholder="Enter message subject..."
            />
          </div>

          {/* Message Body */}
          <div className="message-field">
            <label>Message:</label>
            <textarea
              className="message-textarea"
              rows="15"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              placeholder="Enter your message here..."
            />
          </div>

          {/* Action Buttons */}
          <div className="message-actions">
            <button 
              className="send-btn" 
              onClick={handleSendMessage}
              disabled={selectedStudents.length === 0 || !messageSubject || !messageBody}
            >
              <span>📧</span> Send Message
            </button>
            <button 
              className="preview-btn"
              onClick={handlePreview}
              disabled={!messageSubject || !messageBody}
            >
              <span>👁</span> Preview
            </button>
            <button className="save-draft-btn">
              <span>💾</span> Save Draft
            </button>
          </div>

          {/* Info Box */}
          {selectedStudents.length > 0 && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: '#f0f9ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1e40af'
            }}>
              <strong>📌 Note:</strong> This message will be sent to {selectedStudents.length} parent(s).
              Make sure all information is accurate before sending.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChairmanParentCommunication;