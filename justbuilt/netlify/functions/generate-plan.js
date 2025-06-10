// netlify/functions/generate-plan.js
exports.handler = async function(event, context) {
  // Mock plan data from your Python backend
  const mockPlan = [
    { id: 1, title: 'Setup project structure', description: 'Create basic folder structure and initialize project files', estimated_time: '5 minutes' },
    { id: 2, title: 'Create HTML layout', description: 'Implement the basic HTML structure for the application', estimated_time: '10 minutes' },
    { id: 3, title: 'Add CSS styling', description: 'Style the application with CSS to match design requirements', estimated_time: '15 minutes' },
    { id: 4, title: 'Implement core functionality', description: 'Add JavaScript code for the main application features', estimated_time: '30 minutes' },
    { id: 5, title: 'Test and debug', description: 'Test the application and fix any issues', estimated_time: '20 minutes' }
  ];

  const body = JSON.parse(event.body);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan: mockPlan,
      model_used: body.model || 'gemini',
      input: body.input || ''
    }),
  };
};