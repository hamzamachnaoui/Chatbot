import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatThemeProvider } from "./contexts/ChatThemeContext";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <ChatThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/chat/:roomId" element={<ChatPage />} />
            <Route path="/chat" element={<Navigate to="/chat/Général" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ChatThemeProvider>
    </AuthProvider>
  );
}

export default App;
