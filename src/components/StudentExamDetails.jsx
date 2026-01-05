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
        console.log('student_fullname:', summaryData.student_fullname);  // ADD DEBUG
        console.log('student_name:', summaryData.student_name);          // ADD DEBUG
        console.log('roll_number:', summaryData.roll_number); 
        
        const strengthsArray = normalizeToArray(summaryData.strengths);
        const improvementsArray = normalizeToArray(summaryData.areas_for_improvement);

        setExamMetadata({
          studentName: summaryData.student_fullname || summaryData.student_name || studentName || 'Student',
          rollNumber: summaryData.student_name || summaryData.roll_number || 'N/A',
          examName: examName || summaryData.exam_name || 'Exam',
          examType: summaryData.exam_type || 'N/A',
          classSection: summaryData.class_section || 'N/A',
          totalMarks: summaryData.total_marks_obtained || 0,
          maxMarks: summaryData.total_max_marks || 0,
          percentage: summaryData.overall_percentage || 0,
          grade: summaryData.grade || 'N/A',
          strengths: strengthsArray,
          improvements: improvementsArray,
          remedialAction: summaryData.remedial_action || null,  // ← NEW! Add remedial action
          detailedAnalysis: summaryData.detailed_analysis || null  // ← ADD THIS LINE
        });
          // ADD DEBUG LOG
        console.log('Exam Metadata Set:', {
          studentName: summaryData.student_fullname || summaryData.student_name || studentName,
          rollNumber: summaryData.student_name || summaryData.roll_number
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
            studentName: data.student_fullname || studentName || 'Student',  // ← FIXED!
            rollNumber: data.student_name || data.roll_number || 'N/A',      // ← FIXED!
            examName: examName || data.exam_name || 'Exam',
            examType: data.exam_type || 'N/A',
            classSection: data.class_section || 'N/A',
            totalMarks: totalMarksObtained,
            maxMarks: totalMaxMarks,
            percentage: overallPercentage,
            grade: grade,
            strengths: strengths,
            improvements: improvements,
            remedialAction: data.remedial_action || null,  // ← NEW!
            detailedAnalysis: data.detailed_analysis || null  // ← ADD THIS LINE
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
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
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
      if (currentY + requiredSpace > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
        return true;
      }
      return false;
    };
    
    // ========================================
    // PAGE 1: OVERVIEW WITH STYLED SECTIONS
    // ========================================
    
    // Main Title with background
    doc.setFillColor(99, 102, 241); // Indigo
    doc.rect(0, currentY - 5, pageWidth, 15, 'F');
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Exam Details Report', pageWidth / 2, currentY + 5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    currentY += 20;
    
    // Exam Name with background
    doc.setFillColor(219, 234, 254); // Light blue
    doc.rect(20, currentY - 3, pageWidth - 40, 12, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text(examMetadata.examName, pageWidth / 2, currentY + 5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    currentY += 18;
    
    // ========================================
    // EXAM OVERVIEW SECTION (STYLED)
    // ========================================
    doc.setFillColor(243, 244, 246); // Light gray header
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Exam Overview', 25, currentY + 5.5);
    doc.setTextColor(0, 0, 0);
    currentY += 12;

    // Overview content box (INCREASED HEIGHT to accommodate new fields)
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.5);
    doc.rect(20, currentY, pageWidth - 40, 42, 'S'); 

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    currentY += 6;
    doc.text(`Student Name: ${examMetadata.studentName || 'N/A'}`, 25, currentY);
    currentY += 5;
    doc.text(`Roll Number: ${examMetadata.rollNumber || 'N/A'}`, 25, currentY);
    currentY += 5;

    // EXISTING FIELDS
    doc.text(`Exam Type: ${examMetadata.examType}`, 25, currentY);
    currentY += 5;
    doc.text(`Class/Section: ${examMetadata.classSection}`, 25, currentY);
    currentY += 5;
    doc.text(`Score: ${examMetadata.totalMarks} / ${examMetadata.maxMarks}`, 25, currentY);
    currentY += 5;
    doc.text(`Percentage: ${examMetadata.percentage.toFixed(1)}%`, 25, currentY);
    currentY += 5;

    const perfLevel = examMetadata.percentage >= 90 ? 'Excellent' :
                      examMetadata.percentage >= 75 ? 'Good' :
                      examMetadata.percentage >= 60 ? 'Average' :
                      examMetadata.percentage >= 40 ? 'Below Average' : 'Needs Improvement';
    doc.text(`Performance: ${perfLevel}`, 25, currentY);
    currentY += 10;
    
    // ========================================
    // STRENGTHS SECTION (STYLED)
    // ========================================
    if (examMetadata.strengths && examMetadata.strengths.length > 0) {
      checkPageSpace(30);
      
      // Header
      doc.setFillColor(220, 252, 231); // Light green
      doc.rect(20, currentY, pageWidth - 40, 8, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52);
      doc.text('Strengths', 25, currentY + 5.5);
      doc.setTextColor(0, 0, 0);
      currentY += 12;
      
      // Content
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      examMetadata.strengths.forEach((strength, idx) => {
        const bulletText = `• ${strength}`;
        const lines = doc.splitTextToSize(bulletText, pageWidth - 50);
        lines.forEach(line => {
          checkPageSpace(5);
          doc.text(line, 25, currentY);
          currentY += 5;
        });
      });
      currentY += 4;
    }
    
    // ========================================
    // AREAS FOR IMPROVEMENT SECTION (STYLED)
    // ========================================
    if (examMetadata.improvements && examMetadata.improvements.length > 0) {
      checkPageSpace(30);
      
      // Header
      doc.setFillColor(254, 243, 199); // Light yellow
      doc.rect(20, currentY, pageWidth - 40, 8, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14);
      doc.text('Areas for Improvement', 25, currentY + 5.5);
      doc.setTextColor(0, 0, 0);
      currentY += 12;
      
      // Content
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      examMetadata.improvements.forEach((improvement, idx) => {
        const bulletText = `• ${improvement}`;
        const lines = doc.splitTextToSize(bulletText, pageWidth - 50);
        lines.forEach(line => {
          checkPageSpace(5);
          doc.text(line, 25, currentY);
          currentY += 5;
        });
      });
      currentY += 8;
    }
    
    // ========================================
    // QUESTIONS SUMMARY TABLE (CENTERED)
    // ========================================
    checkPageSpace(50);
    
    // Section header
    doc.setFillColor(243, 244, 246);
    doc.rect(20, currentY, pageWidth - 40, 8, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Questions Summary', pageWidth / 2, currentY + 5.5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    currentY += 12;
    
    const summaryTableData = questionDetails.map((q, idx) => {
      return [
        q.question_number || `Q${idx + 1}`,
        q.total_score || 0,
        q.max_marks || 0,
      ];
    });
    
    // Add overall summary rows with better styling
    summaryTableData.push([
      { 
        content: 'Overall', 
        styles: { 
          fontStyle: 'bold', 
          fillColor: [243, 244, 246],
          textColor: [31, 41, 55]
        } 
      },
      { 
        content: examMetadata.totalMarks || 0, 
        styles: { 
          fontStyle: 'bold', 
          fillColor: [243, 244, 246],
          textColor: [31, 41, 55]
        } 
      },
      { 
        content: examMetadata.maxMarks || 0, 
        styles: { 
          fontStyle: 'bold', 
          fillColor: [243, 244, 246],
          textColor: [31, 41, 55]
        } 
      }
    ]);
    
    // Percentage row with color coding
    const percentageColor = examMetadata.percentage >= 75 
      ? [220, 252, 231] 
      : examMetadata.percentage >= 50 
      ? [254, 249, 195] 
      : [254, 226, 226];
    
    summaryTableData.push([
      { 
        content: 'Percentage', 
        colSpan: 2, 
        styles: { 
          fontStyle: 'bold',
          fillColor: percentageColor,
          textColor: [31, 41, 55]
        } 
      },
      { 
        content: `${(examMetadata.percentage || 0).toFixed(1)}%`, 
        styles: { 
          fontStyle: 'bold',
          fillColor: percentageColor,
          textColor: [31, 41, 55]
        } 
      }
    ]);
    
    // Calculate table width and center it
    const tableWidth = 120;
    const tableStartX = (pageWidth - tableWidth) / 2;
    
    autoTable(doc, {
      startY: currentY,
      margin: { left: tableStartX },
      head: [['Question', 'Marks Obtained', 'Total Marks']],
      body: summaryTableData,
      theme: 'grid',
      tableWidth: tableWidth,
      headStyles: { 
        fillColor: [139, 92, 246], 
        textColor: 255, 
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 40 },
        1: { halign: 'center', cellWidth: 40 },
        2: { halign: 'center', cellWidth: 40 }
      }
    });
    
    currentY = doc.lastAutoTable.finalY + 10;
    
    // Footer for first page
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(107, 114, 128);
    const timestamp = new Date().toLocaleString();
    doc.text(`Generated: ${timestamp} | Page 1`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // ========================================
    // DETAILED QUESTIONS EVALUATION
    // (COMPACT, NO EMOJIS, LESS SPACING)
    // ========================================
    
    doc.addPage();
    currentY = 20;
    
    // Page title
    doc.setFillColor(99, 102, 241);
    doc.rect(0, currentY - 5, pageWidth, 12, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Detailed Questions Evaluation', pageWidth / 2, currentY + 3, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    currentY += 12;
    
    questionDetails.forEach((question, idx) => {
      const qNum = question.question_number || `Q${idx + 1}`;
      const score = question.total_score || 0;
      const maxMarks = question.max_marks || 0;
      const percentage = question.percentage || 0;
      const errorType = question.error_type || 'unattempted';
      
      // Determine status
      let status = 'Incorrect';
      let statusColor = [239, 68, 68]; // Red

      if (score === maxMarks && maxMarks > 0) {
        status = 'Correct';
        statusColor = [16, 185, 129]; // Green
      }
      else if (score > 0 && score < maxMarks) {
        status = 'Partially Correct';
        statusColor = [245, 158, 11]; // Orange
      }
      
      // Better space estimation (REDUCED)
      let estimatedSpace = 25; // Reduced base space
      if (question.question_text && question.question_text !== 'N/A') estimatedSpace += 12;
      if (question.concepts_required && question.concepts_required.length > 0) {
        estimatedSpace += 8 + (Math.min(question.concepts_required.length, 3) * 8); // Cap at 3 for estimation
      }
      if (question.mistakes_made && question.mistakes_made !== 'N/A' && question.mistakes_made !== 'None') estimatedSpace += 10;
      if (question.gap_analysis && question.gap_analysis !== 'N/A') estimatedSpace += 10;
      
      checkPageSpace(estimatedSpace);
      
      // ========================================
      // QUESTION HEADER (COMPACT)
      // ========================================
      const headerHeight = 8;
      const headerY = currentY;
      
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(15, headerY, pageWidth - 30, headerHeight, 1.5, 1.5, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`Question ${qNum}`, 20, headerY + 5.5);
      doc.text(`[${status}]`, 55, headerY + 5.5);
      doc.text(`Score: ${score}/${maxMarks}`, pageWidth - 20, headerY + 5.5, { align: 'right' });
      
      doc.setTextColor(0, 0, 0);
      currentY += headerHeight + 3; // Reduced spacing
      
      // ========================================
      // QUESTION TEXT (if exists)
      // ========================================
      if (question.question && question.question !== 'N/A') {  // ← FIXED! Use "question" not "question_text"
        checkPageSpace(15);
        
        doc.setFillColor(243, 244, 246);
        doc.rect(15, currentY, pageWidth - 30, 6, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(55, 65, 81);
        doc.text('[Q] Question', 20, currentY + 4);
        doc.setTextColor(0, 0, 0);
        currentY += 10;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const cleanedQuestion = cleanLatex(question.question);  // ← FIXED! Use "question" not "question_text"
        const questionLines = doc.splitTextToSize(cleanedQuestion, pageWidth - 40);
        questionLines.forEach(line => {
          checkPageSpace(4);
          doc.text(line, 20, currentY);
          currentY += 4.5;
        });
        currentY += 3;
      }
      
      // ========================================
      // CONCEPTS REQUIRED (NO EMOJI, COMPACT)
      // ========================================
      if (question.concepts_required && question.concepts_required.length > 0) {
        checkPageSpace(15);
        
        doc.setFillColor(219, 234, 254);
        doc.rect(15, currentY, pageWidth - 30, 6, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text('[C] Concepts Required', 20, currentY + 4);
        doc.setTextColor(0, 0, 0);
        currentY += 10;
        
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        
        const concepts = Array.isArray(question.concepts_required) 
          ? question.concepts_required 
          : [question.concepts_required];
        
        concepts.forEach((concept, conceptIdx) => {
          const conceptText = parseConceptText(concept);
          
          if (conceptText && conceptText !== 'N/A' && conceptText.trim() !== '') {
            checkPageSpace(8);
            
            const bulletPoint = `• ${conceptText}`;
            const conceptLines = doc.splitTextToSize(bulletPoint, pageWidth - 45);
            
            conceptLines.forEach((line, lineIdx) => {
              checkPageSpace(3.5);
              doc.text(line, lineIdx === 0 ? 22 : 25, currentY);
              currentY += 4.2;
            });
            
            if (conceptIdx < concepts.length - 1) {
              currentY += 2.5;
            }
          }
        });
        currentY += 3;
      }
      
      // ========================================
      // MISTAKES MADE (NO EMOJI, COMPACT)
      // ========================================
      if (question.mistakes_made && 
          question.mistakes_made !== 'N/A' && 
          question.mistakes_made !== 'None' && 
          question.mistakes_made !== 'No attempt made.') {
        checkPageSpace(15);
        
        doc.setFillColor(254, 226, 226);
        doc.rect(15, currentY, pageWidth - 30, 6, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(153, 27, 27);
        doc.text('[!] Mistakes Made', 20, currentY + 4);
        doc.setTextColor(0, 0, 0);
        currentY += 10;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const mistakes = Array.isArray(question.mistakes_made) 
          ? question.mistakes_made.join('. ') 
          : question.mistakes_made;
        const cleanedMistakes = cleanLatex(mistakes);
        const mistakeLines = doc.splitTextToSize(cleanedMistakes, pageWidth - 40);
        mistakeLines.forEach(line => {
          checkPageSpace(3.5);
          doc.text(line, 20, currentY);
          currentY += 4.5;
        });
        
        if (question.mistake_section && question.mistake_section !== 'N/A') {
          currentY += 1;
          doc.setFontSize(7);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(107, 114, 128);
          doc.text(`Section: ${question.mistake_section}`, 20, currentY);
          doc.setTextColor(0, 0, 0);
          currentY += 4;
        } else {
          currentY += 3;
        }
      }
      
      // ========================================
      // GAP ANALYSIS (NO EMOJI, COMPACT)
      // ========================================
      if (question.gap_analysis && 
          question.gap_analysis !== 'N/A' && 
          question.gap_analysis !== 'No gaps identified') {
        checkPageSpace(15);
        
        doc.setFillColor(254, 243, 199);
        doc.rect(15, currentY, pageWidth - 30, 6, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(146, 64, 14);
        doc.text('[G] Gap Analysis', 20, currentY + 4);
        doc.setTextColor(0, 0, 0);
        currentY += 10;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const cleanedGap = cleanLatex(question.gap_analysis);
        const gapLines = doc.splitTextToSize(cleanedGap, pageWidth - 40);
        gapLines.forEach(line => {
          checkPageSpace(3.5);
          doc.text(line, 20, currentY);
          currentY += 4.5;
        });
        currentY += 3;
      }
      
      // ========================================
      // SEPARATOR (COMPACT)
      // ========================================
      if (idx < questionDetails.length - 1) {
        checkPageSpace(6);
        doc.setDrawColor(209, 213, 219);
        doc.setLineWidth(0.3);
        doc.line(15, currentY, pageWidth - 15, currentY);
        currentY += 6; // Reduced spacing between questions
      }
    });
    
    // ========================================
    // REMEDIAL ACTION SECTION (NEW)
    // ========================================
    if (examMetadata.remedialAction && examMetadata.remedialAction.trim() !== '') {
      checkPageSpace(40);
      
      // Add some space before section
      currentY += 5;
      
      // Section title with background
      doc.setFillColor(254, 243, 199); // Light yellow/orange (similar to Areas for Improvement)
      doc.rect(10, currentY - 5, pageWidth - 20, 12, 'F');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(146, 64, 14); // Brown/orange text
      doc.text('Remedial Action', pageWidth / 2, currentY + 2, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      currentY += 12;
      
      // Content box with border
      const startY = currentY;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const remedialLines = doc.splitTextToSize(examMetadata.remedialAction, pageWidth - 40);
      
      // Calculate box height
      const contentHeight = remedialLines.length * 5 + 10;
      
      // Draw border
      doc.setDrawColor(251, 191, 36); // Yellow/orange border
      doc.setLineWidth(0.5);
      doc.rect(15, startY, pageWidth - 30, contentHeight, 'S');
      
      currentY += 5;
      
      // Add content
      remedialLines.forEach(line => {
        checkPageSpace(5);
        doc.text(line, 20, currentY);
        currentY += 5;
      });
      
      currentY += 8;
    }

    // ========================================
    // OVERALL PERFORMANCE ANALYSIS SECTION (NEW!)
    // ========================================
    if (examMetadata.detailedAnalysis && examMetadata.detailedAnalysis.trim() !== '') {
      checkPageSpace(40);
      
      currentY += 5;
      
      // Section title with green background
      doc.setFillColor(220, 252, 231); // Light green
      doc.rect(10, currentY - 5, pageWidth - 20, 12, 'F');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52); // Dark green text
      doc.text('Overall Performance Analysis', pageWidth / 2, currentY + 2, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      currentY += 12;
      
      // Content box with border
      const startY = currentY;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const analysisLines = doc.splitTextToSize(examMetadata.detailedAnalysis, pageWidth - 40);
      
      // Calculate box height
      const contentHeight = analysisLines.length * 5 + 10;
      
      // Draw green border
      doc.setDrawColor(34, 197, 94); // Green border
      doc.setLineWidth(0.5);
      doc.rect(15, startY, pageWidth - 30, contentHeight, 'S');
      
      currentY += 5;
      
      // Add content
      analysisLines.forEach(line => {
        checkPageSpace(5);
        doc.text(line, 20, currentY);
        currentY += 5;
      });
      
      currentY += 8;
    }


    // Add page numbers to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(107, 114, 128); // Gray
      if (i > 1) {
        doc.text(`Generated: ${timestamp} | Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
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
              </tr>
            </thead>
            <tbody>
              {questionDetails.map((q, idx) => (
                <tr key={idx}>
                  <td>{q.question_number || `Q${idx + 1}`}</td>
                  <td>{q.total_score || 0}</td>
                  <td>{q.max_marks || 0}</td>
                </tr>
              ))}
               {/* Overall Summary Row */}
                <tr className="overall-summary-row">
                  <td><strong>Overall</strong></td>
                  <td><strong>{examMetadata.totalMarks || 0}</strong></td>
                  <td><strong>{examMetadata.maxMarks || 0}</strong></td>
                </tr>
                <tr className="percentage-summary-row">
                  <td colSpan="2"><strong>Percentage</strong></td>
                  <td>
                    <span className={`percentage-badge ${getPerformanceClass(examMetadata.percentage || 0)}`}>
                      <strong>{(examMetadata.percentage || 0).toFixed(1)}%</strong>
                    </span>
                  </td>
                </tr>
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

      {/* Remedial Action Section (NEW) */}
      {examMetadata?.remedialAction && (
        <div className="remedial-action-section">
          <div className="remedial-header">
            <span className="remedial-icon">💊</span>
            <h3 className="remedial-title">Remedial Action</h3>
          </div>
          <div className="remedial-content">
            <p className="remedial-text">{examMetadata.remedialAction}</p>
          </div>
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