// src/components/ExamDetailsModal.jsx - FINAL FIXED VERSION with concept object handling
import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, ProgressBar, Alert, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faGraduationCap,
  faChartLine,
  faCheckCircle,
  faExclamationTriangle,
  faLightbulb,
  faTrophy,
  faChartBar,
  faClipboardCheck,
  faFileAlt,
  faBullseye,
  faArrowUp,
  faArrowDown,
  faEye,
  faDownload,
  faExpand,
  faCompress
} from '@fortawesome/free-solid-svg-icons';
import MarkdownWithMath from './MarkdownWithMath';
import axiosInstance from '../api/axiosInstance';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ExamDetailsModal.css';

const ExamDetailsModal = ({ show, onHide, result }) => {
  // State for questions evaluation
  const [questionsEvaluation, setQuestionsEvaluation] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true); // Default to fullscreen

  // Reset questions state when modal is closed or exam changes
  useEffect(() => {
    if (!show) {
      setQuestionsEvaluation(null);
      setShowQuestions(false);
      setQuestionsError(null);
      setLoadingQuestions(false);
    }
  }, [show]);

  useEffect(() => {
    setQuestionsEvaluation(null);
    setShowQuestions(false);
    setQuestionsError(null);
    setLoadingQuestions(false);
  }, [result?.result_id, result?.student_id, result?.id]);

  // Helper function to extract concept name from string or object
  const getConceptName = (concept) => {
    if (typeof concept === 'string') {
      return concept;
    }
    if (typeof concept === 'object' && concept !== null) {
      return concept.concept_name || concept.name || String(concept);
    }
    return String(concept);
  };

  // Helper function to get concept description
  const getConceptDescription = (concept) => {
    if (typeof concept === 'object' && concept !== null) {
      return concept.concept_description || concept.description || null;
    }
    return null;
  };

  // Helper functions
  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': case 'A+': return 'success';
      case 'B': case 'B+': return 'info';
      case 'C': case 'C+': return 'warning';
      case 'D': return 'danger';
      case 'F': return 'danger';
      default: return 'secondary';
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'danger';
  };

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 90) return { label: 'Outstanding', color: 'success', icon: faTrophy };
    if (percentage >= 80) return { label: 'Excellent', color: 'success', icon: faCheckCircle };
    if (percentage >= 70) return { label: 'Very Good', color: 'info', icon: faArrowUp };
    if (percentage >= 60) return { label: 'Good', color: 'info', icon: faCheckCircle };
    if (percentage >= 50) return { label: 'Average', color: 'warning', icon: faChartBar };
    if (percentage >= 40) return { label: 'Below Average', color: 'warning', icon: faArrowDown };
    return { label: 'Needs Improvement', color: 'danger', icon: faExclamationTriangle };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return dateString;
    }
  };

  const percentage = result?.overall_percentage || 0;
  const performance = getPerformanceLevel(percentage);

  const parseListData = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') return data.split(',').map(s => s.trim()).filter(s => s);
    return [];
  };

  const strengths = parseListData(result?.strengths);
  const improvements = parseListData(result?.areas_for_improvement);

  // Fetch questions evaluation
  const fetchQuestionsEvaluation = async () => {
    const studentResultId = result?.student_id || result?.result_id || result?.id;

    if (!studentResultId) {
      setQuestionsError('Student result ID not available');
      return;
    }

    try {
      setLoadingQuestions(true);
      setQuestionsError(null);

      const response = await axiosInstance.get('/questions-evaluated/', {
        params: {
          student_result_id: studentResultId
        }
      });

      console.log('API Response:', response.data);

      if (response.data) {
        // Handle the nested structure correctly
        let data = response.data;
        
        // If it's wrapped in question_data array
        if (data.question_data && Array.isArray(data.question_data)) {
          data = data.question_data[0];
        }
        
        console.log('Processed data:', data);
        
        setQuestionsEvaluation(data);
        setShowQuestions(true);
      }
    } catch (error) {
      console.error('Error fetching questions evaluation:', error);
      setQuestionsError(error.response?.data?.error || 'Failed to fetch questions evaluation');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // PDF Download Function
  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Header
    doc.setFillColor(0, 193, 212);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`Exam Details - ${result?.exam_name || result?.exam || 'Exam'}`, pageWidth / 2, 25, { align: 'center' });

    yPosition = 50;
    doc.setTextColor(0, 0, 0);

    // Exam Overview Section
    doc.setFillColor(240, 240, 240);
    doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Overview', 15, yPosition + 6);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Exam Type: ${result?.exam_type || 'N/A'}`, 15, yPosition);
    doc.text(`Class/Section: ${result?.class_section || 'N/A'}`, 120, yPosition);
    yPosition += 8;
    doc.text(`Score: ${result?.total_marks_obtained || 0} / ${result?.total_marks || 0}`, 15, yPosition);
    doc.text(`Percentage: ${percentage.toFixed(2)}%`, 120, yPosition);
    yPosition += 8;
    doc.text(`Performance: ${performance.label}`, 15, yPosition);
    doc.text(`Processed: ${formatDate(result?.processed_at)}`, 120, yPosition);
    yPosition += 15;

    // Performance Progress Bar
    doc.setFillColor(220, 220, 220);
    doc.rect(15, yPosition, pageWidth - 30, 10, 'F');
    doc.setFillColor(0, 193, 212);
    doc.rect(15, yPosition, ((pageWidth - 30) * percentage) / 100, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${percentage.toFixed(1)}%`, pageWidth / 2, yPosition + 6.5, { align: 'center' });
    yPosition += 20;

    // Strengths Section
    if (strengths.length > 0) {
      doc.setFillColor(212, 237, 218);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 135, 84);
      doc.text('✓ Strengths', 15, yPosition + 6);
      yPosition += 12;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      strengths.forEach((strength, index) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`• ${strength}`, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 5;
    }

    // Areas for Improvement Section
    if (improvements.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(255, 243, 205);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 193, 7);
      doc.text('⚠ Areas for Improvement', 15, yPosition + 6);
      yPosition += 12;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      improvements.forEach((improvement, index) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`• ${improvement}`, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }

    // Questions Summary Table
    if (questionsEvaluation?.questions_evaluation?.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFillColor(220, 240, 255);
      doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(13, 110, 253);
      doc.text('📊 Questions Summary', 15, yPosition + 6);
      yPosition += 15;

      const tableData = questionsEvaluation.questions_evaluation.map((q, index) => [
        q.question_number || `Q${index + 1}`,
        `${q.total_score || 0} / ${q.max_marks || 0}`,
        `${q.percentage?.toFixed(1) || 0}%`,
        q.error_type === 'no_error' ? 'Pass' : 'Fail'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Question', 'Marks', 'Percentage', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [0, 193, 212],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 30 },
          1: { halign: 'center', cellWidth: 40 },
          2: { halign: 'center', cellWidth: 40 },
          3: { halign: 'center' }
        },
        styles: {
          fontSize: 9,
          cellPadding: 5
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });
    }

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${totalPages} | Generated: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`Exam_Details_${result?.exam_name || result?.exam || 'Exam'}_${Date.now()}.pdf`);
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="xl" 
      fullscreen={isFullscreen}
      scrollable 
      centered={!isFullscreen}
      className="exam-details-modal"
    >
      <Modal.Header closeButton className="exam-modal-header">
        <Modal.Title className="exam-modal-title">
          <FontAwesomeIcon icon={faFileAlt} className="me-3" />
          Exam Details - {result?.exam_name || result?.exam || 'N/A'}
        </Modal.Title>
        <Button 
          variant="link" 
          onClick={toggleFullscreen}
          className="fullscreen-toggle"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
        </Button>
      </Modal.Header>

      <Modal.Body className="exam-modal-body">
        {/* Exam Overview */}
        <div className="exam-overview-card">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="info-item">
                <FontAwesomeIcon icon={faFileAlt} className="info-icon text-primary" />
                <div className="info-content">
                  <span className="info-label">Exam Type</span>
                  <Badge bg="secondary" className="info-badge">{result?.exam_type || 'N/A'}</Badge>
                </div>
              </div>
              <div className="info-item">
                <FontAwesomeIcon icon={faGraduationCap} className="info-icon text-info" />
                <div className="info-content">
                  <span className="info-label">Class/Section</span>
                  <span className="info-value">{result?.class_section || 'N/A'}</span>
                </div>
              </div>
              {result?.roll_number && (
                <div className="info-item">
                  <FontAwesomeIcon icon={faClipboardCheck} className="info-icon text-success" />
                  <div className="info-content">
                    <span className="info-label">Roll Number</span>
                    <span className="info-value">{result.roll_number}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="col-md-6">
              <div className="info-item">
                <FontAwesomeIcon icon={faChartLine} className="info-icon text-primary" />
                <div className="info-content">
                  <span className="info-label">Score</span>
                  <span className="info-value score-highlight">
                    {result?.total_marks_obtained || 0} / {result?.total_marks || 0}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <FontAwesomeIcon icon={faBullseye} className="info-icon text-warning" />
                <div className="info-content">
                  <span className="info-label">Percentage</span>
                  <span className={`info-value percentage-${getPercentageColor(percentage)}`}>
                    {percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="info-item">
                <FontAwesomeIcon icon={performance.icon} className={`info-icon text-${performance.color}`} />
                <div className="info-content">
                  <span className="info-label">Performance</span>
                  <Badge bg={performance.color} className="performance-badge">{performance.label}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Performance Progress */}
          <div className="performance-progress-section">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">Overall Performance</h6>
              <span className="percentage-display">{percentage.toFixed(1)}%</span>
            </div>
            <ProgressBar 
              now={percentage} 
              variant={getPercentageColor(percentage)}
              className="performance-progress-bar"
              animated
            />
          </div>
        </div>

        {/* Strengths and Areas for Improvement */}
        {(strengths.length > 0 || improvements.length > 0) && (
          <div className="row g-3 mb-4">
            {strengths.length > 0 && (
              <div className="col-md-6">
                <div className="strengths-card">
                  <h5 className="section-heading">
                    <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                    Strengths
                  </h5>
                  <ul className="strengths-list">
                    {strengths.map((strength, index) => (
                      <li key={index} className="strength-item">
                        <FontAwesomeIcon icon={faCheckCircle} className="bullet-icon" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {improvements.length > 0 && (
              <div className="col-md-6">
                <div className="improvements-card">
                  <h5 className="section-heading">
                    <FontAwesomeIcon icon={faLightbulb} className="me-2" />
                    Areas for Improvement
                  </h5>
                  <ul className="improvements-list">
                    {improvements.map((improvement, index) => (
                      <li key={index} className="improvement-item">
                        <FontAwesomeIcon icon={faLightbulb} className="bullet-icon" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Questions Summary Table - FIXED FIELD MAPPING */}
        {showQuestions && questionsEvaluation?.questions_evaluation?.length > 0 && (
          <div className="questions-summary-section mb-4">
            <h5 className="section-heading mb-3">
              <FontAwesomeIcon icon={faChartBar} className="me-2" />
              Questions Summary
            </h5>
            <div className="table-responsive">
              <Table bordered hover className="questions-summary-table">
                <thead>
                  <tr>
                    <th className="text-center">Question No.</th>
                    <th className="text-center">Marks Obtained</th>
                    <th className="text-center">Total Marks</th>
                    <th className="text-center">Percentage</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {questionsEvaluation.questions_evaluation.map((question, index) => {
                    // FIXED: Use correct field names from API
                    const marksObtained = question.total_score || 0;
                    const maxMarks = question.max_marks || 0;
                    const qPercentage = question.percentage || 0;
                    const statusClass = qPercentage >= 75 ? 'success' : qPercentage >= 50 ? 'warning' : 'danger';
                    
                    return (
                      <tr key={index}>
                        <td className="text-center fw-bold">{question.question_number || `Q${index + 1}`}</td>
                        <td className="text-center">{marksObtained}</td>
                        <td className="text-center">{maxMarks}</td>
                        <td className="text-center">
                          <Badge bg={getPercentageColor(qPercentage)}>
                            {qPercentage.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Badge bg={statusClass}>
                            {question.error_type === 'no_error' ? 'Pass' : 'Fail'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        {/* Detailed Questions Evaluation - FIXED FIELD MAPPING AND CONCEPT HANDLING */}
        {showQuestions && questionsEvaluation && (
          <div className="detailed-questions-section">
            <h5 className="section-heading mb-3">
              <FontAwesomeIcon icon={faEye} className="me-2" />
              Detailed Questions Evaluation
            </h5>

            {questionsEvaluation.questions_evaluation && questionsEvaluation.questions_evaluation.length > 0 ? (
              questionsEvaluation.questions_evaluation.map((question, index) => {
                // FIXED: Use correct field names
                const marksObtained = question.total_score || 0;
                const maxMarks = question.max_marks || 0;
                const qPercentage = question.percentage || 0;
                
                return (
                  <div key={index} className="question-card">
                    {/* Enhanced Question Header */}
                    <div className={`question-header bg-gradient-${getPercentageColor(qPercentage)}`}>
                      <div className="question-header-left">
                        <div className="question-number-badge">
                          <FontAwesomeIcon icon={faClipboardCheck} className="me-2" />
                          {question.question_number || `Q${index + 1}`}
                        </div>
                        <div className="question-status-indicator">
                          {question.error_type === 'no_error' ? (
                            <Badge bg="success" className="status-badge">
                              <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                              Correct
                            </Badge>
                          ) : (
                            <Badge bg="danger" className="status-badge">
                              <FontAwesomeIcon icon={faExclamationTriangle} className="me-1" />
                              {question.error_type || 'Error'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="question-header-right">
                        <div className="score-display-enhanced">
                          <div className="marks-obtained">
                            <span className="marks-value">{marksObtained}</span>
                            <span className="marks-separator">/</span>
                            <span className="marks-total">{maxMarks}</span>
                          </div>
                          <div className="marks-label">marks</div>
                        </div>
                        <div className="percentage-display-enhanced">
                          <div className="percentage-circle" style={{'--percentage': `${qPercentage}%`}}>
                            <span className="percentage-value">{qPercentage.toFixed(0)}</span>
                            <span className="percentage-symbol">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="question-body">
                      {/* Question Text */}
                      <div className="question-section">
                        <div className="section-header-inline">
                          <FontAwesomeIcon icon={faBullseye} className="section-icon" />
                          <strong>Question:</strong>
                        </div>
                        <div className="question-text-content">
                          <MarkdownWithMath content={question.question || 'Question not available'} />
                        </div>
                      </div>

                      {/* Concepts Required - FIXED TO HANDLE OBJECTS */}
                      {question.concepts_required && question.concepts_required.length > 0 && (
                        <div className="concepts-section">
                          <div className="section-header-inline">
                            <FontAwesomeIcon icon={faLightbulb} className="section-icon text-warning" />
                            <strong>Concepts Required:</strong>
                          </div>
                          <div className="concepts-badges">
                            {question.concepts_required.map((concept, idx) => {
                              const conceptName = getConceptName(concept);
                              const conceptDescription = getConceptDescription(concept);

                              return (
                                <div key={idx} className="concept-item">
                                  <Badge bg="info" className="concept-badge">
                                    {conceptName}
                                  </Badge>
                                  {conceptDescription && (
                                    <div className="concept-description">
                                      <MarkdownWithMath content={conceptDescription} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Mistakes and Gap Analysis */}
                      <div className="row g-3">
                        {question.mistakes_made && question.mistakes_made !== 'None' && (
                          <div className="col-md-6">
                            <Alert variant="danger" className="mistakes-alert">
                              <div className="alert-header">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                                <strong>Mistakes Made:</strong>
                              </div>
                              <div className="alert-content">
                                <MarkdownWithMath content={question.mistakes_made} />
                              </div>
                              {question.mistake_section && question.mistake_section !== 'N/A' && (
                                <div className="mistake-section-tag">
                                  <small>Section: {question.mistake_section}</small>
                                </div>
                              )}
                            </Alert>
                          </div>
                        )}

                        {question.gap_analysis && question.gap_analysis !== 'No gaps identified' && (
                          <div className="col-md-6">
                            <Alert variant="warning" className="gap-alert">
                              <div className="alert-header">
                                <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                                <strong>Gap Analysis:</strong>
                              </div>
                              <div className="alert-content">
                                <MarkdownWithMath content={question.gap_analysis} />
                              </div>
                            </Alert>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <Alert variant="warning">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                No questions evaluation data available.
              </Alert>
            )}
          </div>
        )}

        {/* Error displaying questions */}
        {questionsError && (
          <Alert variant="danger" className="mt-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {questionsError}
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer className="exam-modal-footer">
        <Button variant="secondary" onClick={onHide} className="btn-action">
          Close
        </Button>
        
        {/* PDF Download Button */}
        {showQuestions && (
          <Button
            variant="success"
            onClick={downloadPDF}
            className="btn-action btn-download"
          >
            <FontAwesomeIcon icon={faDownload} className="me-2" />
            Download PDF
          </Button>
        )}
        
        {(result?.result_id || result?.student_id || result?.id) && (
          <Button
            variant="primary"
            onClick={fetchQuestionsEvaluation}
            disabled={loadingQuestions}
            className="btn-action btn-view"
          >
            {loadingQuestions ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Loading...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faEye} className="me-2" />
                View Questions
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ExamDetailsModal;