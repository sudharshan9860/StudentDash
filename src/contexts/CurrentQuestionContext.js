import React, { createContext, useContext, useState } from 'react';

const CurrentQuestionContext = createContext();

export function CurrentQuestionProvider({ children }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);

  return (
    <CurrentQuestionContext.Provider value={{ currentQuestion, setCurrentQuestion }}>
      {children}
    </CurrentQuestionContext.Provider>
  );
}

export function useCurrentQuestion() {
  const context = useContext(CurrentQuestionContext);
  if (!context) {
    throw new Error('useCurrentQuestion must be used within a CurrentQuestionProvider');
  }
  return context;
} 