import React, { useState, useEffect } from 'react';
import './ProgressTab.css';
import axiosInstance from '../api/axiosInstance';

const ProgressTab = ({ teacherData, progressData, selectedClass, onClassChange, availableStudents }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Filter states
  const [performanceTrend, setPerformanceTrend] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [maxPerformance, setMaxPerformance] = useState(100);
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  
  // Available options
  const [availableTopics, setAvailableTopics] = useState([]);
  const [classes, setClasses] = useState([]);
  const [homeworkData, setHomeworkData] = useState({});

  useEffect(() => {
    loadInitialData();
  }, [teacherData, availableStudents]);

  useEffect(() => {
    if (progressData) {
      fetchHomeworkDataForStudents();
    }
  }, [progressData]);

  const loadInitialData = () => {
    // Load classes from localStorage or props
    const savedClasses = localStorage.getItem('classes');
    const savedStudents = localStorage.getItem('students');
    
    if (savedClasses) {
      const classData = JSON.parse(savedClasses);
      setClasses(classData);
    } else if (teacherData?.classes) {
      setClasses(teacherData.classes);
    }
    
    // Load students
    if (savedStudents) {
      const studentData = JSON.parse(savedStudents);
      processStudentData(studentData);
    } else if (availableStudents && availableStudents.length > 0) {
      processStudentData(availableStudents);
    }
    
    setDataLoading(false);
  };

  const processStudentData = (studentList) => {
    const processedStudents = studentList.map(student => {
      const studentId = typeof student === 'string' ? student : student.id;
      return {
        id: studentId,
        name: studentId,
        rollNo: studentId,
        overallPerformance: 0,
        performanceTrend: 'No Data',
        homeworkAttendance: 0,
        activeTime: 0,
        topics: [],
        homeworks: []
      };
    });
    
    setStudents(processedStudents);
    setFilteredStudents(processedStudents);
  };

  const fetchHomeworkDataForStudents = async () => {
    try {
      // Fetch homework codes
      const homeworkListResponse = await axiosInstance.get('/all-homeworks-codes/');
      
      if (homeworkListResponse.data && homeworkListResponse.data.homework_codes) {
        const homeworkCodes = homeworkListResponse.data.homework_codes;
        const studentHomeworkData = {};
        const topicsSet = new Set();
        
        // Fetch details for each homework
        for (const homework of homeworkCodes) {
          const homework_code = Array.isArray(homework) ? homework[0] : homework;
          
          try {
            const [submissionsResponse, questionsResponse] = await Promise.all([
              axiosInstance.get('/homework-details/', { params: { homework_code } }),
              axiosInstance.get('/homework-questions/', { params: { homework_code } })
            ]);
            
            const submissions = submissionsResponse.data[homework_code] || [];
            const questions = questionsResponse.data;
            
            // Add topic to set
            if (questions.title) {
              topicsSet.add(questions.title);
            }
            
            // Process submissions for each student
            submissions.forEach(submission => {
              const studentId = submission.student_id;
              
              if (!studentHomeworkData[studentId]) {
                studentHomeworkData[studentId] = {
                  homeworks: [],
                  topics: new Set(),
                  scores: []
                };
              }
              
              // Calculate homework score
              let totalScore = 0;
              let maxScore = 0;
              
              if (submission.result_json && submission.result_json.questions) {
                submission.result_json.questions.forEach(q => {
                  totalScore += (q.total_score || q.total_marks_obtained || 0);
                  maxScore += (q.max_score || q.max_marks || 0);
                });
              }
              
              const score = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
              
              studentHomeworkData[studentId].homeworks.push({
                id: homework_code,
                date: homework[1] || 'N/A',
                score: score,
                submission: submission
              });
              
              studentHomeworkData[studentId].scores.push(score);
              
              if (questions.title) {
                studentHomeworkData[studentId].topics.add(questions.title);
              }
            });
          } catch (error) {
            console.error(`Error fetching homework ${homework_code}:`, error);
          }
        }
        
        // Update available topics
        setAvailableTopics(Array.from(topicsSet));
        
        // Update student data with homework information
        const updatedStudents = students.map(student => {
          const hwData = studentHomeworkData[student.id];
          
          if (hwData) {
            const avgScore = hwData.scores.length > 0 
              ? hwData.scores.reduce((a, b) => a + b, 0) / hwData.scores.length 
              : 0;
            
            return {
              ...student,
              homeworks: hwData.homeworks,
              topics: Array.from(hwData.topics),
              overallPerformance: avgScore,
              homeworkAttendance: hwData.homeworks.length,
              performanceTrend: determinePerformanceTrend(hwData.scores)
            };
          }
          
          return student;
        });
        
        setStudents(updatedStudents);
        setHomeworkData(studentHomeworkData);
      }
    } catch (error) {
      console.error('Error fetching homework data:', error);
    }
  };

  const determinePerformanceTrend = (scores) => {
    if (scores.length === 0) return 'No Data';
    if (scores.length === 1) return 'Only-1 Submission';
    
    const recentScores = scores.slice(-3);
    let improving = 0;
    let declining = 0;
    
    for (let i = 1; i < recentScores.length; i++) {
      if (recentScores[i] > recentScores[i - 1]) improving++;
      else if (recentScores[i] < recentScores[i - 1]) declining++;
    }
    
    if (improving > declining) return 'Improving';
    if (declining > improving) return 'Declining';
    return 'Stagnant';
  };

  useEffect(() => {
    // Apply filters
    let filtered = [...students];
    
    // Filter by performance trend (if selected)
    if (performanceTrend.length > 0) {
      filtered = filtered.filter(student => 
        performanceTrend.includes(student.performanceTrend)
      );
    }
    
    // Filter by topics (if selected)
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(student => 
        student.topics && student.topics.some(topic => 
          selectedTopics.includes(topic)
        )
      );
    }
    
    // Filter by max performance
    filtered = filtered.filter(student => 
      (student.overallPerformance || 0) <= maxPerformance
    );
    
    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        
        switch(sortBy) {
          case 'studentId':
            aVal = a.id || '';
            bVal = b.id || '';
            return sortOrder === 'highToLow' 
              ? bVal.localeCompare(aVal)
              : aVal.localeCompare(bVal);
          case 'overallPerformance':
            aVal = a.overallPerformance || 0;
            bVal = b.overallPerformance || 0;
            break;
          case 'homeworkAttendance':
            aVal = a.homeworkAttendance || 0;
            bVal = b.homeworkAttendance || 0;
            break;
          case 'activeTime':
            aVal = a.activeTime || 0;
            bVal = b.activeTime || 0;
            break;
          default:
            return 0;
        }
        
        if (sortBy !== 'studentId') {
          return sortOrder === 'highToLow' ? bVal - aVal : aVal - bVal;
        }
      });
    }
    
    setFilteredStudents(filtered);
  }, [students, performanceTrend, selectedTopics, maxPerformance, sortBy, sortOrder]);

  const fetchStudentDetails = async (studentId) => {
    setLoading(true);
    try {
      // Use homework data we already fetched
      const studentHwData = homeworkData[studentId];
      
      if (studentHwData) {
        const details = {
          id: studentId,
          name: studentId,
          homeworks: studentHwData.homeworks.map(hw => ({
            id: hw.id,
            date: hw.date,
            score: hw.score.toFixed(1)
          })),
          overallPerformance: studentHwData.scores.length > 0 
            ? (studentHwData.scores.reduce((a, b) => a + b, 0) / studentHwData.scores.length).toFixed(1)
            : 0,
          bestScore: studentHwData.scores.length > 0 
            ? Math.max(...studentHwData.scores).toFixed(1)
            : 0,
          testAttendance: 100.0, // You can calculate this based on total expected homeworks
          totalActive: 'N/A', // This would come from activity data if available
          sessions: studentHwData.homeworks.length,
          lastActive: 'N/A',
          notAttempted: 0.0
        };
        
        setStudentDetails(details);
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="progress-tab-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-tab-container">
      <div className="progress-header">
        <h2>📊 Student Progress Analysis</h2>
        
        {/* Class Selector */}
        {classes.length > 1 ? (
          <select 
            className="class-selector"
            value={selectedClass?.id || ''}
            onChange={(e) => onClassChange(e.target.value)}
          >
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="selected-class-display">
            Class: {classes[0]?.name || selectedClass?.name || 'All Students'}
          </div>
        )}
      </div>

      <div className="progress-content">
        <div className="filters-sidebar">
          <h3>🎛️ Filters</h3>
          
          {/* Performance Trend Filter */}
          <div className="filter-group">
            <label>Performance Trend *</label>
            <div className="checkbox-group">
              {['Declining', 'Stagnant', 'Improving', 'Only-1 Submission', 'No Data'].map(trend => (
                <label key={trend} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={performanceTrend.includes(trend)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPerformanceTrend([...performanceTrend, trend]);
                      } else {
                        setPerformanceTrend(performanceTrend.filter(t => t !== trend));
                      }
                    }}
                  />
                  {trend}
                </label>
              ))}
            </div>
          </div>

          {/* Topics Filter */}
          <div className="filter-group">
            <label>Topics/Chapters *</label>
            <div className="checkbox-group scrollable">
              {availableTopics.length > 0 ? (
                availableTopics.map(topic => (
                  <label key={topic} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTopics([...selectedTopics, topic]);
                        } else {
                          setSelectedTopics(selectedTopics.filter(t => t !== topic));
                        }
                      }}
                    />
                    {topic}
                  </label>
                ))
              ) : (
                <p className="no-topics">No topics available</p>
              )}
            </div>
          </div>

          {/* Max Performance Filter */}
          <div className="filter-group">
            <label>Max Overall Performance (%)</label>
            <input
              type="range"
              min="0"
              max="100"
              value={maxPerformance}
              onChange={(e) => setMaxPerformance(Number(e.target.value))}
              className="performance-slider"
            />
            <span className="range-value">{maxPerformance}%</span>
          </div>

          <h3>🔢 Sort Options</h3>
          
          {/* Sort By */}
          <div className="filter-group">
            <label>Sort By</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="">None</option>
              <option value="studentId">Student ID</option>
              <option value="overallPerformance">Overall Performance</option>
              <option value="homeworkAttendance">Homework Attendance</option>
              <option value="activeTime">Active Time</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="filter-group">
            <label>Sort Order</label>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="sort-select"
            >
              <option value="">None</option>
              <option value="highToLow">High to Low</option>
              <option value="lowToHigh">Low to High</option>
            </select>
          </div>

          {/* Student Count */}
          <div className="student-count">
            <h4>Total Students: {filteredStudents.length}</h4>
            {filteredStudents.length > 0 && (
              <p className="student-names">
                {filteredStudents.slice(0, 3).map(s => s.name).join(', ')}
                {filteredStudents.length > 3 && ` +${filteredStudents.length - 3} more`}
              </p>
            )}
          </div>
        </div>

        <div className="students-section">
          {/* Student List */}
          <div className="student-list">
            <h3>Students ({filteredStudents.length})</h3>
            <div className="student-list-scroll">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <div
                    key={student.id}
                    className={`student-item ${selectedStudent === student.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedStudent(student.id);
                      fetchStudentDetails(student.id);
                    }}
                  >
                    <div className="student-item-header">
                      <div className="student-name">{student.name || student.id}</div>
                      <span className={`trend-badge ${student.performanceTrend.toLowerCase().replace(' ', '-')}`}>
                        {student.performanceTrend}
                      </span>
                    </div>
                    <div className="student-metrics">
                      <span>Performance: {student.overallPerformance?.toFixed(1)}%</span>
                      <span>HW: {student.homeworkAttendance}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-students">
                  No students match the selected filters
                </div>
              )}
            </div>
          </div>

          {/* Student Details */}
          <div className="student-details">
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading student details...</p>
              </div>
            ) : studentDetails ? (
              <div className="details-content">
                <div className="detail-header">
                  <h3>📝 STUDENT: {studentDetails.id}</h3>
                  <div className="activity-info">
                    <span>Total Active ⏱️ <b>{studentDetails.totalActive}</b></span>
                    <span>🔄 <b>{studentDetails.sessions}</b> sessions</span>
                    <span>Last-Active 👁️ {studentDetails.lastActive}</span>
                  </div>
                </div>

                {/* Overall Performance Card */}
                <div className="homework-card">
                  <h4>Overall Performance</h4>
                  
                  <div className="metrics-row">
                    <div className="metric">
                      <span className="label">Overall Performance</span>
                      <span className="value">{studentDetails.overallPerformance}%</span>
                    </div>
                    <div className="metric">
                      <span className="label">Best Score</span>
                      <span className="value best-score">{studentDetails.bestScore}%</span>
                    </div>
                    <div className="metric">
                      <span className="label">Test Attendance</span>
                      <span className="value">{studentDetails.testAttendance}%</span>
                    </div>
                  </div>

                  <div className="performance-details">
                    <div className="detail-section">
                      <h5>Performance Metrics:</h5>
                      <p>• Total Homeworks: {studentDetails.homeworks?.length || 0}</p>
                      <p>• Q.Not Attempt: {studentDetails.notAttempted}%</p>
                    </div>
                    
                    <div className="detail-section">
                      <h5>Homework Scores Timeline:</h5>
                      {studentDetails.homeworks && studentDetails.homeworks.length > 0 ? (
                        <table className="scores-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>HW ID</th>
                              <th>Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentDetails.homeworks.map((hw, index) => (
                              <tr key={index}>
                                <td>{hw.date}</td>
                                <td>{hw.id}</td>
                                <td>{hw.score}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>No homework submissions yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <div className="no-selection-icon">📊</div>
                <h3>Select a student to view details</h3>
                <p>Click on any student from the list to see their performance analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTab;