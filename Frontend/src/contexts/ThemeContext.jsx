import React, { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply theme to document
    if (isDarkTheme) {
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
    }
    
    // Save preference
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  const value = {
    isDarkTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext };
