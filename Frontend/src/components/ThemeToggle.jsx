import React from 'react';
import { useTheme } from '../contexts/useTheme';

const ThemeToggle = () => {
  const { isDarkTheme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
      aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
    >
      {isDarkTheme ? '☀️' : '🌙'}
    </button>
  );
};

export { ThemeToggle };
