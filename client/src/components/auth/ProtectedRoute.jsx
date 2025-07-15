import React from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You can render a loading spinner or a blank page while checking auth status
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-700">
          Loading authentication status...
        </p>
        {/* Or a spinner component */}
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // If `children` prop is provided, render it (for wrapping specific components directly).
  // If not, render <Outlet /> (for use in nested route configurations where this is a parent route).
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
