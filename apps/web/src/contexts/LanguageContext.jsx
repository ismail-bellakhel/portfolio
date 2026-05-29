import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations.js';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const path = window.location.pathname;
    const langMatch = path.match(/^\/(en|sv|no|fr)/);
    if (langMatch) {
      setLanguage(langMatch[1]);
    }
  }, []);

  const changeLanguage = (newLang) => {
    const currentPath = window.location.pathname;
    const currentLangMatch = currentPath.match(/^\/(en|sv|no|fr)/);
    
    let newPath;
    if (currentLangMatch) {
      newPath = currentPath.replace(/^\/(en|sv|no|fr)/, `/${newLang}`);
    } else {
      newPath = `/${newLang}${currentPath}`;
    }
    
    const currentScroll = window.scrollY;
    
    setLanguage(newLang);
    window.history.pushState({}, '', newPath);
    
    requestAnimationFrame(() => {
      window.scrollTo(0, currentScroll);
    });
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};