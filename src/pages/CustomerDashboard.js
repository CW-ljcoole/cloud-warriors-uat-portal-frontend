import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  // In a real app, you would fetch this data from your backend API
  const [projects] = useState([
    {
      id: 1,
      name: 'Zoom Phone Deployment',
      status: 'In Progress',
      progress: 65,
      dueDate: '2025-04-15',
      totalTests: 24,
      completedTests: 16,
      passedTests: 14,
      failedTests: 2
    }
  ]);

  return (
    <Container>
      <Row className="mt-4 mb-4">
        <Col>
          <h2>Customer Dashboard</h2>
          <p>Track your UAT testing progress and manage test scenarios</p>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Testing Progress</Card.Title>
              {projects.map(project => (
                <div key={project.id}>
                  <div className="d-flex justify-content-between my-2">
                    <div>Project:</div>
                    <div><strong>{project.name}</strong></div>
                  </div>
                  <div className="d-flex justify-content-between my-2">
                    <div>Due Date:</div>
                    <div><strong>{project.dueDate}</strong></div>
                  </div>
                  <div className="d-flex justify-content-between my-2">
                    <div>Overall Progress:</div>
                    <div><strong>{project.progress}%</strong></div>
                  </div>
                  <ProgressBar className="mt-2 mb-3">
                    <ProgressBar variant="success" now={project.passedTests / project.totalTests * 100} key={1} />
                    <ProgressBar variant="danger" now={project.failedTests / project.totalTests * 100} key={2} />
                    <ProgressBar variant="secondary" now={(project.totalTests - project.completedTests) / project.totalTests * 100} key={3} />
                  </ProgressBar>
                  <div className="d-flex justify-content-between my-2">
                    <div>Total Test Scenarios:</div>
                    <div><strong>{project.totalTests}</strong></div>
                  </div>
                  <div className="d-flex justify-content-between my-2">
                    <div>Completed:</div>
                    <div><strong>{project.completedTests}</strong></div>
                  </div>
                  <div className="d-flex justify-content-between my-2">
                    <div>Passed:</div>
                    <div><strong className="text-success">{project.passedTests}</strong></div>
                  </div>
                  <div className="d-flex justify-content-between my-2">
                    <div>Failed:</div>
                    <div><strong className="text-danger">{project.failedTests}</strong></div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Your Projects</Card.Title>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Project Name</th>
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
                      <td>
                        <Badge bg={
                          project.status === 'Completed' ? 'success' : 
                          project.status === 'In Progress' ? 'primary' : 
                          'secondary'
                        }>
                          {project.status}
                        </Badge>
                      </td>
                      <td>
                        <ProgressBar now={project.progress} label={`${project.progress}%`} />
                      </td>
                      <td>{project.dueDate}</td>
                      <td>
                        <Link to={`/test-execution/${project.id}`}>
                          <Button variant="primary" size="sm">Continue Testing</Button>
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

export default CustomerDashboard;
