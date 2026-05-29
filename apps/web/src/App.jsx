import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import HomePage from './pages/HomePage.jsx';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;