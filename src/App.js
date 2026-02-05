// src/App.js
import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./components/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import { LeaderboardProvider } from "./contexts/LeaderboardContext";
import { QuestProvider } from "./contexts/QuestContext";
import { CurrentQuestionProvider } from "./contexts/CurrentQuestionContext";
import { UserTypeProvider } from "./contexts/UserTypeContext";
import AppRoutes from "./routing/Routing";
import ChatBox from "./components/ChatBox";
import FeedbackBox from "./components/FeedbackBox";
import "./styles/theme.css";
import { TutorialProvider } from "./contexts/TutorialContext";
import { TimerProvider } from "./contexts/TimerContext";
import { MascotProvider } from "./contexts/MascotContext";
import MascotPreloader from "./components/MascotPreloader";
import { JeeModeProvider } from './contexts/JeeModeContext';
import RouteTracker from "./components/RouteTracker";

// Marketing pages where we don't want to show ChatBox/FeedbackBox
const MARKETING_PAGES = [
  "/", "/about", "/features", "/courses", "/contact",
  "/students", "/schools", "/privacy", "/terms", "/refund",
  "/get-started", "/free-trial", "/payment-success",
  "/login", "/signup"
];

// Wrapper component to use location hook
function AppContent() {
  const location = useLocation();

  // Check if current path is a marketing page or exam-question (hide chatbox on these pages)
  const isMarketingPage = MARKETING_PAGES.includes(location.pathname) || location.pathname === "/exam-question";

  return (
    <>
      <RouteTracker />
      <AppRoutes />
      {!isMarketingPage && (
        <>
          <FeedbackBox />
          <ChatBox />
        </>
      )}
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <UserTypeProvider>
        <JeeModeProvider>
          <AuthProvider>
            <NotificationProvider>
              <ProgressProvider>
                <TimerProvider>
                  <LeaderboardProvider>
                    <QuestProvider>
                      <TutorialProvider>
                        <MascotProvider>
                          <CurrentQuestionProvider>
                            <Router
                              future={{
                                v7_startTransition: true,
                                v7_relativeSplatPath: true,
                              }}
                            >
                              <MascotPreloader />
                              <AppContent />
                            </Router>
                          </CurrentQuestionProvider>
                        </MascotProvider>
                      </TutorialProvider>
                    </QuestProvider>
                  </LeaderboardProvider>
                </TimerProvider>
              </ProgressProvider>
            </NotificationProvider>
          </AuthProvider>
        </JeeModeProvider>
      </UserTypeProvider>
    </HelmetProvider>
  );
}
export default App;
