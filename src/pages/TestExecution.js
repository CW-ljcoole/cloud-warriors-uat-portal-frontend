import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Form, Button, Badge } from 'react-bootstrap';

const TestExecution = () => {
  const { projectId } = useParams();
  
  // In a real app, you would fetch this data from your backend API
  const [testScenarios, setTestScenarios] = useState([
    {
      id: 1,
      category: 'Login',
      subcategory: 'Authentication',
      description: 'Verify user can log in with valid credentials',
      status: 'Passed',
      notes: ''
    },
    {
      id: 2,
      category: 'Zoom Phone',
      subcategory: 'Outbound Calls',
      description: 'Make an outbound call to an external number',
      status: 'Not Started',
      notes: ''
    },
    {
      id: 3,
      category: 'Zoom Phone',
      subcategory: 'Inbound Calls',
      description: 'Receive an inbound call from an external number',
      status: 'Not Started',
      notes: ''
    },
    {
      id: 4,
      category: 'Contact Center',
      subcategory: 'Queue Management',
      description: 'Verify calls are properly routed to available agents',
      status: 'Failed',
      notes: 'Call was not routed to the correct agent'
    }
  ]);

  const updateTestStatus = (id, status) => {
    setTestScenarios(
      testScenarios.map(test => 
        test.id === id ? { ...test, status } : test
      )
    );
  };

  const updateTestNotes = (id, notes) => {
    setTestScenarios(
      testScenarios.map(test => 
        test.id === id ? { ...test, notes } : test
      )
    );
  };

  return (
    <Container>
      <Row className="mt-4 mb-4">
        <Col>
          <h2>Test Execution - Project {projectId}</h2>
          <p>Execute test scenarios and record results</p>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Test Description</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {testScenarios.map(test => (
                <tr key={test.id}>
                  <td>{test.category}</td>
                  <td>{test.subcategory}</td>
                  <td>{test.description}</td>
                  <td>
                    <Badge bg={
                      test.status === 'Passed' ? 'success' : 
                      test.status === 'Failed' ? 'danger' : 
                      'secondary'
                    }>
                      {test.status}
                    </Badge>
                  </td>
                  <td>
                    <Form.Control 
                      as="textarea" 
                      rows={1} 
                      value={test.notes}
                      onChange={(e) => updateTestNotes(test.id, e.target.value)}
                      placeholder="Add notes here..."
                    />
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => updateTestStatus(test.id, 'Passed')}
                      >
                        Pass
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => updateTestStatus(test.id, 'Failed')}
                      >
                        Fail
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TestExecution;
