import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Modal.css';
import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PSODashboard = () => {
  const [projects] = useState([
    {
      id: 1,
      name: 'Acme Corp Zoom Phone Deployment',
      customer: 'Acme Corporation',
      status: 'In Progress',
      progress: 65,
      dueDate: '2025-04-15'
    },
    {
      id: 2,
      name: 'TechStar Contact Center Setup',
      customer: 'TechStar Inc',
      status: 'Not Started',
      progress: 0,
      dueDate: '2025-05-01'
    },
    {
      id: 3,
      name: 'Global Enterprises VoIP Migration',
      customer: 'Global Enterprises',
      status: 'Completed',
      progress: 100,
      dueDate: '2025-03-30'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    customer: '',
    status: 'Not Started',
    due_date: '',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({
      ...newProject,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/projects`,
        newProject,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setNewProject({
        name: '',
        customer: '',
        status: 'Not Started',
        due_date: '',
        description: ''
      });
      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  return (
    <Container>
      <Row className="mt-4 mb-4">
        <Col>
          <h2>PSO Manager Dashboard</h2>
          <p>Manage your UAT projects and monitor customer testing progress</p>
        </Col>
        <Col xs="auto">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowModal(true)}
          >
            Create New Project
          </button>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Projects Overview</Card.Title>
              <div className="d-flex justify-content-between my-2">
                <div>Total Projects</div>
                <div><strong>{projects.length}</strong></div>
              </div>
              <div className="d-flex justify-content-between my-2">
                <div>In Progress</div>
                <div><strong>{projects.filter(p => p.status === 'In Progress').length}</strong></div>
              </div>
              <div className="d-flex justify-content-between my-2">
                <div>Completed</div>
                <div><strong>{projects.filter(p => p.status === 'Completed').length}</strong></div>
              </div>
              <div className="d-flex justify-content-between my-2">
                <div>Not Started</div>
                <div><strong>{projects.filter(p => p.status === 'Not Started').length}</strong></div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Active Projects</Card.Title>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(project => (
                    <tr key={project.id}>
                      <td>{project.name}</td>
                      <td>{project.customer}</td>
                      <td>
                        <Badge bg={
                          project.status === 'Completed' ? 'success' :
                          project.status === 'In Progress' ? 'primary' :
                          'secondary'
                        }>
                          {project.status}
                        </Badge>
                      </td>
                      <td>{project.progress}%</td>
                      <td>{project.dueDate}</td>
                      <td>
                        <Link to={`/test-execution/${project.id}`}>
                          <Button variant="outline-primary" size="sm">View Tests</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Project</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Project Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={newProject.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="customer" className="form-label">Customer</label>
                    <input
                      type="text"
                      className="form-control"
                      id="customer"
                      name="customer"
                      value={newProject.customer}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="due_date" className="form-label">Go-Live Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="due_date"
                      name="due_date"
                      value={newProject.due_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={newProject.description}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">Create Project</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default PSODashboard;

