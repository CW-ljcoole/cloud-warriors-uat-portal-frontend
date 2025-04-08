import React, { Suspense, ErrorBoundary } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import PSODashboard from './pages/PSODashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import TestExecution from './pages/TestExecution';
import Navbar from './components/Navbar';
import './App.css';

// Error Boundary Component
class ErrorBoundaryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong.</h2>
          <p>The application encountered an error. Please try refreshing the page.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
              <summary>Error Details</summary>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component for Suspense
const Loading = () => (
  <div className="text-center mt-5">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Protected route component with improved error handling
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <>
      {currentUser && <Navbar user={currentUser} />}
      <div className="container mt-4">
        <ErrorBoundaryComponent>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  {currentUser?.role === 'pso_manager' || currentUser?.role === 'project_engineer' ? 
                    <PSODashboard /> : <CustomerDashboard />}
                </ProtectedRoute>
              } />
              <Route path="/test-execution/:projectId" element={
                <ProtectedRoute>
                  <TestExecution />
                </ProtectedRoute>
              } />
              <Route path="*" element={
                <div className="text-center mt-5">
                  <h2>Page Not Found</h2>
                  <p>The page you are looking for does not exist.</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => window.history.back()}
                  >
                    Go Back
                  </button>
                </div>
              } />
            </Routes>
          </Suspense>
        </ErrorBoundaryComponent>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundaryComponent>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ErrorBoundaryComponent>
    </Router>
  );
}

export default App;


