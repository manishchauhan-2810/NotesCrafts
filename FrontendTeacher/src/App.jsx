// FrontendTeacher/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./Pages/Dashboard";
import ClassDetail from "./Pages/ClassDetail";
import TestResultsViewer from "./Pages/TestResultsViewer";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";

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

      {/* 🎯 Dynamic Class Detail Route with unique classId */}
      <Route
        path="/class/:classId"
        element={
          <ProtectedRoute requiredRole="teacher">
            <ClassDetail />
          </ProtectedRoute>
        }
      />

      {/* Test Results Route */}
      <Route
        path="/class/:classId/testpapers/viewresults/:testId"
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