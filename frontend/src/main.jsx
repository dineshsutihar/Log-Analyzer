import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

const Dashboard = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <h1 className="text-2xl font-bold">Dashboard Coming Soon</h1>
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  </StrictMode>
)
