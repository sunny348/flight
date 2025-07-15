import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const themeColors = {
  primary: {
    50: "#EEF5FF",
    100: "#D5E5FF",
    200: "#ADC8FF",
    300: "#84A9FF",
    400: "#6690FF",
    500: "#3366FF", // Main primary color
    600: "#254EDB",
    700: "#1939B7",
    800: "#102693",
    900: "#091A7A",
  },
  secondary: {
    50: "#F8F9FC",
    100: "#F1F3F9",
    200: "#E3E7F0",
    300: "#D0D5E0",
    400: "#9AA1B9",
    500: "#717899", // Main secondary color
    600: "#4A516E",
    700: "#2C324B",
    800: "#161D36",
    900: "#0A0F29",
  },
  accent: {
    50: "#FFEDE6",
    100: "#FFD1C2",
    200: "#FFB199",
    300: "#FF9270",
    400: "#FF7A53",
    500: "#FF5722", // Main accent color
    600: "#DB4315",
    700: "#B7300B",
    800: "#932005",
    900: "#7A1602",
  },
  success: "#34D399",
  error: "#F87171",
  warning: "#FBBF24",
  info: "#60A5FA",
  background: "#F5F7FA",
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check user preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const savedMode = localStorage.getItem("darkMode");
    const initialDarkMode =
      savedMode !== null ? savedMode === "true" : prefersDark;

    setDarkMode(initialDarkMode);

    // Apply theme
    applyTheme(initialDarkMode);

    // Add class to body
    if (initialDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const applyTheme = (isDark) => {
    const root = document.documentElement;

    // Remove any existing theme classes
    root.classList.remove("light-theme", "dark-theme");

    // Add appropriate theme class
    root.classList.add(isDark ? "dark-theme" : "light-theme");

    // Toggle dark mode class for Tailwind
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply CSS variables
    if (isDark) {
      root.style.setProperty("--color-bg-primary", "#121826");
      root.style.setProperty("--color-bg-secondary", "#1E293B");
      root.style.setProperty("--color-text-primary", "#F1F5F9");
      root.style.setProperty("--color-text-secondary", "#94A3B8");
      root.style.setProperty("--color-primary", themeColors.primary[400]);
      root.style.setProperty("--color-accent", themeColors.accent[400]);
    } else {
      root.style.setProperty("--color-bg-primary", themeColors.background);
      root.style.setProperty("--color-bg-secondary", "#FFFFFF");
      root.style.setProperty("--color-text-primary", "#1E293B");
      root.style.setProperty("--color-text-secondary", "#64748B");
      root.style.setProperty("--color-primary", themeColors.primary[500]);
      root.style.setProperty("--color-accent", themeColors.accent[500]);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    localStorage.setItem("darkMode", newMode.toString());
    setDarkMode(newMode);
    applyTheme(newMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
