// src/components/StudentExamDetails.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import QuestionEvaluationCard from './shared/QuestionEvaluationCard';
import PerformanceHeader from './shared/PerformanceHeader';
import './StudentExamDetails.css';

const StudentExamDetails = ({ 
  studentResultId, 
  studentName, 
  examName,
  isTeacherView = false,
  summaryData = null
}) => {
  const [questionDetails, setQuestionDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examMetadata, setExamMetadata] = useState(null);

  useEffect(() => {
    if (studentResultId) {
      fetchQuestionDetails();
    }
  }, [studentResultId]);

  const fetchQuestionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching details for student_result_id:', studentResultId);
      console.log('Summary data received:', summaryData);
      
      const response = await axiosInstance.get(
        `/questions-evaluated/?student_result_id=${studentResultId}`
      );

      console.log('Full API Response:', response.data);

      const data = response.data;
      
      // Extract questions array
      const questionDataArray = data.question_data || [];
      const questionDataObject = questionDataArray[0] || {};
      const questionsArray = questionDataObject.questions_evaluation || [];
      
      console.log('Questions Array:', questionsArray);

      if (questionsArray.length === 0) {
        setError('No question data available for this student.');
        return;
      }

      // Helper function to normalize strengths/improvements to array
      const normalizeToArray = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'string') {
          // Split by newlines or common delimiters
          return data.split(/\n|;/).map(item => item.trim()).filter(Boolean);
        }
        return [];
      };

      // If summaryData is provided, use it directly
      if (summaryData) {
        console.log('Using summary data from student-results API');
        
        const strengthsArray = normalizeToArray(summaryData.strengths);
        const improvementsArray = normalizeToArray(summaryData.areas_for_improvement);

        setExamMetadata({
          studentName: studentName || summaryData.student_name || 'Student',
          rollNumber: summaryData.roll_number || 'N/A',
          examName: examName || summaryData.exam_name || 'Exam',
          examType: summaryData.exam_type || 'N/A',
          classSection: summaryData.class_section || 'N/A',
          totalMarks: summaryData.total_marks_obtained || 0,
          maxMarks: summaryData.total_max_marks || 0,
          percentage: summaryData.overall_percentage || 0,
          grade: summaryData.grade || 'N/A',
          strengths: strengthsArray,
          improvements: improvementsArray
        });
      } else {
        // Fallback: Calculate from questions
        console.log('Calculating summary from questions');
        
        let totalMarksObtained = 0;
        let totalMaxMarks = 0;
        
        questionsArray.forEach(q => {
          totalMarksObtained += parseFloat(q.total_score || 0);
          totalMaxMarks += parseFloat(q.max_marks || 0);
        });
        
        const overallPercentage = totalMaxMarks > 0 
          ? (totalMarksObtained / totalMaxMarks) * 100 
          : 0;
        
        const grade = calculateGrade(overallPercentage);
        const strengths = extractStrengths(questionsArray);
        const improvements = extractImprovements(questionsArray);

        setExamMetadata({
          studentName: studentName || 'Student',
          rollNumber: data.roll_number || 'N/A',
          examName: examName || data.exam_name || 'Exam',
          examType: data.exam_type || 'N/A',
          classSection: data.class_section || 'N/A',
          totalMarks: totalMarksObtained,
          maxMarks: totalMaxMarks,
          percentage: overallPercentage,
          grade: grade,
          strengths: strengths,
          improvements: improvements
        });
      }

      setQuestionDetails(questionsArray);
      
      console.log('Final Exam Metadata:', examMetadata);

    } catch (error) {
      console.error('Error fetching question details:', error);
      setError('Failed to load student answer details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  const extractStrengths = (questions) => {
    const strengths = [];
    const seenTopics = new Set();
    
    questions.forEach(q => {
      if (q.error_type === 'no_error' || q.percentage >= 80) {
        const topic = q.mistake_section || 'Good understanding';
        if (topic !== 'N/A' && !seenTopics.has(topic)) {
          strengths.push(`Strong performance in ${topic}`);
          seenTopics.add(topic);
        }
      }
    });
    
    if (strengths.length === 0) {
      const attemptedCount = questions.filter(q => q.error_type !== 'unattempted').length;
      if (attemptedCount > 0) {
        strengths.push(`Attempted ${attemptedCount} out of ${questions.length} questions`);
      }
      
      const correctCount = questions.filter(q => q.error_type === 'no_error').length;
      if (correctCount > 0) {
        strengths.push(`${correctCount} questions answered correctly`);
      } else {
        strengths.push('Completed the exam');
      }
    }
    
    return strengths;
  };

  const extractImprovements = (questions) => {
    const improvements = [];
    const seenTopics = new Set();
    
    questions.forEach(q => {
      if (q.error_type === 'unattempted' && q.gap_analysis && q.gap_analysis !== 'N/A') {
        improvements.push(q.gap_analysis.substring(0, 150) + '...');
      }
      else if (q.error_type !== 'no_error' && q.error_type !== 'unattempted') {
        const topic = q.mistake_section;
        if (topic && topic !== 'N/A' && !seenTopics.has(topic)) {
          improvements.push(`Review concepts in ${topic}`);
          seenTopics.add(topic);
        }
        if (q.gap_analysis && q.gap_analysis !== 'N/A' && improvements.length < 5) {
          improvements.push(q.gap_analysis.substring(0, 150) + '...');
        }
      }
    });
    
    const uniqueImprovements = [...new Set(improvements)].slice(0, 5);
    
    return uniqueImprovements.length > 0 
      ? uniqueImprovements 
      : ['Focus on understanding core concepts', 'Practice more problems'];
  };

  if (loading) {
    return (
      <div className="student-details-loading">
        <div className="spinner-large"></div>
        <p>Loading detailed evaluation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (!examMetadata) {
    return (
      <div className="alert alert-error">
        <span>No data available</span>
      </div>
    );
  }

  return (
    <div className="student-exam-details-container">
      <PerformanceHeader 
        metadata={examMetadata}
        isTeacherView={isTeacherView}
      />

      {(examMetadata.strengths.length > 0 || examMetadata.improvements.length > 0) && (
        <div className="insights-section">
          {examMetadata.strengths.length > 0 && (
            <div className="strengths-box">
              <h3>✅ Strengths</h3>
              <ul>
                {examMetadata.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {examMetadata.improvements.length > 0 && (
            <div className="improvements-box">
              <h3>💡 Areas for Improvement</h3>
              <ul>
                {examMetadata.improvements.map((improvement, idx) => (
                  <li key={idx}>{improvement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {questionDetails.length > 0 && (
        <div className="questions-summary-section">
          <h3>📋 Questions Summary</h3>
          <table className="questions-summary-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Marks Obtained</th>
                <th>Total Marks</th>
                <th>Percentage</th>
                {/* <th>Status</th> */}
              </tr>
            </thead>
            <tbody>
              {questionDetails.map((q, idx) => (
                <tr key={idx}>
                  <td>{q.question_number || `Q${idx + 1}`}</td>
                  <td>{q.total_score || 0}</td>
                  <td>{q.max_marks || 0}</td>
                  <td>
                    <span className={`percentage-badge ${getPerformanceClass(q.percentage || 0)}`}>
                      {(q.percentage || 0).toFixed(1)}%
                    </span>
                  </td>
                  {/* <td>
                    <span className={`status-badge ${(q.error_type || 'unattempted').toLowerCase().replace('_', '-')}`}>
                      {getStatusLabel(q.error_type || 'unattempted')}
                    </span>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {questionDetails.length > 0 && (
        <div className="detailed-evaluation-section">
          <h3>🔍 Detailed Questions Evaluation</h3>
          {questionDetails.map((question, idx) => (
            <QuestionEvaluationCard 
              key={idx}
              questionNumber={question.question_number || idx + 1}
              questionData={question}
              isTeacherView={isTeacherView}
            />
          ))}
        </div>
      )}

      {/* Overall Detailed Analysis */}
      {summaryData?.detailed_analysis && (
        <div className="overall-analysis-section">
          <div className="analysis-header">
            <span className="analysis-icon">📊</span>
            <h3 className="analysis-title">Overall Performance Analysis</h3>
          </div>
          <div className="analysis-content">
            <p className="analysis-text">{summaryData.detailed_analysis}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const getPerformanceClass = (percentage) => {
  if (percentage >= 90) return 'excellent';
  if (percentage >= 75) return 'good';
  if (percentage >= 60) return 'average';
  if (percentage >= 40) return 'below-average';
  return 'poor';
};

const getStatusLabel = (status) => {
  const labels = {
    'no_error': 'Correct',
    'correct': 'Correct',
    'incomplete': 'Incomplete',
    'conceptual_error': 'Conceptual Error',
    'numerical_error': 'Numerical Error',
    'unattempted': 'Unattempted'
  };
  return labels[status] || status;
};

export default StudentExamDetails;