// FrontendStudent/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import StudentNavbar from "./components/StudentNavbar";
import NoteCraftsDashboard from "./Pages/NoteCraftsDashboard";
import CourseDetailPage from "./Pages/CourseDetailPage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

export default function App() {
  return (
    <Routes>
      {/* Public routes (blocked if logged in) */}
      <Route
        path="/login"
        element={
          <PublicRoute currentRole="student">
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute currentRole="student">
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected student routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentNavbar />
          </ProtectedRoute>
        }
      >
        <Route index element={<NoteCraftsDashboard />} />
        <Route path="course/:id" element={<CourseDetailPage />} />
      </Route>

      {/* Redirect any unknown route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
