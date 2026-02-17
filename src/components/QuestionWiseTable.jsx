// src/components/QuestionWiseTable.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import "./QuestionWiseTable.css";

const QuestionWiseTable = ({ examId, examName }) => {
  const [questionData, setQuestionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    if (examId) {
      fetchQuestionWiseData();
    }
  }, [examId]);

  const fetchQuestionWiseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.post(
        "api/question-wise-performance/",
        {
          exam_id: examId,
        },
      );

      console.log("Question-wise API Response:", response.data);

      if (response.data.students_question_data) {
        processQuestionData(response.data.students_question_data);
      } else if (response.data.message) {
        setError(response.data.message);
        setQuestionData([]);
      }
    } catch (error) {
      console.error("Error fetching question-wise data:", error);
      setError("Failed to fetch question-wise performance data");
      setQuestionData([]);
    } finally {
      setLoading(false);
    }
  };

  const processQuestionData = (rawData) => {
    // Group by question number
    const questionMap = {};

    rawData.forEach((record) => {
      const qNum = record.question_number;

      if (!questionMap[qNum]) {
        questionMap[qNum] = {
          question_number: qNum,
          max_marks: record.max_marks,
          students: [],
          correct: 0,
          partial: 0,
          wrong: 0,
          total_students: 0,
        };
      }

      questionMap[qNum].students.push({
        student_result_id: record.student_result_id,
        student_fullname: record.student_fullname,
        obtained_marks: record.obtained_marks,
        max_marks: record.max_marks,
        percentage: record.percentage,
      });

      // Classify performance
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

    // Convert to array and calculate averages
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

    // Sort by question number
    processedData.sort((a, b) => a.question_number - b.question_number);

    setQuestionData(processedData);
  };

  const toggleExpand = (questionNumber) => {
    setExpandedQuestion(
      expandedQuestion === questionNumber ? null : questionNumber,
    );
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 75) return "#10b981"; // Green
    if (percentage >= 50) return "#f59e0b"; // Orange
    return "#ef4444"; // Red
  };

  if (loading) {
    return (
      <div className="question-wise-loading">
        <div className="spinner-large"></div>
        <p>Loading question-wise analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-info">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (questionData.length === 0) {
    return (
      <div className="alert alert-info">
        <span>No question-wise data available for this exam.</span>
      </div>
    );
  }

  return (
    <div className="question-wise-container">
      <div className="question-wise-header">
        <h3>📊 Question-Wise Performance Analysis</h3>
        <p className="subtitle">Performance breakdown for each question</p>
      </div>

      <div className="question-wise-table-wrapper">
        <table className="question-wise-table">
          <thead>
            <tr>
              <th className="th-expand"></th>
              <th className="th-question">Question #</th>
              <th className="th-max-marks">Max Marks</th>
              <th className="th-correct">
                Correct
                <br />
                (≥90%)
              </th>
              <th className="th-partial">
                Partial
                <br />
                (40-89%)
              </th>
              <th className="th-wrong">
                Wrong
                <br />
                (&lt;40%)
              </th>
              <th className="th-total">Total Students</th>
              <th className="th-avg">Avg Performance</th>
            </tr>
          </thead>
          <tbody>
            {questionData.map((question) => (
              <React.Fragment key={question.question_number}>
                <tr
                  className="question-row"
                  onClick={() => toggleExpand(question.question_number)}
                  style={{ cursor: "pointer" }}
                >
                  <td className="td-expand">
                    <span
                      className={`expand-icon ${expandedQuestion === question.question_number ? "expanded" : ""}`}
                    >
                      ▶
                    </span>
                  </td>
                  <td className="td-question">
                    <strong>Q{question.question_number}</strong>
                  </td>
                  <td className="td-max-marks">{question.max_marks}</td>
                  <td className="td-correct">
                    <span className="badge badge-correct">
                      {question.correct}
                    </span>
                  </td>
                  <td className="td-partial">
                    <span className="badge badge-partial">
                      {question.partial}
                    </span>
                  </td>
                  <td className="td-wrong">
                    <span className="badge badge-wrong">{question.wrong}</span>
                  </td>
                  <td className="td-total">{question.total_students}</td>
                  <td className="td-avg">
                    <div className="performance-bar-container">
                      <div
                        className="performance-bar"
                        style={{
                          width: `${question.average_percentage}%`,
                          backgroundColor: getPerformanceColor(
                            question.average_percentage,
                          ),
                        }}
                      ></div>
                      <span
                        className="percentage-text"
                        style={{
                          color: getPerformanceColor(
                            question.average_percentage,
                          ),
                        }}
                      >
                        {question.average_percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>

                {/* Expanded Row - Student Details */}
                {expandedQuestion === question.question_number && (
                  <tr className="expanded-row">
                    <td colSpan="8">
                      <div className="student-details-container">
                        <h4>
                          Students who attempted Q{question.question_number}:
                        </h4>
                        <div className="student-grid">
                          {question.students.map((student) => (
                            <div
                              key={student.student_result_id}
                              className="student-card"
                            >
                              <div className="student-name">
                                {student.student_fullname}
                              </div>
                              <div className="student-marks">
                                {student.obtained_marks}/{student.max_marks}
                                <span
                                  className="student-percentage"
                                  style={{
                                    color: getPerformanceColor(
                                      student.percentage,
                                    ),
                                  }}
                                >
                                  ({student.percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Statistics */}
      <div className="question-wise-summary">
        <div className="summary-card">
          <span className="summary-label">Total Questions:</span>
          <span className="summary-value">{questionData.length}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Overall Avg:</span>
          <span
            className="summary-value"
            style={{
              color: getPerformanceColor(
                questionData.reduce((sum, q) => sum + q.average_percentage, 0) /
                  questionData.length,
              ),
            }}
          >
            {(
              questionData.reduce((sum, q) => sum + q.average_percentage, 0) /
              questionData.length
            ).toFixed(1)}
            %
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuestionWiseTable;
