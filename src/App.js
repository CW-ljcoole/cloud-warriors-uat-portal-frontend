import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="container mt-4">
        <h1>Cloud Warriors UAT Portal</h1>
        <p>Simplified version for debugging</p>
        <div className="alert alert-info">
          This is a test deployment to identify rendering issues.
        </div>
      </div>
    </Router>
  );
}

export default App;



