// src/components/StudentExamDetails.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import QuestionEvaluationCard from './shared/QuestionEvaluationCard';
import PerformanceHeader from './shared/PerformanceHeader';
import './StudentExamDetails.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  // Add this useEffect to expose download function globally
useEffect(() => {
  window.downloadStudentExamPDF = handleDownloadPDF;
  
  return () => {
    delete window.downloadStudentExamPDF;
  };
}, [examMetadata, questionDetails]);

const handleDownloadPDF = () => {
  try {
    if (!examMetadata || questionDetails.length === 0) {
      alert('No data available to download');
      return;
    }

    const doc = new jsPDF();
    let currentY = 20;
    
    // Helper function to strip LaTeX and clean text
    const cleanLatex = (text) => {
      if (!text) return '';
      
      // Remove display math delimiters
      text = text.replace(/\$\$([^$]+)\$\$/g, '$1');
      
      // Remove inline math delimiters
      text = text.replace(/\$([^$]+)\$/g, '$1');
      
      // Clean up common LaTeX commands
      text = text.replace(/\\neq/g, '≠');
      text = text.replace(/\\leq/g, '≤');
      text = text.replace(/\\geq/g, '≥');
      text = text.replace(/\\times/g, '×');
      text = text.replace(/\\div/g, '÷');
      text = text.replace(/\\pm/g, '±');
      text = text.replace(/\\angle/g, '∠');
      text = text.replace(/\\triangle/g, '△');
      text = text.replace(/\\degree/g, '°');
      text = text.replace(/\\cdot/g, '·');
      text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)');
      text = text.replace(/\^(\d+)/g, '^$1');
      text = text.replace(/\^{([^}]+)}/g, '^$1');
      text = text.replace(/_(\d+)/g, '_$1');
      text = text.replace(/_{([^}]+)}/g, '_$1');
      text = text.replace(/\\/g, '');
      
      return text;
    };
    
    // Helper function to parse JSON concepts
    const parseConceptText = (concept) => {
      if (typeof concept === 'string') {
        try {
          const parsed = JSON.parse(concept);
          if (parsed.concept_name && parsed.concept_description) {
            return `${parsed.concept_name}: ${cleanLatex(parsed.concept_description)}`;
          }
          return cleanLatex(concept);
        } catch {
          return cleanLatex(concept);
        }
      } else if (concept && typeof concept === 'object') {
        if (concept.concept_name && concept.concept_description) {
          return `${concept.concept_name}: ${cleanLatex(concept.concept_description)}`;
        }
        return cleanLatex(concept.concept || concept.name || concept.title || concept.text || '');
      }
      return '';
    };
    
    // Helper function to check if we need a new page
    const checkPageSpace = (requiredSpace) => {
      if (currentY + requiredSpace > 270) {
        doc.addPage();
        currentY = 20;
        return true;
      }
      return false;
    };
    
    // ========================================
    // PAGE 1: OVERVIEW
    // ========================================
    
    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Exam Details Report', 105, currentY, { align: 'center' });
    currentY += 10;
    
    // Exam Name
    doc.setFontSize(16);
    doc.text(examMetadata.examName, 105, currentY, { align: 'center' });
    currentY += 15;
    
    // Exam Overview Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Exam Overview', 20, currentY);
    currentY += 8;
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Exam Type: ${examMetadata.examType}`, 20, currentY);
    currentY += 6;
    doc.text(`Class/Section: ${examMetadata.classSection}`, 20, currentY);
    currentY += 6;
    doc.text(`Score: ${examMetadata.totalMarks} / ${examMetadata.maxMarks}`, 20, currentY);
    currentY += 6;
    doc.text(`Percentage: ${examMetadata.percentage.toFixed(1)}%`, 20, currentY);
    currentY += 6;
    
    // Performance level
    const perfLevel = examMetadata.percentage >= 90 ? 'Excellent' :
                      examMetadata.percentage >= 75 ? 'Good' :
                      examMetadata.percentage >= 60 ? 'Average' :
                      examMetadata.percentage >= 40 ? 'Below Average' : 'Needs Improvement';
    doc.text(`Performance: ${perfLevel}`, 20, currentY);
    currentY += 12;
    
    // Strengths Section
    if (examMetadata.strengths && examMetadata.strengths.length > 0) {
      checkPageSpace(30);
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text('Strengths', 20, currentY);
      currentY += 7;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      examMetadata.strengths.forEach((strength) => {
        const lines = doc.splitTextToSize(`• ${strength}`, 170);
        lines.forEach(line => {
          checkPageSpace(5);
          doc.text(line, 20, currentY);
          currentY += 5;
        });
      });
      currentY += 5;
    }
    
    // Areas for Improvement Section
    if (examMetadata.improvements && examMetadata.improvements.length > 0) {
      checkPageSpace(30);
      
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text('Areas for Improvement', 20, currentY);
      currentY += 7;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      examMetadata.improvements.forEach((improvement) => {
        const lines = doc.splitTextToSize(`• ${improvement}`, 170);
        lines.forEach(line => {
          checkPageSpace(5);
          doc.text(line, 20, currentY);
          currentY += 5;
        });
      });
      currentY += 10;
    }
    
    // Questions Summary Table
    checkPageSpace(50);
    
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text('Questions Summary', 20, currentY);
    currentY += 5;
    
    const summaryTableData = questionDetails.map((q, idx) => {
      const percentage = q.percentage || 0;
      const status = percentage >= 50 ? 'Pass' : 'Fail';
      return [
        q.question_number || `Q${idx + 1}`,
        q.total_score || 0,
        q.max_marks || 0,
        `${percentage.toFixed(1)}%`,
        status
      ];
    });
    
    autoTable(doc, {
      startY: currentY,
      head: [['Question', 'Scored', 'Total', 'Percentage']],
      body: summaryTableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [139, 92, 246], 
        textColor: 255, 
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 30 },
        1: { halign: 'center', cellWidth: 25 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 30 },
        4: { halign: 'center', cellWidth: 25 }
      }
    });
    
    currentY = doc.lastAutoTable.finalY + 10;
    
    // Footer for first page
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(100, 100, 100);
    const timestamp = new Date().toLocaleString();
    const totalPages = Math.ceil(questionDetails.length / 3) + 1; // Estimate
    doc.text(`Generated: ${timestamp} | Page 1`, 105, 285, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // ========================================
    // DETAILED QUESTIONS EVALUATION
    // Multiple questions per page
    // ========================================
    
    doc.addPage();
    currentY = 20;
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Detailed Questions Evaluation', 105, currentY, { align: 'center' });
    currentY += 10;
    
    questionDetails.forEach((question, idx) => {
      const qNum = question.question_number || `Q${idx + 1}`;
      const score = question.total_score || 0;
      const maxMarks = question.max_marks || 0;
      const percentage = question.percentage || 0;
      const errorType = question.error_type || 'unattempted';
      
      // Determine status
      let status = 'Incorrect';
      if (errorType === 'no_error') status = 'Correct';
      else if (percentage >= 50) status = 'Partially Correct';
      
      // Estimate space needed for this question (minimum 40, adjust based on content)
      let estimatedSpace = 40;
      if (question.question_text && question.question_text !== 'N/A') estimatedSpace += 15;
      if (question.concepts_required && question.concepts_required.length > 0) estimatedSpace += 20;
      if (question.mistakes_made && question.mistakes_made !== 'N/A' && question.mistakes_made !== 'None') estimatedSpace += 15;
      if (question.gap_analysis && question.gap_analysis !== 'N/A') estimatedSpace += 15;
      
      // Check if we need a new page for this question
      checkPageSpace(estimatedSpace);
      
      // Question Header with status badge
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`${qNum}`, 20, currentY);
      
      // Status badge
      doc.setFontSize(10);
      const statusColor = status === 'Correct' ? [16, 185, 129] : 
                          status === 'Partially Correct' ? [245, 158, 11] : [239, 68, 68];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(status, 45, currentY);
      doc.setTextColor(0, 0, 0);
      
      // Score on right
      doc.setFontSize(11);
      doc.text(`Score: ${score}/${maxMarks}`, 160, currentY);
      currentY += 3;
      
      // Percentage bar
      const barWidth = 170;
      const fillWidth = (percentage / 100) * barWidth;
      doc.setFillColor(220, 220, 220);
      doc.rect(20, currentY, barWidth, 3, 'F');
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.rect(20, currentY, fillWidth, 3, 'F');
      
      doc.setFontSize(8);
      doc.text(`${percentage.toFixed(1)}%`, 195, currentY + 2, { align: 'right' });
      currentY += 8;
      
      // Question Text
      if (question.question_text && question.question_text !== 'N/A') {
        checkPageSpace(20);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Question:', 20, currentY);
        currentY += 5;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        const cleanedQuestion = cleanLatex(question.question_text);
        const questionLines = doc.splitTextToSize(cleanedQuestion, 170);
        questionLines.forEach(line => {
          checkPageSpace(5);
          doc.text(line, 20, currentY);
          currentY += 4;
        });
        currentY += 3;
      }
      
      // Concepts Required
      if (question.concepts_required && question.concepts_required.length > 0) {
        checkPageSpace(20);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Concepts Required:', 20, currentY);
        currentY += 5;
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        
        const concepts = Array.isArray(question.concepts_required) 
          ? question.concepts_required 
          : [question.concepts_required];
        
        concepts.forEach((concept) => {
          const conceptText = parseConceptText(concept);
          
          if (conceptText && conceptText !== 'N/A' && conceptText.trim() !== '') {
            checkPageSpace(10);
            const conceptLines = doc.splitTextToSize(`• ${conceptText}`, 165);
            conceptLines.forEach(line => {
              checkPageSpace(4);
              doc.text(line, 25, currentY);
              currentY += 4;
            });
          }
        });
        currentY += 3;
      }
      
      // Mistakes Made
      if (question.mistakes_made && question.mistakes_made !== 'N/A' && question.mistakes_made !== 'None' && question.mistakes_made !== 'No attempt made.') {
        checkPageSpace(15);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Mistakes Made:', 20, currentY);
        currentY += 5;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        const mistakes = Array.isArray(question.mistakes_made) 
          ? question.mistakes_made.join('. ') 
          : question.mistakes_made;
        const cleanedMistakes = cleanLatex(mistakes);
        const mistakeLines = doc.splitTextToSize(cleanedMistakes, 170);
        mistakeLines.forEach(line => {
          checkPageSpace(4);
          doc.text(line, 20, currentY);
          currentY += 4;
        });
        currentY += 3;
      }
      
      // Gap Analysis
      if (question.gap_analysis && question.gap_analysis !== 'N/A' && question.gap_analysis !== 'No gaps identified') {
        checkPageSpace(15);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Gap Analysis:', 20, currentY);
        currentY += 5;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        const cleanedGap = cleanLatex(question.gap_analysis);
        const gapLines = doc.splitTextToSize(cleanedGap, 170);
        gapLines.forEach(line => {
          checkPageSpace(4);
          doc.text(line, 20, currentY);
          currentY += 4;
        });
        currentY += 3;
      }
      
      // Separator line between questions
      if (idx < questionDetails.length - 1) {
        checkPageSpace(8);
        doc.setDrawColor(200, 200, 200);
        doc.line(20, currentY, 190, currentY);
        currentY += 8;
      }
    });
    
    // Add page numbers to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(100, 100, 100);
      if (i > 1) {
        doc.text(`Generated: ${timestamp} | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      }
      doc.setTextColor(0, 0, 0);
    }
    
    // Save PDF
    const filename = `${examMetadata.examName.replace(/[^a-z0-9]/gi, '_')}_${examMetadata.rollNumber}_Details_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};

// Helper function for performance label
const getPerformanceLabel = (percentage) => {
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 75) return 'Good';
  if (percentage >= 60) return 'Average';
  if (percentage >= 40) return 'Below Average';
  return 'Needs Improvement';
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
                      {q.percentage || 0}%
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