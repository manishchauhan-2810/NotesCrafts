// FrontendTeacher/src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./Pages/Dashboard";
import ClassDetail from "./Pages/ClassDetail";
import TestResultsViewer from "./Pages/TestResultsViewer";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

export default function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedClass, setSelectedClass] = useState(null);

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
        path="/classdetails/:classId/testpapers/viewresults/:testId"
        element={
          <ProtectedRoute requiredRole="teacher">
            <TestResultsViewer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute requiredRole="teacher">
            {currentPage === "dashboard" ? (
              <Dashboard
                onClassClick={(classData) => {
                  setSelectedClass(classData);
                  setCurrentPage("class");
                }}
              />
            ) : (
              <ClassDetail
                classData={selectedClass}
                onBack={() => setCurrentPage("dashboard")}
              />
            )}
          </ProtectedRoute>
        }
      />

      {/* 🚧 Redirect any unknown route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
