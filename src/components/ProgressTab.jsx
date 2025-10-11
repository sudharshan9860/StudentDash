// ProgressTab.jsx - Complete implementation with Streamlit dashboard functionality
import React, { useState, useEffect } from 'react';
import './ProgressTab.css';
import axiosInstance from '../api/axiosInstance';

const ProgressTab = ({ teacherData }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Class-related states
  const [detectedClasses, setDetectedClasses] = useState([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  
  // Filter states
  const [performanceTrend, setPerformanceTrend] = useState([]); // Empty = show all
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [maxPerformance, setMaxPerformance] = useState(100);
  const [sortBy, setSortBy] = useState('overallPerformance');
  const [sortOrder, setSortOrder] = useState('lowToHigh');
  const [patternFilter, setPatternFilter] = useState('All');
  
  // Data states
  const [availableTopics, setAvailableTopics] = useState([]);
  const [homeworkData, setHomeworkData] = useState({});
  const [allAnalysis, setAllAnalysis] = useState({});
  const [topicHomeworkCounts, setTopicHomeworkCounts] = useState({});

  // Class detection function matching Streamlit pattern
  const detectClassFromStudentId = (studentId) => {
    // Pattern for MME format (8MME, 9MME, etc.)
    const patterns = [
      /^(\d+MME)/,  // MME format
      /^(\d+HPS)/,  // HPS format
      /^(\d+[A-Z]+)/ // Generic format
    ];
    
    for (const pattern of patterns) {
      const match = studentId.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const detectClassesFromAllStudents = (studentList) => {
    const classesSet = new Set();
    
    studentList.forEach(student => {
      const studentId = typeof student === 'string' ? student : student.id;
      const className = detectClassFromStudentId(studentId);
      if (className) {
        classesSet.add(className);
      }
    });
    
    return Array.from(classesSet).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });
  };

  // Performance pattern detection matching Streamlit logic
  const detectPerformancePattern = (scores) => {
    if (scores.length < 2) {
      return {
        trend: 'Only-1 Submission',
        pattern_details: {
          pattern: 'Not enough data',
          pattern_category: 'Not enough data',
          volatility: 0,
          best_score: scores[0] || 0,
          worst_score: scores[0] || 0,
          current_vs_avg: 0
        }
      };
    }

    const latest = scores[scores.length - 1];
    const previous = scores.length > 1 ? scores[scores.length - 2] : latest;
    const best = Math.max(...scores);
    const worst = Math.min(...scores);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const firstScore = scores[0];
    const baselineAvg = scores.slice(0, Math.min(2, scores.length)).reduce((a, b) => a + b, 0) / Math.min(2, scores.length);
    
    // Calculate standard deviation
    const stdDev = Math.sqrt(scores.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / scores.length);
    const volatility = avg > 0 ? (stdDev / avg * 100) : 0;

    const patternDetails = {
      volatility: volatility.toFixed(2),
      best_score: best.toFixed(2),
      worst_score: worst.toFixed(2),
      current_vs_avg: (latest - avg).toFixed(2),
      short_ma: scores.slice(-2).reduce((a, b) => a + b, 0) / Math.min(2, scores.length),
      long_ma: avg,
      pattern: '',
      pattern_category: ''
    };

    // Special case: Only 2 homeworks
    if (scores.length === 2) {
      const change = latest - previous;
      if (change > 0) {
        patternDetails.pattern = 'Improvement from first homework';
        patternDetails.pattern_category = 'Improvement';
        return { trend: 'improving', pattern_details: patternDetails };
      } else if (change < 0) {
        patternDetails.pattern = 'Decline from first homework';
        patternDetails.pattern_category = 'Decline';
        return { trend: 'declining', pattern_details: patternDetails };
      } else {
        patternDetails.pattern = 'Stable performance';
        patternDetails.pattern_category = 'Stable';
        return { trend: 'stagnant', pattern_details: patternDetails };
      }
    }

    // 3+ homeworks - sophisticated pattern detection
    const improvementFromBaseline = latest - baselineAvg;
    
    // Check for improvement patterns
    if (firstScore < 30 && latest > firstScore * 1.5) {
      patternDetails.pattern = 'Recovery from low baseline';
      patternDetails.pattern_category = 'Strong improvement';
      return { trend: 'improving', pattern_details: patternDetails };
    }

    if (improvementFromBaseline > 20 && latest > baselineAvg) {
      patternDetails.pattern = 'Improvement from baseline';
      patternDetails.pattern_category = 'Improvement';
      return { trend: 'improving', pattern_details: patternDetails };
    }

    // Check for decline patterns
    if (latest < baselineAvg * 0.8 && latest < previous - 5) {
      patternDetails.pattern = 'Downward trend';
      patternDetails.pattern_category = 'Gradual decline';
      return { trend: 'declining', pattern_details: patternDetails };
    }

    // Volatile patterns
    if (volatility > 30) {
      if (latest > firstScore * 1.3) {
        patternDetails.pattern = 'Volatile but improving';
        patternDetails.pattern_category = 'Improvement';
        return { trend: 'improving', pattern_details: patternDetails };
      } else if (latest < avg && latest < baselineAvg) {
        patternDetails.pattern = 'Volatile with downward bias';
        patternDetails.pattern_category = 'Inconsistent performance';
        return { trend: 'declining', pattern_details: patternDetails };
      }
    }

    // Default classification
    if (latest > baselineAvg * 1.2) {
      patternDetails.pattern = 'Above baseline';
      patternDetails.pattern_category = 'Improvement';
      return { trend: 'improving', pattern_details: patternDetails };
    } else if (latest < baselineAvg * 0.8) {
      patternDetails.pattern = 'Below baseline';
      patternDetails.pattern_category = 'Gradual decline';
      return { trend: 'declining', pattern_details: patternDetails };
    } else {
      patternDetails.pattern = 'Stable performance';
      patternDetails.pattern_category = 'Stable';
      if (avg >= 80) {
        patternDetails.pattern = 'Stable at excellence';
        patternDetails.pattern_category = 'High performer - stable';
        return { trend: 'improving', pattern_details: patternDetails };
      }
      return { trend: 'stagnant', pattern_details: patternDetails };
    }
  };

  // Normalize error types to standard categories
  const normalizeErrorType = (errorType) => {
    const errorLower = errorType.toLowerCase().trim()
      .replace('_error', '').replace(' error', '').trim();
    
    if (errorLower.includes('concept')) return 'Conceptual';
    if (errorLower.includes('logic')) return 'Logical';
    if (errorLower.includes('calcul')) return 'Calculation';
    return '';
  };

  // Analyze student performance matching Streamlit logic
  const analyzeStudentPerformance = (studentId, homeworks, topicHomeworkTotals) => {
    const topicHomeworks = {};
    
    // Sort homeworks by date
    const sortedHomeworks = [...homeworks].sort((a, b) => {
      const dateA = new Date(a.date.split('-').reverse().join('-'));
      const dateB = new Date(b.date.split('-').reverse().join('-'));
      return dateA - dateB;
    });

    // Group by topic and calculate scores
    sortedHomeworks.forEach(hw => {
      hw.questions?.forEach(question => {
        const topic = (question.topic || hw.topic || 'Unknown').split('Exercise')[0].trim();
        
        if (!topicHomeworks[topic]) {
          topicHomeworks[topic] = {
            homeworks: [],
            scores: [],
            errors: {},
            notAttempted: 0,
            correct: 0,
            totalQuestions: 0
          };
        }

        const answerCat = question.answer_category || '';
        const totalScore = question.total_score || 0;
        const maxScore = question.max_score || 0;

        // Track metrics
        topicHomeworks[topic].totalQuestions++;
        
        if (totalScore === maxScore && maxScore > 0) {
          topicHomeworks[topic].correct++;
        } else if (answerCat === 'Unattempted' || (totalScore === 0 && answerCat === 'no_error')) {
          topicHomeworks[topic].notAttempted++;
        } else if (answerCat && !['None', 'no_error', 'no-error', ''].includes(answerCat)) {
          // Handle errors
          const errorTypes = answerCat.split(',').map(e => e.trim());
          errorTypes.forEach(errorType => {
            const normalized = normalizeErrorType(errorType);
            if (normalized) {
              topicHomeworks[topic].errors[normalized] = (topicHomeworks[topic].errors[normalized] || 0) + 1;
            }
          });
        }
      });

      // Calculate homework score for each topic
      Object.keys(topicHomeworks).forEach(topic => {
        const hwQuestions = hw.questions?.filter(q => 
          (q.topic || hw.topic || 'Unknown').split('Exercise')[0].trim() === topic
        ) || [];
        
        const hwTotalScore = hwQuestions.reduce((sum, q) => sum + (q.total_score || 0), 0);
        const hwMaxScore = hwQuestions.reduce((sum, q) => sum + (q.max_score || 0), 0);
        const hwScore = hwMaxScore > 0 ? (hwTotalScore / hwMaxScore) * 100 : 0;
        
        if (!topicHomeworks[topic].homeworks.find(h => h.hw_id === hw.id)) {
          topicHomeworks[topic].homeworks.push({
            date: hw.date,
            hw_id: hw.id,
            score: hwScore
          });
          topicHomeworks[topic].scores.push(hwScore);
        }
      });
    });

    // Analyze each topic
    const analysisResult = {};
    
    Object.keys(topicHomeworks).forEach(topic => {
      const data = topicHomeworks[topic];
      const scores = data.scores;
      const overallPerformance = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0;

      // Calculate test attendance
      const uniqueHwIds = new Set(data.homeworks.map(h => h.hw_id));
      const topicAttendanceCount = uniqueHwIds.size;
      const totalHomeworksForTopic = topicHomeworkTotals[topic] || 0;
      const testAttendancePct = totalHomeworksForTopic > 0 
        ? (topicAttendanceCount / totalHomeworksForTopic) * 100 
        : 0;

      // Calculate error percentages
      const errorPercentages = {};
      Object.keys(data.errors).forEach(errorType => {
        errorPercentages[errorType] = data.totalQuestions > 0
          ? ((data.errors[errorType] / data.totalQuestions) * 100).toFixed(2)
          : 0;
      });

      const notAttemptedPct = data.totalQuestions > 0
        ? ((data.notAttempted / data.totalQuestions) * 100).toFixed(2)
        : 0;
      
      const correctPct = data.totalQuestions > 0
        ? ((data.correct / data.totalQuestions) * 100).toFixed(2)
        : 0;

      // Get performance pattern
      const { trend, pattern_details } = detectPerformancePattern(scores);

      // Calculate best performance metrics
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const bestScoreIdx = scores.indexOf(bestScore);
      const hwAgo = scores.length - bestScoreIdx - 1;
      const latestScore = scores[scores.length - 1] || 0;
      const previousScore = scores[scores.length - 2] || 0;

      analysisResult[topic] = {
        overall_performance: overallPerformance.toFixed(2),
        best_performance: {
          score: bestScore.toFixed(2),
          hw_ago: hwAgo,
          indicator: hwAgo > 0 ? `↑ ${hwAgo} HW ago` : 'Current'
        },
        performance_decline: {
          from_best: (latestScore - bestScore).toFixed(2),
          from_previous: scores.length >= 2 ? (latestScore - previousScore).toFixed(2) : 0
        },
        correct: correctPct,
        not_attempted: notAttemptedPct,
        errors: errorPercentages,
        hw_scores: data.homeworks.reduce((acc, hw) => {
          acc[hw.date] = hw.score.toFixed(2);
          return acc;
        }, {}),
        hw_details: data.homeworks,
        trend: trend,
        pattern_details: pattern_details,
        homework_count: data.homeworks.length,
        unique_homeworks_submitted: topicAttendanceCount,
        test_attendance_pct: testAttendancePct.toFixed(2)
      };
    });

    return analysisResult;
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [teacherData]);

  const loadInitialData = async () => {
    try {
      setDataLoading(true);

       // DEBUG: Log what we're receiving
      console.log('=== DEBUG: ProgressTab Initial Load ===');
      console.log('teacherData received:', teacherData);
      console.log('teacherData type:', typeof teacherData);
      console.log('teacherData keys:', teacherData ? Object.keys(teacherData) : 'null/undefined');
      
      let studentList = [];
      
      // Try multiple ways to get student list
      if (teacherData?.available_students && Array.isArray(teacherData.available_students)) {
        studentList = teacherData.available_students;
        console.log('✅ Got students from teacherData.available_students:', studentList);
      } 
      // Try alternate property names
      else if (teacherData?.students && Array.isArray(teacherData.students)) {
        studentList = teacherData.students;
        console.log('✅ Got students from teacherData.students:', studentList);
      }
      // Try if teacherData itself is the array
      else if (Array.isArray(teacherData)) {
        studentList = teacherData;
        console.log('✅ teacherData is the student array itself:', studentList);
      }
      // Try localStorage
      else {
        console.log('⚠️ No students in teacherData, trying localStorage...');
        
        // Try multiple localStorage keys
        const keys = ['studentData', 'students', 'available_students', 'teacherData'];
        for (const key of keys) {
          const savedData = localStorage.getItem(key);
          if (savedData) {
            console.log(`Found data in localStorage['${key}']:`, savedData.substring(0, 100) + '...');
            try {
              const parsed = JSON.parse(savedData);
              if (Array.isArray(parsed)) {
                studentList = parsed;
                console.log(`✅ Got ${studentList.length} students from localStorage['${key}']`);
                break;
              } else if (parsed.available_students && Array.isArray(parsed.available_students)) {
                studentList = parsed.available_students;
                console.log(`✅ Got ${studentList.length} students from localStorage['${key}'].available_students`);
                break;
              }
            } catch (e) {
              console.error(`Error parsing localStorage['${key}']:`, e);
            }
          }
        }
      }

      if (studentList.length === 0) {
        console.warn('No students found');
        setDataLoading(false);
        return;
      }

      // Detect classes
      const detectedClassList = detectClassesFromAllStudents(studentList);
      console.log('Detected classes:', detectedClassList);
      setDetectedClasses(['ALL', ...detectedClassList]);
      
      // Initialize students
      const initialStudents = studentList.map(studentId => ({
        id: typeof studentId === 'string' ? studentId : studentId.id,
        name: typeof studentId === 'string' ? studentId : studentId.id,
        class: detectClassFromStudentId(typeof studentId === 'string' ? studentId : studentId.id) || 'Unknown',
        overallPerformance: 0,
        performanceTrend: 'No Data',
        homeworkAttendance: 0,
        testAttendance: 0,
        topics: [],
        homeworks: [],
        hasData: false
      }));
      
      setStudents(initialStudents);
      setFilteredStudents(initialStudents); // Add this line

      
      // Fetch and process homework data
    await fetchAndProcessHomeworkData(studentList, initialStudents);
      
      setDataLoading(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setDataLoading(false);
    }
  };

  const fetchAndProcessHomeworkData = async (studentList, initialStudents) => {
    try {
      const validStudentIds = new Set(studentList.map(s => typeof s === 'string' ? s : s.id));
      
      // Fetch all homework codes
      const homeworkListResponse = await axiosInstance.get('/all-homeworks-codes/');
      
      if (!homeworkListResponse.data?.homework_codes) {
        console.log('No homework codes found');
        // Still set the students even without homework data
        setStudents(initialStudents);
        setFilteredStudents(initialStudents);
        return;
      }

      const homeworkCodes = homeworkListResponse.data.homework_codes;
      const classData = {};
      const topicHomeworkTotalsMap = {};
      const topicsSet = new Set();

      console.log(`Processing ${homeworkCodes.length} homework assignments`);

// inside fetchAndProcessHomeworkData, right after you derive `homeworkCodes`
const rawCodes = homeworkCodes.map(h => Array.isArray(h) ? h[0] : h).filter(Boolean);

// 1) De-dupe
const uniqueCodes = [...new Set(rawCodes.map(c => c.trim()))];

// 2) Optionally normalize (only if your backend expects slugs; else keep original)
// const slugify = s => s.toLowerCase().replace(/\s+/g, ' ').trim();
// const uniqueCodes = [...new Set(rawCodes.map(slugify))];

console.log(`Processing ${uniqueCodes.length} unique homework assignments`);

const validCodes = [];
const invalidCodes = [];

// 3) Pre-probe: check which codes actually exist (HEAD or lightweight GET)
for (const homework_code of uniqueCodes) {
  try {
    await axiosInstance.get('/homework-details/', { params: { homework_code } });
    validCodes.push(homework_code);
  } catch (e) {
    if (e?.response?.status === 404) {
      invalidCodes.push(homework_code);
    } else {
      console.debug(`Transient error for ${homework_code}:`, e?.message || e);
    }
  }
}

if (invalidCodes.length) {
  console.warn(`Skipping ${invalidCodes.length} codes that returned 404`, invalidCodes.slice(0, 10), '...');
}

// 4) Now process ONLY validCodes (and keep existing try/catch inside)
for (const homework_code of validCodes) {
  try {
    const [submissionsResponse, questionsResponse] = await Promise.allSettled([
      axiosInstance.get('/homework-details/', { params: { homework_code } }),
      axiosInstance.get('/homework-questions/', { params: { homework_code } }),
    ]);

    if (submissionsResponse.status !== 'fulfilled') {
      // silently skip this code
      continue;
    }
    if (questionsResponse.status !== 'fulfilled') {
      continue;
    }

    const submissions = submissionsResponse.value.data[homework_code] || [];
    const questions = questionsResponse.value.data;

  } catch (err) {
    // Reduce console noise; skip instead of hard error
    console.debug(`Skipped homework ${homework_code}:`, err?.message || err);
  }
}
    
      
      console.log(`Processing ${homeworkCodes.length} homework assignments`);
      
      // Process each homework
      for (const homework of homeworkCodes) {
        const homework_code = Array.isArray(homework) ? homework[0] : homework;
        const creation_date = Array.isArray(homework) ? homework[1] : null;
        
        try {
          const [submissionsResponse, questionsResponse] = await Promise.all([
            axiosInstance.get('/homework-details/', { params: { homework_code } }),
            axiosInstance.get('/homework-questions/', { params: { homework_code } })
          ]);
          
          const submissions = submissionsResponse.data[homework_code] || [];
          const questions = questionsResponse.data;
          
          // Extract topic
          const topicValue = questions.title || homework_code;
          const cleanTopic = topicValue.split('Exercise')[0].trim();
          
          if (cleanTopic) {
            topicsSet.add(cleanTopic);
            if (!topicHomeworkTotalsMap[cleanTopic]) {
              topicHomeworkTotalsMap[cleanTopic] = new Set();
            }
            topicHomeworkTotalsMap[cleanTopic].add(homework_code);
          }
          
          // Process submissions for valid students
          submissions.forEach(submission => {
            const studentId = submission.student_id;
            
            if (!validStudentIds.has(studentId)) return;
            
            const className = detectClassFromStudentId(studentId);
            
            if (!classData[className]) {
              classData[className] = {};
            }
            
            if (!classData[className][studentId]) {
              classData[className][studentId] = [];
            }
            
            // Format date
            let formattedDate = 'Unknown';
            if (creation_date) {
              try {
                const dt = new Date(creation_date.replace('Z', '+00:00'));
                formattedDate = dt.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit'
                }).replace(/\//g, '-');
              } catch (e) {
                formattedDate = creation_date;
              }
            }
            
            // Process questions
            const questionsOut = [];
            const resultJson = submission.result_json || {};
            const questionsList = resultJson.questions || [];
            
            questionsList.forEach(qres => {
              questionsOut.push({
                question_id: qres.question_id || qres.question_number || '',
                topic: cleanTopic,
                total_score: qres.total_score || qres.total_marks_obtained || 0,
                max_score: qres.max_score || qres.max_marks || 0,
                answer_category: qres.answer_category || qres.error_type || '',
                concept_required: qres.concept_required || qres.concepts_required || '',
                comment: qres.comment || qres.gap_analysis || '',
                correction_comment: qres.correction_comment || qres.mistakes_made || ''
              });
            });
            
            classData[className][studentId].push({
              creation_date: formattedDate,
              date: formattedDate,
              homework_id: homework_code,
              id: homework_code,
              topic: cleanTopic,
              questions: questionsOut
            });
          });
        } catch (error) {
          console.error(`Error processing homework ${homework_code}:`, error);
        }
      }
      
      // Convert topic homework totals to counts
      const topicHomeworkCounts = {};
      Object.keys(topicHomeworkTotalsMap).forEach(topic => {
        topicHomeworkCounts[topic] = topicHomeworkTotalsMap[topic].size;
      });
      
      setTopicHomeworkCounts(topicHomeworkCounts);
      setAvailableTopics(Array.from(topicsSet).sort());
      
      // Analyze all students
      const allStudentAnalysis = {};
      
      Object.keys(classData).forEach(className => {
        Object.keys(classData[className]).forEach(studentId => {
          const homeworks = classData[className][studentId];
          const analysis = analyzeStudentPerformance(studentId, homeworks, topicHomeworkCounts);
          allStudentAnalysis[studentId] = analysis;
        });
      });
      
      setAllAnalysis(allStudentAnalysis);
      setHomeworkData(classData);
      
      // Update students with analyzed data
      const updatedStudents = initialStudents.map(student => {
        const analysis = allStudentAnalysis[student.id];
        
        if (analysis && Object.keys(analysis).length > 0) {
          const topics = Object.keys(analysis);
          const overallAvg = topics.reduce((sum, topic) => 
            sum + parseFloat(analysis[topic].overall_performance), 0) / topics.length;
          
          const totalHw = topics.reduce((sum, topic) => 
            sum + analysis[topic].homework_count, 0);
          
          const worstTrend = topics.some(topic => 
            analysis[topic].trend === 'declining') ? 'declining' :
            topics.some(topic => analysis[topic].trend === 'improving') ? 'improving' : 'stagnant';
          
          return {
            ...student,
            overallPerformance: overallAvg,
            homeworkAttendance: totalHw,
            performanceTrend: worstTrend,
            topics: topics,
            hasData: true,
            analysis: analysis
          };
        }
        
        return student;
      });
      
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      
      console.log(`Analysis complete: ${Object.keys(allStudentAnalysis).length} students analyzed`);
      
    } catch (error) {
      console.error('Error fetching homework data:', error);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...students];
    
    // Filter by class
    if (selectedClassFilter !== 'ALL') {
      filtered = filtered.filter(student => student.class === selectedClassFilter);
    }
    
    // Filter by performance trend
    if (performanceTrend.length > 0) {
      filtered = filtered.filter(student => {
        if (!student.analysis) return performanceTrend.includes('No Data');
        
        const trends = Object.values(student.analysis).map(topic => topic.trend);
        return trends.some(trend => performanceTrend.includes(trend));
      });
    }
    
    // Filter by topics
    if (selectedTopics.length > 0 && selectedTopics.length < availableTopics.length) {
      filtered = filtered.filter(student => 
        student.topics?.some(topic => selectedTopics.includes(topic))
      );
    }
    
    // Filter by max performance
    filtered = filtered.filter(student => 
      (student.overallPerformance || 0) <= maxPerformance
    );
    
    // Filter by pattern
    if (patternFilter !== 'All') {
      filtered = filtered.filter(student => {
        if (!student.analysis) return false;
        return Object.values(student.analysis).some(topic => 
          topic.pattern_details?.pattern_category === patternFilter
        );
      });
    }
    
    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        
        switch(sortBy) {
          case 'studentId':
            return sortOrder === 'highToLow' 
              ? b.id.localeCompare(a.id)
              : a.id.localeCompare(b.id);
          case 'overallPerformance':
            aVal = a.overallPerformance || 0;
            bVal = b.overallPerformance || 0;
            break;
          case 'homeworkAttendance':
            aVal = a.homeworkAttendance || 0;
            bVal = b.homeworkAttendance || 0;
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
    console.log('Filtered students:', filtered.length, 'from total:', students.length);
  }, [students, selectedClassFilter, performanceTrend, selectedTopics, maxPerformance, sortBy, sortOrder, patternFilter, availableTopics]);

  // Fetch student details
  const fetchStudentDetails = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student?.analysis) {
      setStudentDetails({
        id: studentId,
        analysis: student.analysis,
        class: student.class,
        overallPerformance: student.overallPerformance
      });
    }
  };

  // Calculate statistics
  const getStats = () => {
    const stats = {
      totalStudents: filteredStudents.length,
      decliningCount: 0,
      improvingCount: 0,
      needsAttention: 0
    };
    
    filteredStudents.forEach(student => {
      if (student.performanceTrend === 'declining') stats.decliningCount++;
      if (student.performanceTrend === 'improving') stats.improvingCount++;
      if (student.overallPerformance < 40) stats.needsAttention++;
    });
    
    return stats;
  };

  const stats = getStats();

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
    {/* Header */}
    <div className="progress-header">
      <h2>📊 Student Progress Analysis</h2>
      <select 
        className="class-selector"
        value={selectedClassFilter}
        onChange={(e) => setSelectedClassFilter(e.target.value)}
      >
        {detectedClasses.map(cls => (
          <option key={cls} value={cls}>
            {cls === 'ALL' ? 'All Classes' : `Class ${cls}`}
          </option>
        ))}
      </select>
    </div>

    {/* Stats Bar */}
    <div className="class-stats-bar">
      <div className="stat-item">
        <span className="stat-label">Total Students:</span>
        <span className="stat-value">{stats.totalStudents}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Needs Attention:</span>
        <span className="stat-value declining">{stats.decliningCount}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Improving:</span>
        <span className="stat-value improving">{stats.improvingCount}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Critical:</span>
        <span className="stat-value critical">{stats.needsAttention}</span>
      </div>
    </div>

    {/* Filters Section */}
    <div className="filters-container">
      <div className="filter-card">
        <label className="filter-label">PERFORMANCE TREND</label>
        <div className="multi-select-dropdown">
          <div 
            className="select-display"
            onClick={(e) => {
              e.currentTarget.nextElementSibling.classList.toggle('show');
            }}
          >
            {performanceTrend.length === 0 ? 'Select trends...' : 
             performanceTrend.length === 1 ? performanceTrend[0] :
             `${performanceTrend.length} selected`}
            <span className="dropdown-arrow">▼</span>
          </div>
          <div className="dropdown-options">
            {['declining', 'stagnant', 'improving', 'No Data'].map(trend => (
              <label key={trend} className="option-item">
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
                <span>{trend.charAt(0).toUpperCase() + trend.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="filter-card">
        <label className="filter-label">TOPICS</label>
        <div className="multi-select-dropdown">
          <div 
            className="select-display"
            onClick={(e) => {
              e.currentTarget.nextElementSibling.classList.toggle('show');
            }}
          >
            {selectedTopics.length === 0 || selectedTopics.length === availableTopics.length ? 
             'All Topics Selected' : 
             selectedTopics.length === 1 ? selectedTopics[0] :
             `${selectedTopics.length} selected`}
            <span className="dropdown-arrow">▼</span>
          </div>
          <div className="dropdown-options topics-dropdown">
            {availableTopics.map(topic => (
              <label key={topic} className="option-item">
                <input
                  type="checkbox"
                  checked={selectedTopics.length === 0 || selectedTopics.includes(topic)}
                  onChange={(e) => {
                    if (selectedTopics.length === 0) {
                      setSelectedTopics(availableTopics.filter(t => t !== topic));
                    } else if (e.target.checked) {
                      const newSelected = [...selectedTopics, topic];
                      if (newSelected.length === availableTopics.length) {
                        setSelectedTopics([]);
                      } else {
                        setSelectedTopics(newSelected);
                      }
                    } else {
                      setSelectedTopics(selectedTopics.filter(t => t !== topic));
                    }
                  }}
                />
                <span className="topic-text">{topic}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Secondary Filters */}
    <div className="secondary-filters">
      <div className="filter-group">
        <label className="filter-label">MAX PERFORMANCE</label>
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="100"
            value={maxPerformance}
            onChange={(e) => setMaxPerformance(Number(e.target.value))}
            className="performance-slider"
          />
          <span className="slider-value">{maxPerformance}</span>
          <span className="slider-unit">%</span>
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">SORT BY</label>
        <select 
          className="filter-select"
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="studentId">Student ID</option>
          <option value="overallPerformance">Performance</option>
          <option value="homeworkAttendance">Attendance</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">ORDER</label>
        <select 
          className="filter-select"
          value={sortOrder} 
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="lowToHigh">Low to High</option>
          <option value="highToLow">High to Low</option>
        </select>
      </div>
    </div>

    {/* Student Selection Section */}
    <div className="student-selection-container">
      <label className="section-label">SELECT STUDENT:</label>
      <select 
        className="student-dropdown"
        value={selectedStudent || ''}
        onChange={(e) => {
          setSelectedStudent(e.target.value);
          fetchStudentDetails(e.target.value);
        }}
      >
        <option value="">Choose a student...</option>
        {filteredStudents.map(student => (
          <option key={student.id} value={student.id}>
            {student.id} - {student.overallPerformance?.toFixed(1)}% 
            {student.performanceTrend === 'declining' ? '📉' : 
             student.performanceTrend === 'improving' ? '📈' : '📊'}
          </option>
        ))}
      </select>
      
      {/* Quick Student Cards */}
      <div className="student-cards">
        {filteredStudents.slice(0, 5).map(student => (
          <div
            key={student.id}
            className={`student-card ${selectedStudent === student.id ? 'active' : ''} ${student.performanceTrend}`}
            onClick={() => {
              setSelectedStudent(student.id);
              fetchStudentDetails(student.id);
            }}
          >
            <div className="card-header">
              <span className="student-id">{student.id}</span>
              <span className="performance-badge">{student.overallPerformance?.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Student Details Section */}
    {studentDetails && (
      <div className="student-details-container">
        <div className="student-header">
          <h3>👤 STUDENT: {studentDetails.id}</h3>
          <div className="student-stats">
            <span>Total Active ⏱️ <strong>N/A</strong></span>
            <span>📊 <strong>0</strong> sessions</span>
            <span>Last-Active 👁️ <strong>No data</strong></span>
          </div>
        </div>

        {Object.entries(studentDetails.analysis).map(([topic, data]) => (
          <div key={topic} className="chapter-card">
            <div className="chapter-header">
              <h4>CHAPTER {topic.replace('Mathematics - ', '')}</h4>
              <span className={`status-badge ${data.trend}`}>
                {data.trend.toUpperCase()}
              </span>
            </div>
            
            {data.pattern_details?.pattern && (
              <div className="pattern-info">
                Pattern: {data.pattern_details.pattern}
              </div>
            )}

            <div className="metrics-grid">
              <div className="metric-card">
                <label>OVERALL PERFORMANCE</label>
                <div className="metric-value">{data.overall_performance}%</div>
              </div>
              <div className="metric-card">
                <label>BEST SCORE</label>
                <div className="metric-value golden">{data.best_performance.score}%</div>
                <span className="metric-note">↑ {data.best_performance.indicator}</span>
              </div>
              <div className="metric-card">
                <label>TEST ATTENDANCE</label>
                <div className="metric-value">{data.test_attendance_pct}%</div>
              </div>
            </div>

            <div className="details-grid">
              <div className="detail-panel">
                <h5>PERFORMANCE METRICS:</h5>
                <ul className="metrics-list">
                  <li>Current vs Average: {data.pattern_details?.current_vs_avg}%</li>
                  <li>Volatility: {data.pattern_details?.volatility}%</li>
                  <li className="success">✓ Perfect-Score: {data.correct}%</li>
                  <li className="danger">• Q.Not Attempt: {data.not_attempted}%</li>
                </ul>
                
                {Object.keys(data.errors).length > 0 && (
                  <>
                    <h5>ERROR DISTRIBUTION:</h5>
                    {Object.entries(data.errors).map(([errorType, percentage]) => (
                      <div key={errorType} className="error-item">
                        <span className="error-label">{errorType}: {percentage}%</span>
                        <div className="error-bar">
                          <div className="error-fill" style={{width: `${percentage}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="detail-panel">
                <h5>HOMEWORK SCORES TIMELINE:</h5>
                <table className="scores-table">
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>HW ID</th>
                      <th>SCORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.hw_details?.map((hw, idx) => (
                      <tr key={idx}>
                        <td>{hw.date}</td>
                        <td>{hw.hw_id}</td>
                        <td>
                          <span className={`score-badge ${hw.score >= 80 ? 'excellent' : hw.score >= 60 ? 'good' : 'poor'}`}>
                            {hw.score.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Empty State */}
    {!studentDetails && (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <h3>No Student Selected</h3>
        <p>Select a student from the dropdown above to view their detailed progress analysis</p>
      </div>
    )}
  </div>
);
};

export default ProgressTab;