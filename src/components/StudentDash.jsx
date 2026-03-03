import React, { useState, useEffect, useContext, useMemo } from "react";
import "katex/dist/katex.min.css";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./StudentDash.css";
import axiosInstance from "../api/axiosInstance";
import QuestionListModal from "./QuestionListModal";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AuthContext } from "./AuthContext";
import { useAlert } from "./AlertBox";
import WizardSelector from "./WizardSelector";
import { useJeeMode } from "../contexts/JeeModeContext";
import {
  faSchool,
  faBookOpen,
  faListAlt,
  faClipboardQuestion,
  faQuestionCircle,
  faRocket,
  faGraduationCap,
  faBrain,
  faLightbulb,
  faBars,
  faTimes,
  faSun,
  faMoon,
  faFire,
  faTrophy,
  faMagic,
  faStar,
  faChartLine,
  faCalendarAlt,
  faUsers,
  faBookmark,
} from "@fortawesome/free-solid-svg-icons";
import UnifiedSessions from "./UnifiedSessions";
import StreakTracker from "./StreakTracker";
import LiveNotifications from "./LiveNotifications";
import Tutorial from "./Tutorial";
import { useTutorial } from "../contexts/TutorialContext";
import FeedbackBox from "./FeedbackBox";

import ProgressGraph from "./ProgressGraph";
import QuizScoreGraph from "./QuizScoreGraph";

function StudentDash({ jeeMode = false }) {
  const navigate = useNavigate();
  const { username, fullName, role } = useContext(AuthContext);
  const { showAlert, AlertContainer } = useAlert();

  // Tutorial context
  const {
    shouldShowTutorialForPage,
    continueTutorialFlow,
    completeTutorialFlow,
    startTutorialFromToggle,
    startTutorialForPage,
    tutorialFlow,
    completedPages,
  } = useTutorial();

  // Mascot context - removed to prevent multiple WebGL contexts

  // Dark mode state with improved persistence
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // State for dropdown data
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [worksheets, setWorksheets] = useState([]);
  const [jeeSubtopics, setJeeSubtopics] = useState([]); // For JEE Mathematics subtopics

  // State for selections with smart defaults
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [questionType, setQuestionType] = useState("");
  const [questionLevel, setQuestionLevel] = useState("");
  const [selectedWorksheet, setSelectedWorksheet] = useState("");
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [questionList, setQuestionList] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state for JEE questions
  const [paginationInfo, setPaginationInfo] = useState({
    next: null,
    previous: null,
    count: 0,
    currentPage: 1,
    totalPages: 0,
    isLoading: false,
  });

  const [scienceSubtopics, setScienceSubtopics] = useState([]);

  // Resume Learning state
  const [lastSession, setLastSession] = useState(null);
  const [canResume, setCanResume] = useState(false);

  // Trial Modal is now in Layout.jsx

  // Feedback Modal state (auto-show after 3 mins of app usage, only once)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Extract class from username (e.g., 10HPS24 -> 10, 12ABC24 -> 12)
  const extractClassFromUsername = (username) => {
    if (!username) return "";

    const firstTwo = username.substring(0, 2);
    if (!isNaN(firstTwo)) {
      return firstTwo; // ✅ both are digits
    }

    const firstOne = username.charAt(0);
    if (!isNaN(firstOne)) {
      return firstOne; // ✅ only first is digit
    }

    return ""; // ❌ no digits at the start
  };

  // Enhanced time-based greeting with more personalization
  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 6) {
      return "Good Night";
    } else if (currentHour >= 6 && currentHour < 12) {
      return "Good Morning";
    } else if (currentHour >= 12 && currentHour < 17) {
      return "Good Afternoon";
    } else if (currentHour >= 17 && currentHour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  // Get motivational message based on time
  const getMotivationalMessage = () => {
    const messages = [
      "Ready to unlock your mathematical genius today? Let's dive into some exciting problem-solving! 🚀",
      "Time to explore the fascinating world of mathematics! Every problem is a new adventure waiting to be solved! ✨",
      "Mathematics is the language of the universe - let's learn to speak it fluently! 🌟",
      "Today's learning journey begins with a single step. Let's make it count! 💪",
      "Ready to turn complex problems into simple solutions? Your mathematical journey awaits! 🎯",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Toggle dark mode with smooth transition - dispatches custom event
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    document.body.classList.toggle("dark-mode", newMode);

    // Dispatch custom event for other components to listen
    window.dispatchEvent(
      new CustomEvent("darkModeChange", {
        detail: { isDarkMode: newMode },
      }),
    );
  };
  const tutorialSteps = [
    {
      target: ".greeting-content",
      content:
        "Welcome to your Student Dashboard! Let me guide you through how to get started with solving questions.",
      disableBeacon: true,
    },
    {
      target: "#formClass",
      content:
        "First, select your class from this dropdown. Your class should be pre-selected based on your username.",
    },
    {
      target: "#formSubject",
      content:
        "Next, choose the subject you want to study. Mathematics is usually selected by default.",
    },
    {
      target: ".chapters-select-final",
      content:
        "Select one or more chapters you want to practice. You can select multiple chapters at once!",
    },
    {
      target: "#formQuestionType",
      content:
        "Choose the type of questions: Solved Examples (to learn), Exercises (to practice), or Worksheets (for tests).",
    },
    {
      target: ".button--mimas",
      content:
        "Finally, click this button to generate questions based on your selections. You'll see a list of available questions!",
    },
  ];

  // Handle tutorial completion for StudentDash
  const handleTutorialComplete = () => {
    // console.log("StudentDash tutorial completed");
    // Don't mark as complete yet - will continue to next page when user clicks generate
  };

  // JEE Mode Context
  const { isJeeMode, setIsJeeMode } = useJeeMode();

  // Set JEE mode based on prop
  useEffect(() => {
    setIsJeeMode(jeeMode);
    console.log(`🎯 Dashboard Mode: ${jeeMode ? "JEE" : "Board"}`);
  }, [jeeMode, setIsJeeMode]);

  // Apply dark mode on component mount
  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  // Feedback Modal - Auto-show after 3 minutes of app usage (only once ever)
  useEffect(() => {
    if (role === "student" && username) {
      const feedbackShownKey = `feedback_auto_shown_${username}`;
      const alreadyShown = localStorage.getItem(feedbackShownKey);

      // If already shown before, don't set timer
      if (alreadyShown === "true") {
        console.log("📝 Feedback already shown before, skipping auto-show");
        return;
      }

      console.log("⏱️ Starting 3-minute timer for feedback modal...");

      // Set 3-minute timer (180000ms)
      const timer = setTimeout(
        () => {
          console.log("✅ 3 minutes passed, showing feedback modal");
          setShowFeedbackModal(true);
          // Mark as shown in localStorage - will never auto-show again
          localStorage.setItem(feedbackShownKey, "true");
        },
        3 * 60 * 1000,
      ); // 3 minutes

      // Cleanup timer on unmount
      return () => {
        clearTimeout(timer);
        console.log("🧹 Feedback timer cleared");
      };
    }
  }, [role, username]);

  // Mascot animation handled in SolveQuestion and ResultPage only

  // Load last session on component mount
  useEffect(() => {
    const loadLastSession = () => {
      try {
        const savedSession = localStorage.getItem(`lastSession_${username}`);
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          // Check if session is recent (within last 7 days)
          const sessionDate = new Date(sessionData.timestamp);
          const daysSinceSession =
            (new Date() - sessionDate) / (1000 * 60 * 60 * 24);

          if (
            daysSinceSession <= 7 &&
            sessionData.questionList &&
            sessionData.questionList.length > 0
          ) {
            setLastSession(sessionData);
            setCanResume(true);
            console.log("✅ Last session loaded:", sessionData);
          } else {
            // Session too old or invalid, clear it
            localStorage.removeItem(`lastSession_${username}`);
          }
        }
      } catch (error) {
        console.error("Error loading last session:", error);
      }
    };

    if (username) {
      loadLastSession();
    }
  }, [username]);

  // Helper function to check if selected subject is Science
  const isScienceSubject = () => {
    if (!selectedSubject || !subjects.length) return false;
    const subject = subjects.find((s) => s.subject_code === selectedSubject);
    return subject && subject.subject_name.toLowerCase().includes("science");
  };

  // Check if the selected subject is a JEE subject
  const isJEESubject = () => {
    if (!selectedSubject) return false;
    const subject = subjects.find((s) => s.subject_code === selectedSubject);
    const subjectName = subject?.subject_name?.toLowerCase() || "";

    // Check if subject name contains JEE indicators
    return (
      subjectName.includes("jee") ||
      subjectName.includes("mathematics_mains") ||
      subjectName.includes("mathematics_advanced") ||
      subjectName.includes("physics_mains") ||
      subjectName.includes("chemistry_mains")
    );
  };

  // Complete mapping of question types with IDs
  const QUESTION_TYPE_MAPPING = [
    {
      id: "1",
      value: "activity_based_questions",
      label: "Activity Based Questions",
    },
    { id: "2", value: "conceptual_questions", label: "Conceptual Questions" },
    {
      id: "3",
      value: "diagram_based_questions",
      label: "Diagram Based Questions",
    },
    { id: "4", value: "fill_in_the_blanks", label: "Fill in the Blanks" },
    { id: "5", value: "matching_questions", label: "Matching Questions" },
    { id: "6", value: "t_f_questions", label: "True/False Questions" },
  ];

  // JEE Mathematics Subtopic Mapping
  const JEE_SUBTOPIC_MAPPING = [
    { id: "1", value: "mcq", label: "Multiple Choice Questions (MCQ)" },
    { id: "2", value: "nvtq", label: "Numerical Value Type Questions (NVTQ)" },
    { id: "3", value: "theorem", label: "Theorem Based Questions" },
  ];

  const getQuestionTypeOptions = () => {
    // For Science subjects - existing logic
    if (isScienceSubject()) {
      if (scienceSubtopics.length > 0) {
        return QUESTION_TYPE_MAPPING.filter((type) =>
          scienceSubtopics.includes(type.id),
        );
      }
      return QUESTION_TYPE_MAPPING;
    }

    // For JEE Mains/Advanced subjects - MCQ/NVTQ/Theorem
    if (isJEEMainsAdvancedSubject()) {
      console.log(
        "🎯 JEE Mains/Advanced Subject detected! Showing MCQ/NVTQ/Theorem options",
      );
      return JEE_SUBTOPIC_MAPPING;
    }

    // For JEE Traditional subjects (Physics, Mathematics, Mathematics_1) - Board-like flow
    if (isJEETraditionalSubject()) {
      console.log(
        "📚 JEE Traditional Subject detected! Showing Solved/Exercise/Worksheet options",
      );
      return [
        { value: "solved", label: "Solved Examples" },
        { value: "external", label: "Book Exercises" },
        { value: "worksheets", label: "Take it to next level with Worksheets" },
      ];
    }

    // For other subjects - existing logic
    return [
      { value: "solved", label: "Solved Examples" },
      { value: "external", label: "Book Exercises" },
      { value: "worksheets", label: "Take it to next level with Worksheets" },
    ];
  };

  // Helper function to check if selected subject is JEE Mains/Advanced (MCQ/NVTQ/Theorem flow)
  const isJEEMainsAdvancedSubject = () => {
    if (!selectedSubject || !subjects.length) return false;
    const subject = subjects.find((s) => s.subject_code === selectedSubject);
    const subjectName = subject?.subject_name?.toLowerCase() || "";

    // Only JEE Mathematics Mains and Advanced use MCQ/NVTQ/Theorem
    return (
      subjectName.includes("mathematics_mains") ||
      subjectName.includes("mathematics_advanced") ||
      subjectName.includes("jee_mathematics_mains") ||
      subjectName.includes("jee_mathematics_advanced")
    );
  };

  // Helper function to check if subject is JEE but uses traditional flow (Solved/Exercise/Worksheet)
  const isJEETraditionalSubject = () => {
    if (!selectedSubject || !subjects.length) return false;
    const subject = subjects.find((s) => s.subject_code === selectedSubject);
    const subjectName = subject?.subject_name?.toLowerCase() || "";

    // JEE Physics, JEE_Mathematics, JEE_Mathematics_1 use traditional flow
    return (
      (subjectName.includes("jee") &&
        !subjectName.includes("mathematics_mains") &&
        !subjectName.includes("mathematics_advanced")) ||
      subjectName === "jee_physics" ||
      subjectName === "jee_mathematics" ||
      subjectName === "jee_mathematics_1"
    );
  };

  // Reset question type when subject changes
  useEffect(() => {
    if (selectedSubject) {
      setQuestionType("");
      setQuestionLevel("");
      setSelectedWorksheet("");
      setScienceSubtopics([]);
      setJeeSubtopics([]); // Add this line
    }
  }, [selectedSubject]);

  // Fetch available subtopics for Science OR JEE subjects when selected with chapters
  useEffect(() => {
    async function fetchSubtopics() {
      // Handle Science subjects (EXISTING - NO CHANGE)
      if (
        isScienceSubject() &&
        selectedClass &&
        selectedSubject &&
        selectedChapters.length > 0
      ) {
        try {
          console.log("🔬 Fetching Science subtopics...");
          const response = await axiosInstance.post(
            "/question-images-paginator/",
            {
              classid: selectedClass,
              subjectid: selectedSubject,
              topicid: selectedChapters,
              external: true,
            },
          );

          if (response.data && response.data.subtopics) {
            setScienceSubtopics(response.data.subtopics);
            console.log(
              "✅ Available Science subtopics:",
              response.data.subtopics,
            );
          } else {
            setScienceSubtopics([]);
          }
        } catch (error) {
          console.error("❌ Error fetching Science subtopics:", error);
          setScienceSubtopics([]);
        }
      }
      // Handle JEE Mains/Advanced subjects (NEW - MCQ/NVTQ/Theorem)
      else if (
        isJEEMainsAdvancedSubject() &&
        selectedClass &&
        selectedSubject &&
        selectedChapters.length > 0
      ) {
        try {
          console.log("📐 Fetching JEE Mains/Advanced subtopics...");
          const response = await axiosInstance.post(
            "/question-images-paginator/",
            {
              classid: selectedClass,
              subjectid: selectedSubject,
              topicid: selectedChapters,
              external: true,
            },
          );

          if (response.data && response.data.subtopics) {
            setJeeSubtopics(response.data.subtopics);
            console.log("✅ Available JEE subtopics:", response.data.subtopics);
          } else {
            setJeeSubtopics([]);
          }
        } catch (error) {
          console.error("❌ Error fetching JEE subtopics:", error);
          setJeeSubtopics([]);
        }
      }
      // Handle JEE Traditional subjects (NEW - fetch subtopics for external only)
      else if (
        isJEETraditionalSubject() &&
        questionType === "external" &&
        selectedClass &&
        selectedSubject &&
        selectedChapters.length > 0
      ) {
        try {
          console.log("📚 Fetching JEE Traditional subtopics...");
          const response = await axiosInstance.post(
            "/question-images-paginator/",
            {
              classid: selectedClass,
              subjectid: selectedSubject,
              topicid: selectedChapters[0],
              external: true,
            },
          );
          setSubTopics(response.data.subtopics || []);
        } catch (error) {
          console.error("❌ Error fetching subtopics:", error);
          setSubTopics([]);
        }
      }
      // Clear all if none match
      else {
        setScienceSubtopics([]);
        setJeeSubtopics([]);
      }
    }
    fetchSubtopics();
  }, [selectedClass, selectedSubject, selectedChapters, questionType]); // Added questionType dependency

  const isGenerateButtonEnabled = () => {
    // Base requirements — must always be true
    if (
      !selectedClass ||
      !selectedSubject ||
      selectedChapters.length === 0 ||
      !questionType
    ) {
      return false;
    }

    // JEE Mains/Advanced: needs a valid subtopic loaded
    if (isJEEMainsAdvancedSubject()) {
      const validTypes = ["mcq", "nvtq", "theorem"];
      return validTypes.includes(questionType) && jeeSubtopics.length > 0;
    }

    // Book Exercises: needs a subtopic/set selected
    if (questionType === "external") {
      return !!questionLevel;
    }

    // Worksheets: needs a worksheet selected
    if (questionType === "worksheets") {
      return !!selectedWorksheet;
    }

    // All other cases (solved, science subtopic, etc.)
    return true;
  };

  // Fetch classes and set defaults with debugging
  useEffect(() => {
    async function fetchData() {
      try {
        // console.log("🔍 Fetching classes...");
        const classResponse = await axiosInstance.get("/classes/");
        // console.log("📋 Classes API Response:", classResponse.data);
        const classesData = classResponse.data.data;

        // Filter classes based on mode
        let filteredClasses = classesData;

        if (isJeeMode) {
          // JEE Mode: Only classes 11 and 12
          filteredClasses = classesData.filter((cls) => {
            const className = cls.class_name.toLowerCase();
            return className.includes("11") || className.includes("12");
          });
          console.log(
            "📐 JEE Mode - Classes:",
            filteredClasses.map((c) => c.class_name),
          );
        } else {
          // Board Mode: All classes
          console.log(
            "📚 Board Mode - Classes:",
            filteredClasses.map((c) => c.class_name),
          );
        }
        setClasses(filteredClasses);

        // Set default class based on username
        const defaultClass = extractClassFromUsername(username);
        // console.log("👤 Username:", username, "Extracted Class:", defaultClass);

        if (defaultClass) {
          const matchingClass = classesData.find(
            (cls) =>
              cls.class_name.includes(defaultClass) ||
              cls.class_code === defaultClass,
          );
          // console.log("🎯 Matching class found:", matchingClass);

          if (matchingClass) {
            setSelectedClass(matchingClass.class_code);
            // console.log("✅ Auto-selected class:", matchingClass.class_code);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching classes", error);
      }
    }
    fetchData();
  }, [username, isJeeMode]);

  // Fetch subjects and set default with enhanced debugging
  useEffect(() => {
    async function fetchSubjects() {
      if (selectedClass) {
        try {
          // console.log("🔍 Fetching subjects for class:", selectedClass);

          const subjectResponse = await axiosInstance.post("/subjects/", {
            class_id: selectedClass,
          });

          // console.log("📚 Subjects API Response:", subjectResponse.data);

          const subjectsData = subjectResponse.data.data;

          // Filter subjects based on mode
          let filteredSubjects = subjectsData;

          // Check if selected class is 8, 9, or 10 (for JEE Foundation)
          const isFoundationClass = ["8", "9", "10"].some((cls) =>
            selectedClass.toString().includes(cls),
          );

          if (isJeeMode) {
            // JEE Mode: Only JEE subjects
            filteredSubjects = subjectsData.filter((subject) => {
              const sn = subject.subject_name.toLowerCase();
              return (
                sn.includes("jee") ||
                sn.includes("mathematics_mains") ||
                sn.includes("mathematics_advanced") ||
                sn.includes("physics_mains") ||
                sn.includes("chemistry_mains")
              );
            });
            console.log(
              "📐 JEE Subjects:",
              filteredSubjects.map((s) => s.subject_name),
            );
          } else {
            // Board Mode: Exclude JEE subjects BUT include JEE Foundation for classes 8, 9, 10
            filteredSubjects = subjectsData.filter((subject) => {
              const sn = subject.subject_name.toLowerCase();

              // Allow JEE Foundation subjects for classes 8, 9, 10
              if (
                isFoundationClass &&
                (sn.includes("jee_foundation") || sn.includes("jee foundation"))
              ) {
                return true;
              }

              // Exclude other JEE subjects
              return !(
                sn.includes("jee") ||
                sn.includes("mathematics_mains") ||
                sn.includes("mathematics_advanced") ||
                sn.includes("physics_mains") ||
                sn.includes("chemistry_mains")
              );
            });
            console.log(
              "📚 Board Subjects:",
              filteredSubjects.map((s) => s.subject_name),
            );
            if (isFoundationClass) {
              console.log(
                "🎯 JEE Foundation enabled for class:",
                selectedClass,
              );
            }
          }

          setSubjects(filteredSubjects);

          // Set default subject
          if (filteredSubjects.length > 0) {
            const mathSubject = filteredSubjects.find((subject) =>
              subject.subject_name.toLowerCase().includes("math"),
            );
            if (mathSubject) {
              setSelectedSubject(mathSubject.subject_code);
              // Also reset downstream when auto-selecting
              setSelectedChapters([]);
              setQuestionType("");
              setQuestionLevel("");
              setSelectedWorksheet("");
            } else {
              setSelectedSubject(filteredSubjects[0].subject_code);
              setSelectedChapters([]);
              setQuestionType("");
              setQuestionLevel("");
              setSelectedWorksheet("");
            }
          }

          // Reset dependent fields
          setSelectedChapters([]);
          setQuestionType("");
          setQuestionLevel("");
          setSelectedWorksheet("");
        } catch (error) {
          console.error("❌ Error fetching subjects:", error);
          console.error("📄 Error details:", error.response?.data);
          setSubjects([]);
        }
      }
    }
    fetchSubjects();
  }, [selectedClass, isJeeMode]);

  // Fetch chapters with comprehensive debugging - FIXED
  useEffect(() => {
    async function fetchChapters() {
      if (selectedSubject && selectedClass) {
        try {
          // console.log("🔍 Fetching chapters with parameters:");
          // console.log("   📖 Subject ID:", selectedSubject);
          // console.log("   🏫 Class ID:", selectedClass);

          const chapterResponse = await axiosInstance.post("/chapters/", {
            subject_id: selectedSubject,
            class_id: selectedClass,
          });

          // console.log("📚 Chapters API Response:", chapterResponse.data);
          // console.log("📊 Response structure:", {
          //   hasData: !!chapterResponse.data.data,
          //   dataLength: chapterResponse.data.data?.length,
          //   firstChapter: chapterResponse.data.data?.[0]
          // });

          if (chapterResponse.data && chapterResponse.data.data) {
            setChapters(chapterResponse.data.data);
            // console.log("✅ Chapters set successfully:", chapterResponse.data.data.length, "chapters");
            // console.log("📝 First few chapters:", chapterResponse.data.data.slice(0, 3));

            // Log the structure of chapters to verify field names
            if (chapterResponse.data.data.length > 0) {
              // console.log("🔍 Chapter structure:", Object.keys(chapterResponse.data.data[0]));
            }
          } else {
            console.warn("⚠ No chapters data found in response");
            setChapters([]);
          }

          setSelectedChapters([]);
          setQuestionType("");
          setQuestionLevel("");
          setSelectedWorksheet("");
        } catch (error) {
          console.error("❌ Error fetching chapters:", error);
          console.error("📄 Error details:", error.response?.data);
          setChapters([]);
        }
      } else {
        // console.log("⚠ Cannot fetch chapters - missing requirements:");
        // console.log("   📖 Selected Subject:", selectedSubject);
        // console.log("   🏫 Selected Class:", selectedClass);
      }
    }
    fetchChapters();
  }, [selectedSubject, selectedClass]);

  // Effect for fetching subtopics when External question type is selected
  useEffect(() => {
    async function fetchSubTopics() {
      if (
        questionType === "external" &&
        selectedClass &&
        selectedSubject &&
        selectedChapters.length > 0
      ) {
        try {
          const response = await axiosInstance.post(
            "/question-images-paginator/",
            {
              classid: selectedClass,
              subjectid: selectedSubject,
              topicid: selectedChapters[0], // Using first chapter for subtopics
              external: true,
            },
          );
          // console.log("Subtopics response:", response);
          setSubTopics(response.data.subtopics || []);
        } catch (error) {
          console.error("Error fetching subtopics:", error);
          setSubTopics([]);
        }
      }
    }
    fetchSubTopics();
  }, [questionType, selectedClass, selectedSubject, selectedChapters]);

  // Effect for fetching worksheets when Worksheets question type is selected
  useEffect(() => {
    async function fetchWorksheets() {
      if (
        questionType === "worksheets" &&
        selectedClass &&
        selectedSubject &&
        selectedChapters.length > 0
      ) {
        try {
          const response = await axiosInstance.post(
            "/question-images-paginator/",
            {
              classid: selectedClass,
              subjectid: selectedSubject,
              topicid: selectedChapters[0], // Using first chapter for worksheets
              worksheets: true,
            },
          );
          // console.log("Worksheets response:", response);
          setWorksheets(response.data.worksheets || []);
        } catch (error) {
          console.error("Error fetching worksheets:", error);
          setWorksheets([]);
        }
      }
    }
    fetchWorksheets();
  }, [questionType, selectedClass, selectedSubject, selectedChapters]);

  const handleWizardSubmit = async (requestData, meta) => {
    try {
      setIsLoading(true);
      console.log("🧙 Wizard submit with:", requestData);

      const response = await axiosInstance.post(
        "/question-images/",
        requestData,
      );
      console.log("Questions response:", response.data);

      if (
        response.data &&
        response.data.questions &&
        Array.isArray(response.data.questions)
      ) {
        const questionsWithImages = response.data.questions.map(
          (question, index) => ({
            ...question,
            id: index,
            question_id: question.id,
            question: question.question,
            context: question.context || null,
            image: question.question_image
              ? `${question.question_image}`
              : null,
          }),
        );

        // Sync state back so handleQuestionClick, handleMultipleSelectSubmit,
        // saveSessionData, and QuestionListModal all work correctly
        setSelectedClass(meta.selClass.class_code);
        setSelectedSubject(meta.selSub.subject_code);
        setSelectedChapters(meta.selChaps.map((c) => c.topic_code));
        setSubjects([meta.selSub]);
        setChapters(meta.selChaps);
        setQuestionType(meta.selQType.value);
        setQuestionLevel(meta.selLevel || "");
        setSelectedWorksheet(meta.selWS || "");

        setQuestionList(questionsWithImages);
        setSelectedQuestions([]);

        // Handle pagination if present
        if (response.data.next || response.data.previous) {
          const totalCount = response.data.count || questionsWithImages.length;
          setPaginationInfo({
            next: response.data.next || null,
            previous: response.data.previous || null,
            count: totalCount,
            currentPage: 1,
            totalPages: Math.ceil(totalCount / 15),
            isLoading: false,
          });
        } else {
          setPaginationInfo({
            next: null,
            previous: null,
            count: questionsWithImages.length,
            currentPage: 1,
            totalPages: 1,
            isLoading: false,
          });
        }

        setShowQuestionList(true);
      } else {
        showAlert("No questions available for this selection", "warning");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      showAlert(
        error.response?.data?.message ||
          "Failed to generate questions. Please try again.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isGenerateButtonEnabled()) {
      console.error("Please select all required fields");
      return;
    }

    const requestData = {
      classid: Number(selectedClass),
      subjectid: Number(selectedSubject),
      topicid: selectedChapters,
    };

    // ✅ For Science subjects
    if (isScienceSubject()) {
      const selectedQuestionType = QUESTION_TYPE_MAPPING.find(
        (type) => type.value === questionType,
      );

      if (selectedQuestionType) {
        requestData.subtopic = selectedQuestionType.id;
        console.log(
          "🔬 Sending Science request with subtopic:",
          selectedQuestionType.id,
        );
      }
    }
    // ✅ For JEE Mains/Advanced subjects
    else if (isJEEMainsAdvancedSubject()) {
      const idMap = { mcq: "1", nvtq: "2", theorem: "3" };

      if (questionType && idMap[questionType]) {
        requestData.subtopic = idMap[questionType];
        console.log(
          "📐 Sending JEE Mains/Advanced request with subtopic:",
          idMap[questionType],
        );
      }
    }
    // ✅ For JEE Traditional subjects
    else if (isJEETraditionalSubject()) {
      requestData.solved = questionType === "solved";
      requestData.exercise = questionType === "exercise";
      requestData.subtopic = questionType === "external" ? questionLevel : null;
      requestData.worksheet_name =
        questionType === "worksheets" ? selectedWorksheet : null;
      console.log("📚 Sending JEE Traditional request:", requestData);
    }
    // ✅ For other subjects
    else {
      requestData.solved = questionType === "solved";
      requestData.exercise = questionType === "exercise";
      requestData.subtopic = questionType === "external" ? questionLevel : null;
      requestData.worksheet_name =
        questionType === "worksheets" ? selectedWorksheet : null;
    }

    try {
      setIsLoading(true);
      console.log("Requesting questions with:", requestData);

      const response = await axiosInstance.post(
        "/question-images/",
        requestData,
      );
      console.log("Questions response:", response.data);

      // Process questions if they exist
      if (
        response.data &&
        response.data.questions &&
        Array.isArray(response.data.questions)
      ) {
        console.log("Questions found:", response.data.questions.length);
        const questionsWithImages = response.data.questions.map(
          (question, index) => ({
            ...question,
            id: index,
            question_id: question.id,
            question: question.question,
            context: question.context || null,
            image: question.question_image
              ? `${question.question_image}`
              : null,
          }),
        );

        setQuestionList(questionsWithImages);
        setSelectedQuestions([]);

        // Set pagination info if available
        if (response.data.next || response.data.previous) {
          const pageSize = 15;
          const totalCount = response.data.count || questionsWithImages.length;
          const totalPages = Math.ceil(totalCount / pageSize);

          setPaginationInfo({
            next: response.data.next || null,
            previous: response.data.previous || null,
            count: totalCount,
            currentPage: 1,
            totalPages: totalPages,
            isLoading: false,
          });
        } else {
          setPaginationInfo({
            next: null,
            previous: null,
            count: questionsWithImages.length,
            currentPage: 1,
            totalPages: 1,
            isLoading: false,
          });
        }

        setShowQuestionList(true);
      } else {
        console.error("No questions found in response");
        showAlert("No questions available for this selection", "warning");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error generating questions:", error);
      showAlert(
        error.response?.data?.message ||
          "Failed to generate questions. Please try again.",
        "error",
      );
      setIsLoading(false);
    }
  };

  // Fetch paginated questions (for Next/Previous)
  const fetchPaginatedQuestions = async (url) => {
    if (!url) return;

    setPaginationInfo((prev) => ({ ...prev, isLoading: true }));

    try {
      // Extract page number from URL
      const urlObj = new URL(url);
      const pageNum = parseInt(urlObj.searchParams.get("page")) || 1;

      console.log(`📄 Fetching page ${pageNum}...`);

      const response = await axiosInstance.get(url);
      console.log("📥 Paginated response:", response.data);

      // Process questions with images and context
      const questionsWithImages = (response.data.questions || []).map(
        (question, index) => ({
          ...question,
          id: index,
          question_id: question.id,
          question: question.question,
          context: question.context || null,
          image: question.question_image ? `${question.question_image}` : null,
        }),
      );

      setQuestionList(questionsWithImages);
      setSelectedQuestions([]);

      // Update pagination info
      const pageSize = 15;
      const totalCount = response.data.count || questionsWithImages.length;
      const totalPages = Math.ceil(totalCount / pageSize);

      setPaginationInfo({
        next: response.data.next || null,
        previous: response.data.previous || null,
        count: totalCount,
        currentPage: pageNum,
        totalPages: totalPages,
        isLoading: false,
      });

      console.log(`✅ Page ${pageNum} loaded successfully`);
    } catch (error) {
      console.error("❌ Error fetching paginated questions:", error);
      showAlert("Failed to load questions. Please try again.", "error");
      setPaginationInfo((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle Next Page
  const handleNextPage = () => {
    if (paginationInfo.next && !paginationInfo.isLoading) {
      fetchPaginatedQuestions(paginationInfo.next);
    }
  };

  // Handle Previous Page
  const handlePrevPage = () => {
    if (paginationInfo.previous && !paginationInfo.isLoading) {
      fetchPaginatedQuestions(paginationInfo.previous);
    }
  };

  // Save session data to localStorage
  const saveSessionData = (sessionData) => {
    try {
      const dataToSave = {
        ...sessionData,
        timestamp: new Date().toISOString(),
        username: username,
      };
      localStorage.setItem(
        `lastSession_${username}`,
        JSON.stringify(dataToSave),
      );
      console.log("💾 Session saved:", dataToSave);
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  // Resume learning from last session
  const handleResumeLearning = () => {
    if (!lastSession) return;

    console.log("▶️ Resuming learning from:", lastSession);

    navigate("/solvequestion", {
      state: {
        question: lastSession.question,
        question_id: lastSession.question_id,
        questionNumber: lastSession.questionNumber,
        questionList: lastSession.questionList,
        class_id: lastSession.class_id,
        subject_id: lastSession.subject_id,
        topic_ids: lastSession.topic_ids,
        subtopic: lastSession.subtopic,
        worksheet_id: lastSession.worksheet_id,
        image: lastSession.image,
        context: lastSession.context,
        selectedQuestions: lastSession.selectedQuestions || [],
        isResuming: true, // Flag to indicate this is a resume
      },
    });
  };

  // Enhanced question click handler
  const handleQuestionClick = (
    question,
    index,
    image,
    question_id,
    context,
  ) => {
    // console.log("Question clicked:", { question, index, image, question_id, context });

    setShowQuestionList(false);

    // Get chapter names for the selected chapters
    const chapterNames = selectedChapters.map((chapterId) => {
      const chapter = chapters.find((ch) => ch.topic_code === chapterId);
      return chapter ? chapter.name : "Unknown Chapter";
    });

    // Get subject name
    const subjectName =
      subjects.find((s) => s.subject_code === selectedSubject)?.subject_name ||
      "Unknown Subject";

    const sessionData = {
      question,
      question_id: question_id,
      questionNumber: index + 1,
      questionList,
      class_id: selectedClass,
      subject_id: selectedSubject,
      subject_name: subjectName,
      topic_ids: selectedChapters,
      chapter_names: chapterNames,
      subtopic: questionType === "external" ? questionLevel : "",
      worksheet_id: questionType === "worksheets" ? selectedWorksheet : "",
      image,
      context: context || null,
      selectedQuestions: questionList,
      // MODIFIED: Only pass jeeQuestionType for Mains/Advanced subjects
      jeeQuestionType: isJEEMainsAdvancedSubject() ? questionType : null,
    };

    // Save session before navigating
    saveSessionData(sessionData);

    navigate("/solvequestion", {
      state: sessionData,
    });
  };

  const handleMultipleSelectSubmit = (selectedQuestionsData) => {
    setSelectedQuestions(selectedQuestionsData);
    setShowQuestionList(false);

    const firstQuestion = selectedQuestionsData[0];

    // Get chapter names for the selected chapters
    const chapterNames = selectedChapters.map((chapterId) => {
      const chapter = chapters.find((ch) => ch.topic_code === chapterId);
      return chapter ? chapter.name : "Unknown Chapter";
    });

    // Get subject name
    const subjectName =
      subjects.find((s) => s.subject_code === selectedSubject)?.subject_name ||
      "Unknown Subject";

    const sessionData = {
      question: firstQuestion.question,
      question_id: firstQuestion.question_id,
      questionNumber: firstQuestion.index + 1,
      questionList,
      class_id: selectedClass,
      subject_id: selectedSubject,
      subject_name: subjectName,
      topic_ids: selectedChapters,
      chapter_names: chapterNames,
      subtopic: questionType === "external" ? questionLevel : "",
      worksheet_id: questionType === "worksheets" ? selectedWorksheet : "",
      image: firstQuestion.image,
      context: firstQuestion.context || null,
      selectedQuestions: selectedQuestionsData,
      jeeQuestionType: isJEEMainsAdvancedSubject() ? questionType : null,
    };

    // Save session before navigating
    saveSessionData(sessionData);

    navigate("/solvequestion", {
      state: sessionData,
    });
  };

  // Reset dependent fields when question type changes
  useEffect(() => {
    if (questionType !== "external") {
      setQuestionLevel("");
    }
    if (questionType !== "worksheets") {
      setSelectedWorksheet("");
    }
  }, [questionType]);

  // Enhanced styles for react-select with portal rendering - MEMOIZED to prevent forced reflow
  const selectStyles = useMemo(
    () => ({
      control: (provided, state) => ({
        ...provided,
        backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
        borderColor: state.isFocused
          ? isDarkMode
            ? "#7c3aed"
            : "#667eea"
          : isDarkMode
            ? "#475569"
            : "#e2e8f0",
        color: isDarkMode ? "#f1f5f9" : "#2d3748",
        minHeight: "56px",
        border: `2px solid ${
          state.isFocused
            ? isDarkMode
              ? "#7c3aed"
              : "#667eea"
            : isDarkMode
              ? "#475569"
              : "#e2e8f0"
        }`,
        borderRadius: "12px",
        boxShadow: state.isFocused
          ? `0 0 0 4px ${isDarkMode ? "rgba(124, 58, 237, 0.1)" : "rgba(102, 126, 234, 0.1)"}`
          : "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          borderColor: isDarkMode ? "#6366f1" : "#5a67d8",
        },
      }),
      menuPortal: (provided) => ({
        ...provided,
        zIndex: 10000,
        position: "fixed",
      }),
      menu: (provided) => ({
        ...provided,
        backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
        zIndex: 10000,
        borderRadius: "12px",
        border: `2px solid ${isDarkMode ? "#7c3aed" : "#667eea"}`,
        boxShadow: isDarkMode
          ? "0 25px 50px -12px rgba(0, 0, 0, 0.9)"
          : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        maxHeight: "500px",
        overflow: "hidden",
        position: "fixed",
        width: "auto",
        minWidth: "450px",
        maxWidth: "600px",
      }),
      menuList: (provided) => ({
        ...provided,
        maxHeight: "470px",
        padding: "12px",
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "thin",
        scrollbarColor: `${isDarkMode ? "#7c3aed" : "#667eea"} ${isDarkMode ? "#334155" : "#f8fafc"}`,
        "&::-webkit-scrollbar": {
          width: "12px",
        },
        "&::-webkit-scrollbar-track": {
          background: isDarkMode ? "#334155" : "#f8fafc",
          borderRadius: "6px",
          margin: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: isDarkMode ? "#7c3aed" : "#667eea",
          borderRadius: "6px",
          border: `2px solid ${isDarkMode ? "#334155" : "#f8fafc"}`,
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: isDarkMode ? "#6366f1" : "#5a67d8",
        },
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused
          ? isDarkMode
            ? "#7c3aed"
            : "#667eea"
          : state.isSelected
            ? isDarkMode
              ? "#6366f1"
              : "#5a67d8"
            : isDarkMode
              ? "#1e293b"
              : "#ffffff",
        color:
          state.isFocused || state.isSelected
            ? "#ffffff"
            : isDarkMode
              ? "#f1f5f9"
              : "#2d3748",
        padding: "16px 20px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: state.isSelected ? "600" : "500",
        lineHeight: "1.5",
        whiteSpace: "normal",
        wordWrap: "break-word",
        minHeight: "50px",
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${isDarkMode ? "#475569" : "#f1f5f9"}`,
        transition: "all 0.2s ease",
        position: "relative",
        "&:hover": {
          backgroundColor: isDarkMode ? "#7c3aed" : "#667eea",
          color: "#ffffff",
          transform: "translateX(4px)",
        },
        "&:last-child": {
          borderBottom: "none",
        },
      }),
      multiValue: (provided) => ({
        ...provided,
        backgroundColor: isDarkMode ? "#6366f1" : "#667eea",
        borderRadius: "8px",
        margin: "3px",
        padding: "2px",
      }),
      multiValueLabel: (provided) => ({
        ...provided,
        color: "#ffffff",
        fontWeight: "600",
        fontSize: "13px",
        padding: "6px 10px",
      }),
      multiValueRemove: (provided) => ({
        ...provided,
        color: "#ffffff",
        borderRadius: "0 8px 8px 0",
        "&:hover": {
          backgroundColor: "#ef4444",
          color: "#ffffff",
          transform: "scale(1.1)",
        },
      }),
      placeholder: (provided) => ({
        ...provided,
        color: isDarkMode ? "#94a3b8" : "#6b7280",
        fontSize: "15px",
        fontWeight: "500",
      }),
      singleValue: (provided) => ({
        ...provided,
        color: isDarkMode ? "#f1f5f9" : "#2d3748",
        fontSize: "15px",
        fontWeight: "600",
      }),
      dropdownIndicator: (provided, state) => ({
        ...provided,
        color: isDarkMode ? "#94a3b8" : "#6b7280",
        transform: state.selectProps.menuIsOpen
          ? "rotate(180deg)"
          : "rotate(0deg)",
        transition: "transform 0.3s ease",
        "&:hover": {
          color: isDarkMode ? "#7c3aed" : "#667eea",
        },
      }),
      clearIndicator: (provided) => ({
        ...provided,
        color: isDarkMode ? "#94a3b8" : "#6b7280",
        "&:hover": {
          color: isDarkMode ? "#ef4444" : "#dc2626",
        },
      }),
      indicatorSeparator: (provided) => ({
        ...provided,
        backgroundColor: isDarkMode ? "#475569" : "#e2e8f0",
      }),
    }),
    [isDarkMode],
  );

  return (
    <>
      <AlertContainer />

      {/* Feedback Modal - Auto-shows after 3 mins, only once */}
      <FeedbackBox
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      <div className={`student-dash-wrapper ${isDarkMode ? "dark-mode" : ""}`}>
        {/* Main Content - Sidebar removed (now in Layout.jsx) */}
        <div className="main-content-fixed ">
          <Container className="py-4">
            {/* 3:1 Grid Layout - Main Content and Right Sidebar */}
            <div className="dashboard-grid-layout">
              {/* Left Side - Main Content (3 parts) */}
              <div className="dashboard-main-content">
                <div className="greeting-content">
                  <div className="greeting-text">
                    <h1>
                      {getTimeBasedGreeting()},{" "}
                      {localStorage.getItem("fullName") || username}! 👋
                    </h1>
                    <p
                      style={{
                        fontSize: "14px",
                        color: isJeeMode ? "#7c3aed" : "#667eea",
                        fontWeight: "600",
                        marginTop: "8px",
                        marginBottom: "0",
                      }}
                    >
                      {isJeeMode ? "JEE Preparation Mode" : "Board Exam Mode"}
                    </p>
                  </div>
                  <div className="current-date-wrapper">
                    <div className="current-date">
                      <span className="date-label">Today</span>
                      <span className="date-value">
                        {new Date().toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {/* Tutorial Toggle Button */}
                    <button
                      className="tutorial-toggle-btn"
                      onClick={() => startTutorialForPage("studentDash")}
                      title="Start Tutorial"
                    >
                      <FontAwesomeIcon icon={faQuestionCircle} />
                      <span>Tutorial</span>
                    </button>
                    {/* Dark Mode Toggle Button */}
                    <button
                      className="dark-mode-toggle-btn"
                      onClick={toggleDarkMode}
                      title={
                        isDarkMode
                          ? "Switch to Light Mode"
                          : "Switch to Dark Mode"
                      }
                    >
                      <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
                    </button>
                  </div>
                </div>

                {/* Progress & Resume Learning Grid Section */}
                <div
                  className="progress-resume-grid"
                  style={{
                    // display: 'grid',
                    gridTemplateColumns: "1fr",
                    gap: "24px",
                    marginBottom: "24px",
                    marginTop: "20px",
                  }}
                >
                  {/* Left Column - Quiz Score Graph */}
                  <div className="progress-graph-column">
                    <QuizScoreGraph />
                  </div>

                  {/* Right Column - Resume Learning Section */}
                </div>

                {/* Enhanced Learning Adventure Section */}
                {/* Progressive Wizard */}
                <div className="learning-adventure-section">
                  <div className="form-container">
                    <WizardSelector
                      username={username}
                      isDarkMode={isDarkMode}
                      isJeeMode={isJeeMode}
                      onReadyToSubmit={handleWizardSubmit}
                    />
                  </div>
                </div>

                {/* Recent Sessions */}
                {role === "student" && <UnifiedSessions />}
              </div>
              {/* Right Side - Sidebar (1 part) */}
              <div className="dashboard-right-sidebar">
                {/* Streak Tracker */}
                <StreakTracker />

                {/* Live Notifications */}
                <LiveNotifications />
                {canResume && lastSession && (
                  <div
                    className="resume-learning-section"
                    style={{
                      background: isDarkMode
                        ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                        : "linear-gradient(135deg, rgb(95 123 248) 0%, rgb(97 111 242) 100%)",
                      borderRadius: "16px",
                      padding: "24px",
                      boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)",
                      border: `2px solid ${isDarkMode ? "#7c3aed" : "#667eea"}`,
                      position: "relative",
                      overflow: "hidden",
                      height: "40vh",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Background decoration */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-50px",
                        right: "-50px",
                        width: "200px",
                        height: "200px",
                        background: "rgba(255, 255, 255, 0.1)",
                        borderRadius: "50%",
                        filter: "blur(40px)",
                      }}
                    />

                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "12px",
                          color: "#ffffff",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faRocket}
                          style={{
                            fontSize: "24px",
                            marginRight: "12px",
                            animation: "pulse 2s infinite",
                          }}
                        />
                        <span
                          style={{
                            margin: 0,
                            fontSize: "20px",
                            fontWeight: "700",
                            color: "white",
                          }}
                        >
                          Continue Learning
                        </span>
                      </div>

                      <div
                        style={{
                          color: "#ffffff",
                          opacity: 0.95,
                          fontSize: "14px",
                          marginBottom: "16px",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faBookOpen}
                            style={{ marginRight: "8px", width: "16px" }}
                          />
                          <span>
                            <strong>Subject:</strong>{" "}
                            {lastSession.subject_name || "Unknown"}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            marginBottom: "8px",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faListAlt}
                            style={{
                              marginRight: "8px",
                              width: "16px",
                              marginTop: "3px",
                            }}
                          />
                          <span>
                            <strong>Chapter:</strong>{" "}
                            {lastSession.chapter_names &&
                            lastSession.chapter_names.length > 0 ? (
                              <span>
                                {lastSession.chapter_names[0]}
                                {lastSession.chapter_names.length > 1 &&
                                  ` (+${lastSession.chapter_names.length - 1} more)`}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faClipboardQuestion}
                            style={{ marginRight: "8px", width: "16px" }}
                          />
                          <span>
                            <strong>Progress:</strong> Question{" "}
                            {lastSession.questionNumber} of{" "}
                            {lastSession.questionList?.length || 0}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <FontAwesomeIcon
                            icon={faCalendarAlt}
                            style={{ marginRight: "8px", width: "16px" }}
                          />
                          <span>
                            <strong>Last active:</strong>{" "}
                            {new Date(lastSession.timestamp).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div
                        style={{
                          width: "100%",
                          height: "8px",
                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                          borderRadius: "4px",
                          overflow: "hidden",
                          marginBottom: "16px",
                        }}
                      >
                        <div
                          style={{
                            width: `${(lastSession.questionNumber / (lastSession.questionList?.length || 1)) * 100}%`,
                            height: "100%",
                            background:
                              "linear-gradient(90deg, rgb(84 250 195) 0%, rgb(21 188 136) 100%)",
                            borderRadius: "4px",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>

                      {/* Buttons */}
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={handleResumeLearning}
                          style={{
                            background:
                              "linear-gradient(135deg, rgb(84 250 195) 0%, rgb(21 188 136) 100%)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "12px",
                            padding: "14px 28px",
                            fontSize: "15px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            boxShadow: "0 8px 20px rgba(16, 185, 129, 0.4)",
                            transition: "all 0.3s ease",
                            whiteSpace: "nowrap",
                            flex: 1,
                            justifyContent: "center",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "translateY(-2px)";
                            e.target.style.boxShadow =
                              "0 12px 28px rgba(16, 185, 129, 0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow =
                              "0 8px 20px rgba(16, 185, 129, 0.4)";
                          }}
                        >
                          <FontAwesomeIcon icon={faRocket} />
                          Resume
                        </button>

                        <button
                          onClick={() => {
                            localStorage.removeItem(`lastSession_${username}`);
                            setCanResume(false);
                            setLastSession(null);
                            showAlert(
                              "Session cleared successfully",
                              "success",
                            );
                          }}
                          style={{
                            background: "transparent",
                            color: "#ffffff",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            borderRadius: "12px",
                            padding: "14px 20px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background =
                              "rgba(255, 255, 255, 0.1)";
                            e.target.style.borderColor =
                              "rgba(255, 255, 255, 0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = "transparent";
                            e.target.style.borderColor =
                              "rgba(255, 255, 255, 0.3)";
                          }}
                        >
                          Start Fresh
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </div>

        {/* Enhanced Question List Modal */}
        <QuestionListModal
          show={showQuestionList}
          onHide={() => setShowQuestionList(false)}
          questionList={questionList}
          onQuestionClick={handleQuestionClick}
          isMultipleSelect={false}
          onMultipleSelectSubmit={handleMultipleSelectSubmit}
          worksheetName={questionType === "worksheets" ? selectedWorksheet : ""}
          paginationInfo={paginationInfo}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
        />

        {/* Tutorial Component */}
        {shouldShowTutorialForPage("studentDash") && (
          <Tutorial steps={tutorialSteps} onComplete={handleTutorialComplete} />
        )}

        {/* Mascot is shown on SolveQuestion and ResultPage only to prevent WebGL context issues */}
      </div>
    </>
  );
}

export default StudentDash;
