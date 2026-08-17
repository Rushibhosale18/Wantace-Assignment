import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicEstimator from './pages/PublicEstimator';
import OwnerPanel from './pages/OwnerPanel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicEstimator />} />
        <Route path="/admin" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<OwnerPanel />} />
        <Route path="/admin/panel" element={<OwnerPanel />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
