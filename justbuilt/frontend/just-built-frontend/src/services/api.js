// frontend/just-built-frontend/src/services/api.js
const API_PREFIX = '/.netlify/functions';

export const generatePlan = async (userInput, selectedModel) => {
  const response = await fetch(`${API_PREFIX}/generate-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: userInput, model: selectedModel }),
  });
  if (!response.ok) {
    throw new Error('Failed to generate plan');
  }
  return response.json();
};

export const executeStep = async (stepId, planId) => {
  const response = await fetch(`${API_PREFIX}/execute-step`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ step_id: stepId, plan_id: planId }),
  });
  if (!response.ok) {
    throw new Error('Failed to execute step');
  }
  return response.json();
};

// Add other API functions here (e.g., listFiles, saveFile, etc.)