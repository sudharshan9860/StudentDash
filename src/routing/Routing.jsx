// src/routing/Routing.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../components/LoginPage";
import StudentDash from "../components/StudentDash";
import SolveQuestion from "../components/SolveQuestion";
import ResultPage from '../components/ResultPage';
import SignupPage from "../components/SignupPage";
import PrivateRoute from "../components/PrivateRoute";
import Layout from "../components/Layout";
import QuestionListModal from "../components/QuestionListModal";
import Analytics from "../components/Analytics";
import SimilarQuestions from "../components/SimilarQuestions";
import LeaderboardPage from "../components/LeaderBoardPage";
import ProgressDashboard from "../components/ProgressDashboard";
import QuestsPage from "../components/QuestsPage";
import TeacherDash from "../components/EnhancedTeacherDash";
import HomeworkSubmissionForm from "../components/HomeworkSubmissionForm";
import StudentGapAnalysisReport from "../components/StudentGapAnalysisReport";
import WorksheetSubmission from "../components/WorksheetSubmission";
import RouteTracker from "../components/RouteTracker";
import StudentAnalytics from "../components/StudentAnalytics";
import ExamCorrection from "../components/ExamCorrection";
import ExamAnalytics from "../components/ExamAnalytics";
import ChatRoom from "../components/ChatRoom";
import ExamMode from "../components/ExamMode";
import ExamQuestion from "../components/ExamQuestion";
import ExamResult from "../components/ExamResult";
import LearningPathSession from "../components/LearningPathSession";
import LearningPathQuestion from "../components/LearningPathQuestion";
import LearningPathResult from "../components/LearningPathResult";
// import AnimationTester from '../components/AnimationTester';
import TeacherStudentDetailsView from "../components/TeacherStudentDetailsView";
import MascotTest from "../components/MascotTest";
// import ThreeJSScene from "../components/ThreeJSScene";


const AppRoutes = () => {
  // Read last visited route from localStorage
  const lastRoute = localStorage.getItem("lastRoute");

  return (
    <>
      {/* This tracks and stores the current route */}
      <RouteTracker />

      <Routes>
        {/* Root path → go to lastRoute if exists, else login */}
        <Route
          path="/"
          element={<Navigate to={lastRoute || "/login"} replace />}
        />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/mascot-test" element={<MascotTest />} />

        <Route
          path="/student-dash"
          element={
            <PrivateRoute>
              <Layout>
                <StudentDash />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* NEW JEE dashboard route */}
        <Route
          path="/jee-dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <StudentDash jeeMode={true} />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/teacher-dash"
          element={
            <PrivateRoute>
              <Layout>
                <TeacherDash />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/worksheet-submission"
          element={
            <PrivateRoute>
              <Layout>
                <WorksheetSubmission />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/solvequestion"
          element={
            <PrivateRoute>
              <Layout>
                <SolveQuestion />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* <Route path="/animation-tester" element={<AnimationTester />} /> */}


        <Route
          path="/progress-dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <ProgressDashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/questionlistmodal"
          element={
            <PrivateRoute>
              <Layout>
                <QuestionListModal />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/resultpage"
          element={
            <PrivateRoute>
              <Layout>
                <ResultPage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/similar-questions"
          element={
            <PrivateRoute>
              <Layout>
                <SimilarQuestions />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Layout>
                <StudentAnalytics />  {/* Changed from Analytics to StudentAnalytics */}
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/homework"
          element={
            <PrivateRoute>
              <Layout>
                <HomeworkSubmissionForm />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Exam Correction Route - Teacher Only */}
        <Route
          path="/exam-correction"
          element={
            <PrivateRoute>
              <Layout>
                <ExamCorrection />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/exam-mode"
          element={
            <PrivateRoute>
              <Layout>
                <ExamMode />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/exam-question"
          element={
            <PrivateRoute>
              <Layout>
                <ExamQuestion />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/exam-result"
          element={
            <PrivateRoute>
              <Layout>
                <ExamResult />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/learning-path-session"
          element={
            <PrivateRoute>
              <Layout>
                <LearningPathSession />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/learning-path-question"
          element={
            <PrivateRoute>
              <Layout>
                <LearningPathQuestion />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/learning-path-result"
          element={
            <PrivateRoute>
              <Layout>
                <LearningPathResult />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/exam-analytics"
          element={
            <PrivateRoute>
              <Layout>
                <ExamAnalytics />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/teacher-dash/exam-analytics/:examId/student/:studentResultId"
          element={
            <PrivateRoute>
              <Layout>
                <TeacherStudentDetailsView />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <PrivateRoute>
              <Layout>
                <LeaderboardPage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/gap-analysis-report"
          element={
            <PrivateRoute>
              <Layout>
                <StudentGapAnalysisReport />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/quests"
          element={
            <PrivateRoute>
              <Layout>
                <QuestsPage />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Fallback for unknown paths */}
        <Route path="*" element={<LoginPage />} />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Layout>
                <ChatRoom />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* <Route
          path="/3d-viewer"
          element={
            <PrivateRoute>
              <Layout>
                <ThreeJSScene />
              </Layout>
            </PrivateRoute>
          }
        /> */}

        <Route path="*" element={<LoginPage />} />
      </Routes>
    </>
  );
};

export default AppRoutes;