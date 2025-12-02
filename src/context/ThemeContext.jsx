import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.body.className = isDark ? 'dark-theme' : 'light-theme';
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: {
      primary: isDark ? '#0d6efd' : '#0d6efd',
      secondary: isDark ? '#6c757d' : '#6c757d',
      success: isDark ? '#198754' : '#198754',
      warning: isDark ? '#ffc107' : '#ffc107',
      danger: isDark ? '#dc3545' : '#dc3545',
      info: isDark ? '#0dcaf0' : '#0dcaf0',
      background: isDark ? '#121212' : '#ffffff',
      surface: isDark ? '#1e1e1e' : '#f8f9fa',
      text: isDark ? '#ffffff' : '#212529',
      textSecondary: isDark ? '#adb5bd' : '#6c757d',
      border: isDark ? '#343a40' : '#dee2e6'
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;