import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import PSODashboard from './pages/PSODashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import TestExecution from './pages/TestExecution';
import Navbar from './components/Navbar';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppContent() {
  const { currentUser: _currentUser } = useAuth();

  return (
    <>
      {_currentUser && <Navbar user={_currentUser} />}
      <div className="container mt-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              {_currentUser?.role === 'pso_manager' || _currentUser?.role === 'project_engineer' ? 
                <PSODashboard /> : <CustomerDashboard />}
            </ProtectedRoute>
          } />
          <Route path="/test-execution/:projectId" element={
            <ProtectedRoute>
              <TestExecution />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;


