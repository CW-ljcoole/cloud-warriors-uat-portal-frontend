import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import pages
import Login from './pages/Login';
import PSODashboard from './pages/PSODashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import TestExecution from './pages/TestExecution';
import NotFound from './pages/NotFound';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  const handleLogin = (authenticated, role) => {
    setIsAuthenticated(authenticated);
    setUserRole(role);
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route 
          path="/pso-dashboard" 
          element={
            isAuthenticated && userRole === 'pso_manager' ? 
            <PSODashboard /> : 
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/customer-dashboard" 
          element={
            isAuthenticated && ['customer_admin', 'customer_supervisor', 'customer_agent'].includes(userRole) ? 
            <CustomerDashboard /> : 
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/test-execution/:projectId" 
          element={
            isAuthenticated ? 
            <TestExecution /> : 
            <Navigate to="/" />
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
