import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const PSODashboard = () => {
  // In a real app, you would fetch this data from your backend API
  const [projects, setProjects] = useState([
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

  return (
    <Container>
      <Row className="mt-4 mb-4">
        <Col>
          <h2>PSO Manager Dashboard</h2>
          <p>Manage your UAT projects and monitor customer testing progress</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary">Create New Project</Button>
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
    </Container>
  );
};

export default PSODashboard;
