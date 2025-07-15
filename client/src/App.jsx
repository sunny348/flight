import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useTheme } from "./components/ui/Theme";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const FlightSearchPage = lazy(() => import("./pages/FlightSearchPage"));
const FlightResultsPage = lazy(() => import("./pages/FlightResultsPage"));
const BookingsPage = lazy(() => import("./pages/BookingsPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const EditBookingPage = lazy(() => import("./pages/EditBookingPage"));

// Theme detector component to ensure dark mode is applied correctly
const ThemeDetector = () => {
  const { darkMode } = useTheme();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeDetector />
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        }>
        <Routes>
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={<HomePage />}
            />
            <Route
              path="/login"
              element={<LoginPage />}
            />
            <Route
              path="/signup"
              element={<SignupPage />}
            />
            <Route
              path="/flights"
              element={<FlightSearchPage />}
            />
            <Route
              path="/flight-results"
              element={<FlightResultsPage />}
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <BookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-flight"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-booking/:bookingId"
              element={
                <ProtectedRoute>
                  <EditBookingPage />
                </ProtectedRoute>
              }
            />
            {/* Add other routes here */}
          </Route>
        </Routes>
      </Suspense>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default App;
