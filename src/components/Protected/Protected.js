import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuth = sessionStorage.getItem("isAuthenticated") === "true";
  const allow = sessionStorage.getItem("allowHomeOnce");
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/home" && allow) {
      sessionStorage.removeItem("allowHomeOnce");
    }
  }, [location.pathname, allow]);

  if (!isAuth || !allow) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
