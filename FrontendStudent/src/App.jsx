// FrontendStudent/src/App.jsx
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import StudentNavbar from "./components/StudentNavbar";
import NoteCraftsDashboard from "./Pages/NoteCraftsDashboard";
import CourseDetailPage from "./Pages/CourseDetailPage";
import StudentNotesPage from "./Pages/StudentNotesPage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// Import existing tab components
import Quiz from "./Pages/Quiz";
import NotesAndAssignments from "./Pages/NotesAndAssignments";
import TestPapers from "./Pages/TestPapers";

function StudentLayout() {
  return (
    <>
      <StudentNavbar />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
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
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<NoteCraftsDashboard />} />
        
        {/* Course Detail with Nested Routes */}
        <Route path="course/:id" element={<CourseDetailPage />}>
          {/* Default redirect to notes */}
          <Route index element={<Navigate to="notes" replace />} />
          
          {/* Tab Routes */}
          <Route path="notes" element={<StudentNotesPage />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="assignment" element={<NotesAndAssignments />} />
          <Route path="test" element={<TestPapers />} />
        </Route>
      </Route>

      {/* Redirect any unknown route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}