// src/routes/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function ProtectedRoute({ children, requiredRole }) {
  const user = getUser();
  const [redirecting, setRedirecting] = useState(false);

  // If no user -> redirect to /login
  if (!user) return <Navigate to="/login" replace />;

  // ⭐ ONLY check role if requiredRole is provided AND user has a role
  if (requiredRole && user.role && user.role !== requiredRole) {
    const target =
      user.role === "teacher"
        ? import.meta.env.VITE_TEACHER_URL || "http://localhost:5174"
        : import.meta.env.VITE_STUDENT_URL || "http://localhost:5173";

    useEffect(() => {
      try {
        const targetOrigin = new URL(target).origin;
        if (window.location.origin !== targetOrigin) {
          localStorage.removeItem("user");
          setRedirecting(true);
          window.location.replace(target);
        }
      } catch {
        localStorage.removeItem("user");
        setRedirecting(true);
        window.location.replace(target);
      }
    }, [target]);

    if (redirecting) return null;
    return <Navigate to="/login" replace />;
  }

  // If user.role is missing, allow access on this app (prevents incorrect cross-redirect)
  return children;
}