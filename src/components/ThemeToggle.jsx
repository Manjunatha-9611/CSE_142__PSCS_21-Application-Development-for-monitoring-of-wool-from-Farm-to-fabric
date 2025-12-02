import React from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={isDark ? t('lightMode') : t('darkMode')}
    >
      <i className={`fas fa-${isDark ? 'sun' : 'moon'}`}></i>
    </button>
  );
};

export default ThemeToggle;