// FrontendTeacher/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./Pages/Dashboard";
import ClassDetail from "./Pages/ClassDetail";
import TestResultsViewer from "./Pages/TestResultsViewer";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";

// Import new tab pages
import NotesPage from "./Pages/NotesPage";
import QuizzesPage from "./components/QuizzesPage";
import TestPapersPage from "./components/TestPapersPage";
import DoubtsPage from "./Pages/DoubtsPage";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

export default function App() {
  return (
    <Routes>
      {/* 🔓 Public Routes (accessible only when not logged in) */}
      <Route
        path="/login"
        element={
          <PublicRoute currentRole="teacher">
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute currentRole="teacher">
            <Signup />
          </PublicRoute>
        }
      />

      {/* 🔒 Protected Routes (accessible only for logged-in teachers) */}
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRole="teacher">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 🎯 Class Detail Routes - Main Layout */}
      <Route
        path="/class/:classId"
        element={
          <ProtectedRoute requiredRole="teacher">
            <ClassDetail />
          </ProtectedRoute>
        }
      >
        {/* Nested Routes for Tabs */}
        <Route index element={<Navigate to="notes" replace />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="quizzes" element={<QuizzesPage />} />
        <Route path="test-papers" element={<TestPapersPage />} />
        <Route path="doubts" element={<DoubtsPage />} />
      </Route>

      {/* Test Results Route */}
      <Route
        path="/class/:classId/test-papers/results/:testId"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TestResultsViewer />
          </ProtectedRoute>
        }
      />

      {/* 🚧 Redirect any unknown route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}