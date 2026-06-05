import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import GradientBackground from './components/GradientBackground.jsx';
import GlassFilter from './components/GlassFilter.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import HomePage from './pages/HomePage.jsx';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <GlassFilter />
        <GradientBackground />
      <LanguageProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Navigate to="/en" replace />} />
          <Route path="/en" element={<HomePage />} />
          <Route path="/sv" element={<HomePage />} />
          <Route path="/no" element={<HomePage />} />
          <Route path="/fr" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/en" replace />} />
        </Routes>
      </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;