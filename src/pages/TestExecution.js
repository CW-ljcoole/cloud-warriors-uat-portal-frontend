import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const TestExecution = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [completionStatus, setCompletionStatus] = useState({
    total: 0,
    completed: 0,
    passed: 0,
    failed: 0,
    percentage: 0
  });
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Group test results by category and subcategory
  const [groupedTests, setGroupedTests] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch project details
        const projectResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/projects/${projectId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setProject(projectResponse.data);
        
        // Fetch test results for this project
        const resultsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/test-results/project/${projectId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        setTestResults(resultsResponse.data);
        
        // Calculate completion status
        const total = resultsResponse.data.length;
        const completed = resultsResponse.data.filter(
          test => test.status === 'Passed' || test.status === 'Failed'
        ).length;
        const passed = resultsResponse.data.filter(
          test => test.status === 'Passed'
        ).length;
        const failed = resultsResponse.data.filter(
          test => test.status === 'Failed'
        ).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        setCompletionStatus({
          total,
          completed,
          passed,
          failed,
          percentage
        });
        
        // Check if all tests are completed and show completion modal
        if (total > 0 && completed === total) {
          setShowCompletionModal(true);
        }
        
        // Group tests by category and subcategory
        const grouped = {};
        resultsResponse.data.forEach(result => {
          const category = result.scenario.category.name;
          const subcategory = result.scenario.subcategory;
          
          if (!grouped[category]) {
            grouped[category] = {};
          }
          
          if (!grouped[category][subcategory]) {
            grouped[category][subcategory] = [];
          }
          
          grouped[category][subcategory].push(result);
        });
        
        setGroupedTests(grouped);
        
        // If user is a manager or engineer, fetch users for assignment
        if (currentUser.role === 'pso_manager' || currentUser.role === 'project_engineer') {
          const usersResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/users`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          // Filter to only show customer users
          const customerUsers = usersResponse.data.filter(
            user => user.role === 'customer_admin' || user.role === 'customer_user'
          );
          
          setUsers(customerUsers);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load test data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, currentUser]);

  const handleStatusChange = async (testResultId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/test-results/${testResultId}`,
        { status: newStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setTestResults(prevResults => 
        prevResults.map(result => 
          result._id === testResultId 
            ? { ...result, status: newStatus } 
            : result
        )
      );
      
      // Update grouped tests
      const updatedGrouped = { ...groupedTests };
      Object.keys(updatedGrouped).forEach(category => {
        Object.keys(updatedGrouped[category]).forEach(subcategory => {
          updatedGrouped[category][subcategory] = updatedGrouped[category][subcategory].map(
            result => result._id === testResultId 
              ? { ...result, status: newStatus } 
              : result
          );
        });
      });
      
      setGroupedTests(updatedGrouped);
      
      // Recalculate completion status
      const total = testResults.length;
      const completed = testResults.filter(
        test => (test._id === testResultId ? newStatus : test.status) === 'Passed' || 
                (test._id === testResultId ? newStatus : test.status) === 'Failed'
      ).length;
      const passed = testResults.filter(
        test => (test._id === testResultId ? newStatus : test.status) === 'Passed'
      ).length;
      const failed = testResults.filter(
        test => (test._id === testResultId ? newStatus : test.status) === 'Failed'
      ).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      setCompletionStatus({
        total,
        completed,
        passed,
        failed,
        percentage
      });
      
      // Check if all tests are completed
      if (total > 0 && completed === total) {
        setShowCompletionModal(true);
      }
      
      // Update project progress
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/projects/${projectId}/progress`,
        { progress: percentage },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
    } catch (error) {
      console.error('Error updating test status:', error);
      alert('Failed to update test status. Please try again.');
    }
  };

  const handleNotesChange = async (testResultId, notes) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/test-results/${testResultId}`,
        { notes },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setTestResults(prevResults => 
        prevResults.map(result => 
          result._id === testResultId 
            ? { ...result, notes } 
            : result
        )
      );
      
      // Update grouped tests
      const updatedGrouped = { ...groupedTests };
      Object.keys(updatedGrouped).forEach(category => {
        Object.keys(updatedGrouped[category]).forEach(subcategory => {
          updatedGrouped[category][subcategory] = updatedGrouped[category][subcategory].map(
            result => result._id === testResultId 
              ? { ...result, notes } 
              : result
          );
        });
      });
      
      setGroupedTests(updatedGrouped);
      
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Failed to update notes. Please try again.');
    }
  };

  const openAssignModal = (testResult) => {
    setCurrentTest(testResult);
    setSelectedUser(testResult.assigned_to || '');
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/test-results/${currentTest._id}/assign`,
        { assigned_to: selectedUser },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setTestResults(prevResults => 
        prevResults.map(result => 
          result._id === currentTest._id 
            ? { ...result, assigned_to: selectedUser } 
            : result
        )
      );
      
      // Update grouped tests
      const updatedGrouped = { ...groupedTests };
      Object.keys(updatedGrouped).forEach(category => {
        Object.keys(updatedGrouped[category]).forEach(subcategory => {
          updatedGrouped[category][subcategory] = updatedGrouped[category][subcategory].map(
            result => result._id === currentTest._id 
              ? { ...result, assigned_to: selectedUser } 
              : result
          );
        });
      });
      
      setGroupedTests(updatedGrouped);
      
      setShowAssignModal(false);
      
    } catch (error) {
      console.error('Error assigning test:', error);
      alert('Failed to assign test. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div>
      <h1 className="mb-3">Test Execution - {project?.name}</h1>
      <p className="lead">Execute test scenarios and record results</p>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Project Details</h5>
              <p><strong>Customer:</strong> {project?.customer}</p>
              <p><strong>Go-Live Date:</strong> {new Date(project?.due_date).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {project?.status}</p>
              <div className="progress mb-2">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${completionStatus.percentage}%` }}
                  aria-valuenow={completionStatus.percentage} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                  {completionStatus.percentage}%
                </div>
              </div>
              <p><strong>Tests Completed:</strong> {completionStatus.completed} of {completionStatus.total}</p>
              <p><strong>Passed:</strong> {completionStatus.passed} <span className="text-success">✓</span></p>
              <p><strong>Failed:</strong> {completionStatus.failed} <span className="text-danger">✗</span></p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Zoom Phone and Contact Center Test Categories */}
      {Object.keys(groupedTests).map(category => (
        <div key={category} className="card mb-4">
          <div className="card-header">
            <h3>{category}</h3>
          </div>
          <div className="card-body">
            {Object.keys(groupedTests[category]).map(subcategory => (
              <div key={subcategory} className="mb-4">
                <h4 className="mb-3">{subcategory}</h4>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Test Description</th>
                        <th>Status</th>
                        <th>Notes</th>
                        {(currentUser.role === 'pso_manager' || currentUser.role === 'project_engineer') && (
                          <th>Assigned To</th>
                        )}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedTests[category][subcategory].map(testResult => (
                        <tr key={testResult._id}>
                          <td>{testResult.scenario.description}</td>
                          <td>
                            {testResult.status === 'Passed' && (
                              <span className="badge bg-success">Passed</span>
                            )}
                            {testResult.status === 'Failed' && (
                              <span className="badge bg-danger">Failed</span>
                            )}
                            {testResult.status === 'Not Started' && (
                              <span className="badge bg-secondary">Not Started</span>
                            )}
                          </td>
                          <td>
                            <textarea
                              className="form-control"
                              value={testResult.notes || ''}
                              onChange={(e) => handleNotesChange(testResult._id, e.target.value)}
                              placeholder="Add notes here..."
                              rows="2"
                            ></textarea>
                          </td>
                          {(currentUser.role === 'pso_manager' || currentUser.role === 'project_engineer') && (
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openAssignModal(testResult)}
                              >
                                {testResult.assigned_to ? 
                                  users.find(u => u._id === testResult.assigned_to)?.first_name || 'Assign' : 
                                  'Assign'}
                              </button>
                            </td>
                          )}
                          <td>
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={() => handleStatusChange(testResult._id, 'Passed')}
                            >
                              Pass
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleStatusChange(testResult._id, 'Failed')}
                            >
                              Fail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Test</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAssignModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Test:</strong> {currentTest?.scenario.description}</p>
                <div className="mb-3">
                  <label htmlFor="assignUser" className="form-label">Assign to:</label>
                  <select
                    className="form-select"
                    id="assignUser"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleAssign}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">UAT Testing Complete!</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowCompletionModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <div className="mb-4">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                </div>
                <h4>Congratulations!</h4>
                <p>You have completed all UAT testing for this project.</p>
                <div className="mt-3">
                  <p><strong>Summary:</strong></p>
                  <p>Total Tests: {completionStatus.total}</p>
                  <p>Passed: {completionStatus.passed} ({Math.round((completionStatus.passed / completionStatus.total) * 100)}%)</p>
                  <p>Failed: {completionStatus.failed} ({Math.round((completionStatus.failed / completionStatus.total) * 100)}%)</p>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => setShowCompletionModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Background overlay for modals */}
      {(showAssignModal || showCompletionModal) && (
        <div 
          className="modal-backdrop fade show" 
          onClick={() => {
            setShowAssignModal(false);
            setShowCompletionModal(false);
          }}
        ></div>
      )}
    </div>
  );
};

export default TestExecution;

