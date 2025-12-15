// src/components/TeacherStudentDetailsView.jsx

import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import StudentExamDetails from './StudentExamDetails';

const TeacherStudentDetailsView = () => {
  const { examId, studentResultId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { studentName, examName, rollNumber } = location.state || {};

  return (
    <div className="teacher-student-details-view">
      <div className="breadcrumb">
        <button 
          onClick={() => navigate(-1)}
          className="back-btn"
        >
          ← Back to Student List
        </button>
        <span className="breadcrumb-text">
          Exam Analytics / {examName} / {studentName} (Roll: {rollNumber})
        </span>
      </div>

      <StudentExamDetails 
        studentResultId={parseInt(studentResultId)}
        studentName={studentName}
        examName={examName}
        isTeacherView={true}
      />
    </div>
  );
};

export default TeacherStudentDetailsView;