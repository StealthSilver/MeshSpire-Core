import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { token } = useAuth();

  // If no token, redirect to signin page
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  // Otherwise, render the children
  return <>{children}</>;
};

export default PrivateRoute;
