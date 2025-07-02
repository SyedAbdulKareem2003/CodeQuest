import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MCQProblems from "./pages/MCQProblems";
import CodingProblems from "./pages/CodingProblems";
import CodingSolve from "./pages/CodingSolve";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Auth from "./pages/Auth";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import MCQSingleQuestion from "./pages/MCQSingleQuestion";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Home />} />

        {/* Protected routes */}
        <Route
          path="/mcq"
          element={
            <ProtectedRoute>
              <MCQProblems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mcq/:id"
          element={
            <ProtectedRoute>
              <MCQSingleQuestion />
            </ProtectedRoute>
          }
       />
        <Route
          path="/coding"
          element={
            <ProtectedRoute>
              <CodingProblems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coding/:id"
          element={
            <ProtectedRoute>
              <CodingSolve />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;