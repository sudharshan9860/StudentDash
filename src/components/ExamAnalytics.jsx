///ExamAnalytics.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { AuthContext } from "./AuthContext";
import StudentExamDetails from "./StudentExamDetails";
import PdfModal from "./PdfModal";
import "./ExamAnalytics.css";
import QuestionWiseTable from "./QuestionWiseTable";

// FIXED: Correct import for jsPDF with autoTable
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ExamAnalytics = () => {
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);

  // State management
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [studentResults, setStudentResults] = useState([]);
  const [examStats, setExamStats] = useState(null);
  const [studentOwnResults, setStudentOwnResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [editingRow, setEditingRow] = useState(null);
  const [editedMarks, setEditedMarks] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  // Modal state for student details
  const [selectedStudentResult, setSelectedStudentResult] = useState(null);
  const [showStudentDetailsModal, setShowStudentDetailsModal] = useState(false);

  // PDF Modal state
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState("");
  const [selectedPdfTitle, setSelectedPdfTitle] = useState("");

  const [showQuestionWiseTable, setShowQuestionWiseTable] = useState(false);

  useEffect(() => {
    if (role === "teacher") {
      fetchTeacherExams();
    } else if (role === "student") {
      fetchStudentResults();
    }
  }, [role]);

  const fetchTeacherExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/exam-details/");
      setExams(response.data.exams || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setError(
        error.response?.status === 403
          ? "Access denied. Only teachers can view this page."
          : "Failed to fetch exams. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchExamResults = async (examId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(
        `/student-results/?exam_id=${examId}`,
      );
      setStudentResults(response.data.student_results || []);
      setExamStats({
        examName: response.data.exam,
        examType: response.data.exam_type,
        classSection: response.data.class_section,
        totalStudents: response.data.total_students,
      });
      setViewMode("details");
    } catch (error) {
      console.error("Error fetching exam results:", error);
      setError("Failed to fetch exam results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/student-results/");
      setStudentOwnResults(response.data.results || []);
    } catch (error) {
      console.error("Error fetching student results:", error);
      setError("Failed to fetch your results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRowClick = (studentResult) => {
    // Prevent modal from opening if clicking on edit buttons
    if (editingRow === studentResult.student_result_id) {
      return;
    }

    // Transform the data to match the expected format
    const transformedData = {
      result_id: studentResult.student_result_id,
      exam_name: selectedExam.name,
      exam_type: selectedExam.exam_type,
      class_section: examStats?.classSection || "N/A",
      student_fullname: studentResult.student_fullname,
      student_name: studentResult.student_name,
      roll_number: studentResult.roll_number,
      total_marks_obtained: studentResult.total_marks_obtained,
      total_max_marks: studentResult.total_max_marks,
      overall_percentage: studentResult.overall_percentage,
      grade: studentResult.grade,
      strengths: studentResult.strengths,
      areas_for_improvement: studentResult.areas_for_improvement,
      detailed_analysis: studentResult.detailed_analysis,
      remedial_action: studentResult.remedial_action,
    };

    setSelectedStudentResult(transformedData);
    setShowStudentDetailsModal(true);
  };

  const handleCloseStudentDetails = () => {
    setSelectedStudentResult(null);
    setShowStudentDetailsModal(false);
  };

  // Helper to extract PDF URL from answer_sheet_snapshot (handles multiple formats)
  const getAnswerSheetUrl = (snapshot) => {
    if (!snapshot) return null;

    // Case 1: Direct string URL
    if (typeof snapshot === "string") {
      return snapshot;
    }

    // Case 2: Object with file_url property
    if (
      typeof snapshot === "object" &&
      !Array.isArray(snapshot) &&
      snapshot.file_url
    ) {
      return snapshot.file_url;
    }

    // Case 3: Array of objects with file_url
    if (
      Array.isArray(snapshot) &&
      snapshot.length > 0 &&
      snapshot[0].file_url
    ) {
      return snapshot[0].file_url;
    }

    return null;
  };

  // PDF Modal handlers
  const handleViewAnswerSheet = (e, result) => {
    e.stopPropagation();
    const pdfUrl = getAnswerSheetUrl(result.answer_sheet_snapshot);
    if (pdfUrl) {
      setSelectedPdfUrl(pdfUrl);
      setSelectedPdfTitle(
        `Answer Sheet - ${result.student_fullname || result.student_name || "Student"}`,
      );
      setPdfModalOpen(true);
    }
  };

  // Helper to check if answer sheet exists
  const hasAnswerSheet = (result) => {
    return !!getAnswerSheetUrl(result.answer_sheet_snapshot);
  };

  // Helper to check if question paper exists
  const hasQuestionPaper = (exam) => {
    return (
      exam?.question_paper_snapshot &&
      exam.question_paper_snapshot.length > 0 &&
      exam.question_paper_snapshot[0].file_url
    );
  };

  // Handler to view question paper
  const handleViewQuestionPaper = () => {
    if (hasQuestionPaper(selectedExam)) {
      setSelectedPdfUrl(selectedExam.question_paper_snapshot[0].file_url);
      setSelectedPdfTitle(`Question Paper - ${selectedExam.name}`);
      setPdfModalOpen(true);
    }
  };

  const handleClosePdfModal = () => {
    setPdfModalOpen(false);
    setSelectedPdfUrl("");
    setSelectedPdfTitle("");
  };

  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
    fetchExamResults(exam.id);
    setShowQuestionWiseTable(false);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedExam(null);
    setStudentResults([]);
    setExamStats(null);
    setEditingRow(null);
    setUpdateSuccess(null);
    setShowQuestionWiseTable(false);
  };

  const handleEditClick = (e, result) => {
    e.stopPropagation();
    setEditingRow(result.student_result_id);
    setEditedMarks(result.total_marks_obtained.toString());
    setUpdateSuccess(null);
    setError(null);
  };

  const handleCancelEdit = (e) => {
    if (e) e.stopPropagation();
    setEditingRow(null);
    setEditedMarks("");
    setUpdateSuccess(null);
    setError(null);
  };

  const handleSaveMarks = async (e, studentResultId, maxMarks) => {
    if (e) e.stopPropagation();

    const marksValue = Number(editedMarks);

    if (isNaN(marksValue)) {
      setError("Please enter a valid number for marks");
      return;
    }

    if (marksValue < 0) {
      setError("Marks cannot be negative");
      return;
    }

    if (marksValue > maxMarks) {
      setError(`Marks cannot exceed maximum marks (${maxMarks})`);
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);

      const formData = new FormData();
      formData.append("student_result_id", studentResultId);
      formData.append("updated_marks", marksValue);

      let response = await axiosInstance.post(
        "/update-student-result/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setUpdateSuccess("Successfully updated marks!");
      await fetchExamResults(selectedExam.id);
      setEditingRow(null);
      setEditedMarks("");
      setTimeout(() => setUpdateSuccess(null), 3000);
    } catch (error) {
      console.error("Error updating marks:", error);
      let errorMessage = "Failed to update marks. ";
      if (error.response?.status === 404) {
        errorMessage += "API endpoint not found.";
      } else if (error.response?.status === 403) {
        errorMessage += "Access denied.";
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else {
        errorMessage += "Please try again.";
      }
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };
  // ========================================
  // PDF HELPER FUNCTIONS
  // ========================================

  const processQuestionDataForPDF = (rawData) => {
    const questionMap = {};

    rawData.forEach((record) => {
      const qNum = record.question_number;

      if (!questionMap[qNum]) {
        questionMap[qNum] = {
          question_number: qNum,
          max_marks: record.max_marks,
          correct: 0,
          partial: 0,
          wrong: 0,
          total_students: 0,
        };
      }

      const percentage = record.percentage;
      if (percentage >= 90) {
        questionMap[qNum].correct++;
      } else if (percentage >= 40) {
        questionMap[qNum].partial++;
      } else {
        questionMap[qNum].wrong++;
      }

      questionMap[qNum].total_students++;
    });

    const processedData = Object.values(questionMap).map((q) => {
      const avgPercentage =
        q.total_students > 0
          ? ((q.correct + q.partial * 0.5) / q.total_students) * 100
          : 0;

      return {
        ...q,
        average_percentage: avgPercentage,
      };
    });

    processedData.sort((a, b) => a.question_number - b.question_number);
    return processedData;
  };

  const fetchQuestionWiseDataForPDF = async (examId) => {
    try {
      const response = await axiosInstance.post(
        "api/question-wise-performance/",
        {
          exam_id: examId,
        },
      );

      if (response.data.students_question_data) {
        return processQuestionDataForPDF(response.data.students_question_data);
      }
      return [];
    } catch (error) {
      console.error("Error fetching question-wise data for PDF:", error);
      return [];
    }
  };

  // ========================================
  // MAIN PDF DOWNLOAD FUNCTION
  // ========================================

  const handleDownloadPDF = async () => {
    try {
      setError(null);

      // Fetch question-wise data
      const questionWiseData = await fetchQuestionWiseDataForPDF(
        selectedExam.id,
      );

      const doc = new jsPDF();
      let yPos = 20;

      // ========================================
      // TITLE AND HEADER
      // ========================================
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Exam Analytics Report", 105, yPos, { align: "center" });
      yPos += 12;

      // Exam metadata
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Exam: ${selectedExam.name}`, 20, yPos);
      yPos += 7;
      doc.text(`Type: ${selectedExam.exam_type}`, 20, yPos);
      yPos += 7;
      doc.text(`Class: ${examStats?.classSection}`, 20, yPos);
      yPos += 7;
      doc.text(`Total Students: ${examStats?.totalStudents}`, 20, yPos);
      yPos += 7;
      doc.text(
        `Average Score: ${selectedExam.average_score.toFixed(2)}%`,
        20,
        yPos,
      );
      yPos += 7;
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPos);
      yPos += 15;

      // ========================================
      // SECTION 1: QUESTION-WISE PERFORMANCE (FIRST)
      // ========================================
      if (questionWiseData.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Question-Wise Performance Analysis", 20, yPos);
        yPos += 7;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Performance breakdown for each question", 20, yPos);
        yPos += 10;

        // Question-wise table data
        const questionTableData = questionWiseData.map((q) => [
          `Q${q.question_number}`,
          q.max_marks,
          q.correct,
          q.partial,
          q.wrong,
          q.total_students,
          `${q.average_percentage.toFixed(1)}%`,
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [
            [
              "Question",
              "Max Marks",
              "Correct (>=90%)",
              "Partial (40-89%)",
              "Wrong (<40%)",
              "Total",
              "Avg %",
            ],
          ],
          body: questionTableData,
          theme: "grid",
          headStyles: {
            fillColor: [99, 102, 241],
            textColor: 255,
            fontStyle: "bold",
            fontSize: 9,
          },
          styles: {
            fontSize: 9,
            halign: "center",
            cellPadding: 3,
          },
          columnStyles: {
            0: { cellWidth: 25, fontStyle: "bold" },
            1: { cellWidth: 25 },
            2: { cellWidth: 28, fillColor: [209, 250, 229] },
            3: { cellWidth: 28, fillColor: [254, 243, 199] },
            4: { cellWidth: 28, fillColor: [254, 226, 226] },
            5: { cellWidth: 20 },
            6: { cellWidth: 25, fontStyle: "bold" },
          },
          didParseCell: function (data) {
            // Color-code average percentage column
            if (data.column.index === 6 && data.section === "body") {
              const percentage = parseFloat(data.cell.raw);
              if (percentage >= 75) {
                data.cell.styles.textColor = [16, 185, 129]; // Green
              } else if (percentage >= 50) {
                data.cell.styles.textColor = [245, 158, 11]; // Orange
              } else {
                data.cell.styles.textColor = [239, 68, 68]; // Red
              }
            }
          },
        });

        yPos = doc.lastAutoTable.finalY + 10;

        // ========================================
        // SUMMARY STATISTICS BOX
        // ========================================
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }

        const overallAvg =
          questionWiseData.reduce((sum, q) => sum + q.average_percentage, 0) /
          questionWiseData.length;
        const totalQuestions = questionWiseData.length;
        const totalCorrect = questionWiseData.reduce(
          (sum, q) => sum + q.correct,
          0,
        );
        const totalPartial = questionWiseData.reduce(
          (sum, q) => sum + q.partial,
          0,
        );
        const totalWrong = questionWiseData.reduce(
          (sum, q) => sum + q.wrong,
          0,
        );

        // Draw summary box
        doc.setFillColor(243, 244, 246);
        doc.rect(15, yPos, 180, 35, "F");

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Summary Statistics", 20, yPos + 8);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Questions: ${totalQuestions}`, 20, yPos + 18);
        doc.text(`Overall Average: ${overallAvg.toFixed(1)}%`, 20, yPos + 25);

        doc.text(`Total Correct: ${totalCorrect}`, 110, yPos + 18);
        doc.text(`Total Partial: ${totalPartial}`, 110, yPos + 25);

        doc.text(`Total Wrong: ${totalWrong}`, 160, yPos + 18);

        yPos += 45; // Add space after summary box
      }

      // ========================================
      // SECTION 2: STUDENT-WISE RESULTS (SECOND)
      // ========================================

      // Check if new page needed
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      // FIXED: Removed emoji that was causing encoding issue
      doc.text("Student-Wise Results", 20, yPos);
      yPos += 10;

      const studentTableData = studentResults.map((result, index) => [
        index + 1,
        result.student_fullname || result.student_name || "N/A",
        result.roll_number || "N/A",
        `${result.total_marks_obtained}/${result.total_max_marks}`,
        `${result.overall_percentage.toFixed(1)}%`,
        result.grade || "N/A",
        result.strengths || "N/A",
        result.areas_for_improvement || "N/A",
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [
          [
            "#",
            "Student Name",
            "Roll",
            "Marks",
            "%",
            "Grade",
            "Strengths",
            "Improvements",
          ],
        ],
        body: studentTableData,
        theme: "grid",
        headStyles: {
          fillColor: [139, 92, 246],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9,
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: "linebreak",
          halign: "left",
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 35 },
          2: { cellWidth: 20, halign: "center" },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 15, halign: "center" },
          5: { cellWidth: 15, halign: "center" },
          6: { cellWidth: 35, fontSize: 7 },
          7: { cellWidth: 35, fontSize: 7 },
        },
      });

      // ========================================
      // FOOTER ON ALL PAGES
      // ========================================
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text(
          `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()} | Page ${i} of ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: "center" },
        );
      }

      // ========================================
      // SAVE PDF
      // ========================================
      const filename = `${selectedExam.name.replace(/[^a-z0-9]/gi, "_")}_Complete_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error("PDF generation error:", error);
      setError(`PDF generation failed: ${error.message}`);
    }
  };

  const handleDownloadParentNotesCSV = () => {
    try {
      setError(null);

      // Create CSV content with headers
      const headers = [
        "Rank",
        "Exam Name",
        "Student Name",
        "Class",
        "Parent Notes",
      ];
      const rows = studentResults.map((result, index) => [
        index + 1,
        selectedExam.name,
        result.student_fullname || result.student_name || "N/A",
        examStats?.classSection || selectedExam.class_section || "N/A",
        result.parent_note || "N/A",
      ]);

      // Escape and format CSV cells properly
      const escapeCSV = (cell) => {
        const str = String(cell);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map(escapeCSV).join(",")),
      ].join("\n");

      // Create blob and trigger download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${selectedExam.name.replace(/[^a-z0-9]/gi, "_")}_parent_notes.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating CSV:", error);
      setError("Failed to generate parent notes CSV file.");
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      "A+": "#10b981",
      A: "#16a34a",
      "B+": "#3b82f6",
      B: "#2563eb",
      "C+": "#06b6d4",
      C: "#f59e0b",
      D: "#ef4444",
      F: "#dc2626",
    };
    return colors[grade] || "#6b7280";
  };

  const getPerformanceClass = (percentage) => {
    if (percentage >= 90) return "excellent";
    if (percentage >= 75) return "good";
    if (percentage >= 60) return "average";
    if (percentage >= 40) return "below-average";
    return "poor";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreateExam = () => {
    if (window.handleExamCorrectionView) {
      window.handleExamCorrectionView();
    } else {
      navigate("/exam-correction");
    }
  };

  if (loading && exams.length === 0 && studentOwnResults.length === 0) {
    return (
      <div className="exam-analytics-fullscreen">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading exam data...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // STUDENT VIEW
  // ========================================
  if (role === "student") {
    return (
      <div className="exam-analytics-dashboard">
        <div className="exam-analytics-header">
          <div className="header-content">
            <div className="header-icon student">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h1 className="exam-header-title">📊 My Exam Results</h1>
              <p className="header-subtitle">
                View your exam performance and detailed feedback
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {studentOwnResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No Exam Results Yet</h3>
            <p>
              Your exam results will appear here once they are graded by your
              teacher.
            </p>
          </div>
        ) : (
          <div className="exams-grid">
            {studentOwnResults.map((result) => (
              <div
                key={result.result_id}
                className="exam-card"
                onClick={() => {
                  setSelectedStudentResult(result);
                  setShowStudentDetailsModal(true);
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="exam-card-header">
                  <h3 className="exam-name">{result.exam_name}</h3>
                  <span
                    className={`exam-type-badge ${result.exam_type?.toLowerCase() || "mixed"}`}
                  >
                    {result.exam_type || "EXAM"}
                  </span>
                </div>
                <div className="exam-info">
                  <div className="info-row">
                    <span className="info-label">Score:</span>
                    <span className="info-value">
                      {Math.round(result.total_marks_obtained || 0)} /{" "}
                      {Math.round(result.total_max_marks || 0)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Percentage:</span>
                    <span
                      className={`info-value ${getPerformanceClass(result.overall_percentage || 0)}`}
                    >
                      {result.overall_percentage?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Grade:</span>
                    <span
                      className="info-value"
                      style={{ color: getGradeColor(result.grade) }}
                    >
                      {result.grade || "N/A"}
                    </span>
                  </div>
                </div>
                <button className="view-details-btn">
                  View Detailed Report →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Student Details Modal */}
        {showStudentDetailsModal && selectedStudentResult && (
          <div className="modal-overlay" onClick={handleCloseStudentDetails}>
            <div
              className="modal-content-large"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>📋 Exam Details - {selectedStudentResult.exam_name}</h2>
                <button
                  className="modal-close-btn"
                  onClick={handleCloseStudentDetails}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <StudentExamDetails
                  studentResultId={selectedStudentResult.result_id}
                  studentName="Me"
                  examName={selectedStudentResult.exam_name}
                  isTeacherView={false}
                  summaryData={selectedStudentResult}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={handleCloseStudentDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================
  // TEACHER LIST VIEW
  // ========================================
  if (role === "teacher" && viewMode === "list") {
    return (
      <div className="exam-analytics-dashboard">
        <div className="exam-analytics-header">
          <div className="header-content">
            <div className="header-icon teacher">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <h1 className="exam-header-title">📊 Exam Analytics</h1>
              <p className="header-subtitle">
                View and analyze all your exam results
              </p>
            </div>
          </div>
          <button className="create-exam-btn" onClick={handleCreateExam}>
            <span>➕</span> Create New Exam
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {exams.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No Exams Created Yet</h3>
            <p>
              Create your first exam to start grading and analyzing student
              performance.
            </p>
            <button className="btn btn-primary" onClick={handleCreateExam}>
              <span>➕</span> Create First Exam
            </button>
          </div>
        ) : (
          <div className="exams-grid">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="exam-card"
                onClick={() => handleExamSelect(exam)}
              >
                <div className="exam-card-header">
                  <h3 className="exam-name">{exam.name}</h3>
                  <span
                    className={`exam-type-badge ${exam.exam_type.toLowerCase()}`}
                  >
                    {exam.exam_type}
                  </span>
                </div>
                <div className="exam-info">
                  <div className="info-row">
                    <span className="info-label">Class:</span>
                    <span className="info-value">{exam.class_section}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Students:</span>
                    <span className="info-value">{exam.total_students}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Avg Score:</span>
                    <span
                      className={`info-value ${getPerformanceClass(exam.average_score)}`}
                    >
                      {exam.average_score.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="exam-dates">
                  <div className="date-item">
                    <span className="date-label">Created:</span>
                    <span className="date-value">
                      {formatDate(exam.created_at)}
                    </span>
                  </div>
                  {exam.processed_at && (
                    <div className="date-item">
                      <span className="date-label">Processed:</span>
                      <span className="date-value">
                        {formatDate(exam.processed_at)}
                      </span>
                    </div>
                  )}
                </div>
                <button className="view-details-btn">View Details →</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ========================================
  // TEACHER DETAILS VIEW
  // ========================================
  if (role === "teacher" && viewMode === "details" && selectedExam) {
    return (
      <div className="exam-analytics-dashboard">
        <div className="exam-analytics-header">
          <div className="header-content">
            <button className="back-btn" onClick={handleBackToList}>
              ← Back
            </button>
            <div>
              <h1 className="header-title">{selectedExam.name}</h1>
              <p className="header-subtitle">
                {examStats?.classSection} • {examStats?.totalStudents} Students
                • {selectedExam.exam_type}
              </p>
            </div>
          </div>
          <div className="header-buttons">
            {hasQuestionPaper(selectedExam) && (
              <button
                className="view-qp-btn"
                onClick={handleViewQuestionPaper}
                title="View Question Paper"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Question Paper</span>
              </button>
            )}
            <button
              className="parent-notes-btn"
              onClick={handleDownloadParentNotesCSV}
              disabled={studentResults.length === 0}
              title="Download Parent Notes CSV"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <polyline points="9 15 12 18 15 15" />
              </svg>
              <span>Parent Note</span>
            </button>
            <button
              className="download-pdf-btn"
              onClick={handleDownloadPDF}
              disabled={studentResults.length === 0}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {updateSuccess && (
          <div className="alert alert-success">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{updateSuccess}</span>
          </div>
        )}

        {studentResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Results Available</h3>
            <p>
              Results are still being processed or no submissions were found.
            </p>
          </div>
        ) : (
          <>
            {/* QUESTION-WISE PERFORMANCE TABLE - NEW */}
            {viewMode === "details" && selectedExam && (
              <QuestionWiseTable
                examId={selectedExam.id}
                examName={selectedExam.name}
              />
            )}
            {/* STUDENT RESULTS TABLE - SECOND */}
            <div className="results-table-container-fixed">
              <table className="results-table-fixed">
                <thead>
                  <tr>
                    <th className="col-number">#</th>
                    <th className="col-name">Full Name</th>
                    <th className="col-marks">Marks</th>
                    <th className="col-max">Max</th>
                    <th className="col-percentage">%</th>
                    <th className="col-grade">Grade</th>
                    <th className="col-strengths">Strengths</th>
                    <th className="col-improvements">Areas for Improvement</th>
                    <th className="col-sheet">Answer Sheet</th>
                    <th className="col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentResults.map((result, index) => (
                    <tr
                      key={result.student_result_id}
                      onClick={() => handleStudentRowClick(result)}
                      className="student-row-hover"
                      title="Click to view detailed evaluation"
                    >
                      <td>{index + 1}</td>
                      <td>
                        <div className="student-name-cell">
                          <span className="student-fullname">
                            {result.student_fullname ||
                              result.student_name ||
                              "N/A"}
                          </span>
                          <span className="roll-subtitle">
                            Roll: {result.roll_number || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="col-marks">
                        {editingRow === result.student_result_id ? (
                          <div
                            className="edit-marks-cell"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="number"
                              className="edit-marks-input"
                              value={editedMarks}
                              onChange={(e) => setEditedMarks(e.target.value)}
                              min="0"
                              max={result.total_max_marks}
                              step="0.5"
                              disabled={isUpdating}
                            />
                          </div>
                        ) : (
                          <span>{result.total_marks_obtained || 0}</span>
                        )}
                      </td>
                      <td className="col-max">{result.total_max_marks || 0}</td>
                      <td className="col-percentage">
                        <span
                          className={`percentage-badge ${getPerformanceClass(result.overall_percentage || 0)}`}
                        >
                          {result.overall_percentage?.toFixed(2) || 0}%
                        </span>
                      </td>
                      <td className="col-grade">
                        <span
                          className="grade-badge"
                          style={{
                            backgroundColor: getGradeColor(result.grade),
                          }}
                        >
                          {result.grade || "N/A"}
                        </span>
                      </td>
                      <td className="col-strengths">
                        <div className="insights-text">
                          {result.strengths || "N/A"}
                        </div>
                      </td>
                      <td className="col-improvements">
                        <div className="insights-text">
                          {result.areas_for_improvement || "N/A"}
                        </div>
                      </td>
                      <td
                        className="col-sheet"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {hasAnswerSheet(result) ? (
                          <button
                            className="view-sheet-btn"
                            onClick={(e) => handleViewAnswerSheet(e, result)}
                            title="View Answer Sheet"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            <span>View</span>
                          </button>
                        ) : (
                          <span className="no-sheet-badge">N/A</span>
                        )}
                      </td>
                      <td
                        className="col-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {editingRow === result.student_result_id ? (
                          <div className="edit-actions">
                            <button
                              className="save-btn"
                              onClick={(e) =>
                                handleSaveMarks(
                                  e,
                                  result.student_result_id,
                                  result.total_max_marks,
                                )
                              }
                              disabled={isUpdating}
                              title="Save"
                            >
                              {isUpdating ? (
                                <span className="spinner-small"></span>
                              ) : (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                            <button
                              className="cancel-btn"
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              title="Cancel"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            className="edit-btn"
                            onClick={(e) => handleEditClick(e, result)}
                            title="Edit marks"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Teacher Details Modal */}
        {showStudentDetailsModal && selectedStudentResult && (
          <div className="modal-overlay" onClick={handleCloseStudentDetails}>
            <div
              className="modal-content-large"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header1">
                <h2>
                  📋 Detailed Evaluation -{" "}
                  {selectedStudentResult.student_fullname ||
                    selectedStudentResult.student_name}
                </h2>
                <button
                  className="modal-close-btn"
                  onClick={handleCloseStudentDetails}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <StudentExamDetails
                  studentResultId={selectedStudentResult.result_id}
                  studentName={
                    selectedStudentResult.student_fullname ||
                    selectedStudentResult.student_name
                  }
                  examName={selectedExam.name}
                  isTeacherView={true}
                  summaryData={selectedStudentResult}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary download-pdf-modal-btn"
                  onClick={() => {
                    if (window.downloadStudentExamPDF) {
                      window.downloadStudentExamPDF();
                    } else {
                      alert(
                        "PDF download function not available. Please try again.",
                      );
                    }
                  }}
                >
                  📄 Download PDF
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCloseStudentDetails}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Modal */}
        <PdfModal
          isOpen={pdfModalOpen}
          onClose={handleClosePdfModal}
          pdfUrl={selectedPdfUrl}
          title={selectedPdfTitle}
        />
      </div>
    );
  }

  return null;
};

export default ExamAnalytics;
