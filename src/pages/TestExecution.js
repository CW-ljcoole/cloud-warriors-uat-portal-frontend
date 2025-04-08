import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api'; // Import the api service

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
        
        // Fetch project details using the api service
        const projectResponse = await api.get(`/api/projects/${projectId}`);
        setProject(projectResponse.data);
        
        // Fetch test results for this project using the api service
        const resultsResponse = await api.get(`/api/test-results/project/${projectId}`);
        const results = resultsResponse.data || [];
        setTestResults(results);
        
        // Calculate completion status with proper error handling
        const total = results.length;
        const completed = results.filter(
          test => test?.status === 'Passed' || test?.status === 'Failed'
        ).length;
        const passed = results.filter(
          test => test?.status === 'Passed'
        ).length;
        const failed = results.filter(
          test => test?.status === 'Failed'
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
        
        // Group tests by category and subcategory with proper error handling
        const grouped = {};
        results.forEach(result => {
          if (!result || !result.scenario) return; // Skip invalid results
          
          // Use optional chaining to safely access nested properties
          const category = result.scenario?.category?.name || 'Uncategorized';
          const subcategory = result.scenario?.subcategory || 'General';
          
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
        if (currentUser?.role === 'pso_manager' || currentUser?.role === 'project_engineer') {
          try {
            const usersResponse = await api.get('/api/users');
            
            // Filter to only show customer users with error handling
            const customerUsers = (usersResponse.data || []).filter(
              user => user?.role === 'customer_admin' || user?.role === 'customer_user'
            );
            
            setUsers(customerUsers);
          } catch (userError) {
            console.error('Error fetching users:', userError);
            // Don't fail the whole component if just the users fetch fails
          }
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
      // Use the api service
      await api.put(`/api/test-results/${testResultId}`, { status: newStatus });
      
      // Update local state with error handling
      setTestResults(prevResults => 
        prevResults.map(result => 
          result?._id === testResultId 
            ? { ...result, status: newStatus } 
            : result
        )
      );
      
      // Update grouped tests with error handling
      const updatedGrouped = { ...groupedTests };
      Object.keys(updatedGrouped).forEach(category => {
        Object.keys(updatedGrouped[category] || {}).forEach(subcategory => {
          if (updatedGrouped[category][subcategory]) {
            updatedGrouped[category][subcategory] = updatedGrouped[category][subcategory].map(
              result => result?._id === testResultId 
                ? { ...result, status: newStatus } 
                : result
            );
          }
        });
      });
      
      setGroupedTests(updatedGrouped);
      
      // Recalculate completion status with error handling
      const total = testResults.length;
      const completed = testResults.filter(
        test => (test?._id === testResultId ? newStatus : test?.status) === 'Passed' || 
                (test?._id === testResultId ? newStatus : test?.status) === 'Failed'
      ).length;
      const passed = testResults.filter(
        test => (test?._id === testResultId ? newStatus : test?.status) === 'Passed'
      ).length;
      const failed = testResults.filter(
        test => (test?._id === testResultId ? newStatus : test?.status) === 'Failed'
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
      try {
        await api.put(`/api/projects/${projectId}/progress`, { progress: percentage });
      } catch (progressError) {
        console.error('Error updating project progress:', progressError);
        // Don't fail if just the progress update fails
      }
      
    } catch (error) {
      console.error('Error updating test status:', error);
      alert('Failed to update test status. Please try again.');
    }
  };

  const handleNotesChange = async (testResultId, notes) => {
    try {
      // Use the api service
      await api.put(`/api/test-results/${testResultId}`, { notes });
      
      // Update local state with error handling
      setTestResults(prevResults => 
        prevResults.map(result => 
          result?._id === testResultId 
            ? { ...result, notes } 
            : result
        )
      );
      
      // Update grouped tests with error handling
      const updatedGrouped = { ...groupedTests };
      Object.keys(updatedGrouped).forEach(category => {
        Object.keys(updatedGrouped[category] || {}).forEach(subcategory => {
          if (updatedGrouped[category][subcategory]) {
            updatedGrouped[category][subcategory] = updatedGrouped[category][subcategory].map(
              result => result?._id === testResultId 
                ? { ...result, notes } 
                : result
            );
          }
        });
      });
      
      setGroupedTests(updatedGrouped);
      
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('Failed to update notes. Please try again.');
    }
  };

  const openAssignModal = (testResult) => {
    if (!testResult) return;
    setCurrentTest(testResult);
    setSelectedUser(testResult.assigned_to || '');
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!currentTest) return;
    
    try {
      // Use the api service
      await api.put(`/api/test-results/${currentTest._id}/assign`, { assigned_to: selectedUser });
      
      // Update local state with error handling
      setTestResults(prevResults => 
        prevResults.map(result => 
          result?._id === currentTest._id 
            ? { ...result, assigned_to: selectedUser } 
            : result
        )
      );
      
      // Update grouped tests with error handling
      const updatedGrouped = { ...groupedTests };
      Object.keys(updatedGrouped).forEach(category => {
        Object.keys(updatedGrouped[category] || {}).forEach(subcategory => {
          if (updatedGrouped[category][subcategory]) {
            updatedGrouped[category][subcategory] = updatedGrouped[category][subcategory].map(
              result => result?._id === currentTest._id 
                ? { ...result, assigned_to: selectedUser } 
                : result
            );
          }
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
      <h1 className="mb-3">Test Execution - {project?.name || 'Loading...'}</h1>
      <p className="lead">Execute test scenarios and record results</p>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Project Details</h5>
              <p><strong>Customer:</strong> {project?.customer || 'N/A'}</p>
              <p><strong>Go-Live Date:</strong> {project?.due_date ? new Date(project.due_date).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Status:</strong> {project?.status || 'N/A'}</p>
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
      
      {/* Render test categories only if there are any */}
      {Object.keys(groupedTests).length > 0 ? (
        Object.keys(groupedTests).map(category => (
          <div key={category} className="card mb-4">
            <div className="card-header">
              <h3>{category}</h3>
            </div>
            <div className="card-body">
              {Object.keys(groupedTests[category] || {}).map(subcategory => (
                <div key={subcategory} className="mb-4">
                  <h4 className="mb-3">{subcategory}</h4>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Test Description</th>
                          <th>Status</th>
                          <th>Notes</th>
                          {(currentUser?.role === 'pso_manager' || currentUser?.role === 'project_engineer') && (
                            <th>Assigned To</th>
                          )}
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(groupedTests[category][subcategory] || []).map(testResult => (
                          <tr key={testResult?._id}>
                            <td>{testResult?.scenario?.description || 'No description'}</td>
                            <td>
                              {testResult?.status === 'Passed' && (
                                <span className="badge bg-success">Passed</span>
                              )}
                              {testResult?.status === 'Failed' && (
                                <span className="badge bg-danger">Failed</span>
                              )}
                              {(!testResult?.status || testResult.status === 'Not Started') && (
                                <span className="badge bg-secondary">Not Started</span>
                              )}
                            </td>
                            <td>
                              <textarea
                                className="form-control"
                                value={testResult?.notes || ''}
                                onChange={(e) => handleNotesChange(testResult?._id, e.target.value)}
                                placeholder="Add notes here..."
                                rows="2"
                              ></textarea>
                            </td>
                            {(currentUser?.role === 'pso_manager' || currentUser?.role === 'project_engineer') && (
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => openAssignModal(testResult)}
                                >
                                  {testResult?.assigned_to ? 
                                    users.find(u => u?._id === testResult.assigned_to)?.first_name || 'Assign' : 
                                    'Assign'}
                                </button>
                              </td>
                            )}
                            <td>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => testResult?._id && handleStatusChange(testResult._id, 'Passed')}
                                disabled={!testResult?._id}
                              >
                                Pass
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => testResult?._id && handleStatusChange(testResult._id, 'Failed')}
                                disabled={!testResult?._id}
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
        ))
      ) : (
        <div className="alert alert-info">No test scenarios found for this project.</div>
      )}
      
      {/* Assignment Modal */}
      {showAssignModal && currentTest && (
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
                <p><strong>Test:</strong> {currentTest?.scenario?.description || 'No description'}</p>
                <div className="mb-3">
                  <label htmlFor="assignUser" className="form-label">Assign to User</label>
                  <select 
                    id="assignUser"
                    className="form-select" 
                    value={selectedUser} 
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user?._id} value={user?._id}>
                        {user?.first_name} {user?.last_name} ({user?.email})
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
                <h5 className="modal-title">Testing Complete!</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowCompletionModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>All test scenarios have been completed for this project.</p>
                <div className="text-center mb-3">
                  <div className="display-1 text-success">✓</div>
                </div>
                <p><strong>Total Tests:</strong> {completionStatus.total}</p>
                <p><strong>Passed:</strong> {completionStatus.passed}</p>
                <p><strong>Failed:</strong> {completionStatus.failed}</p>
                <p><strong>Pass Rate:</strong> {completionStatus.total > 0 ? 
                  Math.round((completionStatus.passed / completionStatus.total) * 100) : 0}%</p>
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
    </div>
  );
};

export default TestExecution;

