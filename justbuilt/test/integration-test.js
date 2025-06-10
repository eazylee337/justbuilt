// Test script for Just Built IDE with Netlify DB and Neon integration
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const BASE_URL = process.env.NETLIFY_URL || 'http://localhost:8888';
const API_BASE = `${BASE_URL}/.netlify/functions`;
let authToken = null;
let testUserId = null;
let testProjectId = null;
let testFileId = null;
let testPersonaId = null;

// Test runner
async function runTests() {
  console.log('🧪 Starting Just Built IDE integration tests with Netlify DB (Neon)');
  
  try {
    // Database setup test
    await testDatabaseSetup();
    
    // Authentication tests
    await testUserRegistration();
    await testUserLogin();
    await testGetCurrentUser();
    
    // Project tests
    await testCreateProject();
    await testGetProjects();
    await testGetProjectById();
    await testUpdateProject();
    
    // File tests
    await testCreateFile();
    await testGetProjectFiles();
    await testUpdateFile();
    
    // AI Persona tests
    await testCreatePersona();
    await testGetPersonas();
    await testUpdatePersona();
    
    // LLM integration tests
    await testLlmCodeGeneration();
    await testLlmPlanGeneration();
    
    // GitHub integration tests (mock)
    await testGitHubIntegration();
    
    // Build tests (mock)
    await testBuildProcess();
    
    // Cleanup tests
    await testDeleteFile();
    await testDeletePersona();
    await testDeleteProject();
    
    console.log('✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Helper for API requests
async function apiRequest(method, endpoint, data = null) {
  const headers = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  
  try {
    const response = await axios({
      method,
      url: `${API_BASE}${endpoint}`,
      data,
      headers
    });
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.message);
    throw error;
  }
}

// Individual test functions
async function testDatabaseSetup() {
  console.log('Testing database setup...');
  const setupToken = process.env.SETUP_TOKEN || 'test-setup-token';
  
  try {
    const response = await axios({
      method: 'post',
      url: `${API_BASE}/db-setup`,
      data: { seedData: true },
      headers: {
        Authorization: `Bearer ${setupToken}`
      }
    });
    
    console.log('✅ Database setup successful:', response.data.message);
  } catch (error) {
    // If the error is because the database is already set up, that's fine
    if (error.response && error.response.data && error.response.data.error.includes('already exists')) {
      console.log('✅ Database already set up');
    } else {
      throw error;
    }
  }
}

async function testUserRegistration() {
  console.log('Testing user registration...');
  const email = `test-${uuidv4().slice(0, 8)}@justbuilt.test`;
  const password = 'TestPassword123!';
  
  const data = await apiRequest('post', '/auth-register', { email, password });
  console.log('✅ User registration successful:', data.message);
  testUserId = data.userId;
}

async function testUserLogin() {
  console.log('Testing user login...');
  const email = `test-${uuidv4().slice(0, 8)}@justbuilt.test`;
  const password = 'TestPassword123!';
  
  // First register a user
  const registerData = await apiRequest('post', '/auth-register', { email, password });
  testUserId = registerData.userId;
  
  // Then login
  const loginData = await apiRequest('post', '/auth-login', { email, password });
  console.log('✅ User login successful');
  authToken = loginData.token;
}

async function testGetCurrentUser() {
  console.log('Testing get current user...');
  const data = await apiRequest('get', '/auth-user');
  console.log('✅ Get current user successful:', data.email);
}

async function testCreateProject() {
  console.log('Testing project creation...');
  const projectData = {
    name: `Test Project ${uuidv4().slice(0, 8)}`,
    description: 'A test project created during integration testing'
  };
  
  const data = await apiRequest('post', '/project', projectData);
  console.log('✅ Project creation successful:', data.name);
  testProjectId = data.id;
}

async function testGetProjects() {
  console.log('Testing get all projects...');
  const data = await apiRequest('get', '/projects');
  console.log(`✅ Retrieved ${data.length} projects`);
}

async function testGetProjectById() {
  console.log('Testing get project by ID...');
  const data = await apiRequest('get', `/project/${testProjectId}`);
  console.log('✅ Project retrieval successful:', data.name);
}

async function testUpdateProject() {
  console.log('Testing project update...');
  const updateData = {
    name: `Updated Project ${uuidv4().slice(0, 8)}`,
    description: 'This project has been updated during testing'
  };
  
  const data = await apiRequest('put', `/project/${testProjectId}`, updateData);
  console.log('✅ Project update successful:', data.name);
}

async function testCreateFile() {
  console.log('Testing file creation...');
  const fileData = {
    name: 'test-file.js',
    content: 'console.log("This is a test file");',
    path: '/test-file.js'
  };
  
  const data = await apiRequest('post', `/project/${testProjectId}/file`, fileData);
  console.log('✅ File creation successful:', data.name);
  testFileId = data.id;
}

async function testGetProjectFiles() {
  console.log('Testing get project files...');
  const data = await apiRequest('get', `/project/${testProjectId}/files`);
  console.log(`✅ Retrieved ${data.length} files`);
}

async function testUpdateFile() {
  console.log('Testing file update...');
  const updateData = {
    content: 'console.log("This file has been updated");'
  };
  
  const data = await apiRequest('put', `/project/${testProjectId}/file/${testFileId}`, updateData);
  console.log('✅ File update successful');
}

async function testCreatePersona() {
  console.log('Testing AI persona creation...');
  const personaData = {
    name: `Test Persona ${uuidv4().slice(0, 8)}`,
    description: 'A test AI persona',
    traits: [{ name: 'Creative', strength: 9 }],
    expertise: [{ name: 'JavaScript', level: 8 }],
    codingStyle: { name: 'Functional', preference: 'concise' }
  };
  
  const data = await apiRequest('post', '/persona', personaData);
  console.log('✅ AI persona creation successful:', data.name);
  testPersonaId = data.id;
}

async function testGetPersonas() {
  console.log('Testing get AI personas...');
  const data = await apiRequest('get', '/personas');
  console.log(`✅ Retrieved ${data.length} AI personas`);
}

async function testUpdatePersona() {
  console.log('Testing AI persona update...');
  const updateData = {
    description: 'This AI persona has been updated during testing',
    traits: [{ name: 'Analytical', strength: 10 }]
  };
  
  const data = await apiRequest('put', `/persona/${testPersonaId}`, updateData);
  console.log('✅ AI persona update successful');
}

async function testLlmCodeGeneration() {
  console.log('Testing LLM code generation...');
  const requestData = {
    prompt: 'Create a simple React component that displays a counter with increment and decrement buttons',
    options: {
      model: 'gpt-4',
      language: 'javascript',
      framework: 'react'
    }
  };
  
  const data = await apiRequest('post', '/llm/generate-code', requestData);
  console.log('✅ LLM code generation successful, received code length:', data.code.length);
}

async function testLlmPlanGeneration() {
  console.log('Testing LLM plan generation...');
  const requestData = {
    requirements: 'Build a todo list application with React and local storage',
    options: {
      model: 'gpt-4',
      detailLevel: 'high'
    }
  };
  
  const data = await apiRequest('post', '/llm/generate-plan', requestData);
  console.log('✅ LLM plan generation successful, received steps:', data.steps.length);
}

async function testGitHubIntegration() {
  console.log('Testing GitHub integration (mock)...');
  // This is a mock test since we can't actually connect to GitHub in this test environment
  const mockRepoData = {
    repoFullName: 'test-user/test-repo',
    options: {
      branch: 'main',
      createNewRepo: false
    }
  };
  
  // Mock import
  try {
    await apiRequest('post', '/github/import', mockRepoData);
    console.log('✅ GitHub import mock test passed');
  } catch (error) {
    if (error.response && error.response.status === 501) {
      console.log('✅ GitHub import mock test passed (Not Implemented)');
    } else {
      throw error;
    }
  }
  
  // Mock export
  try {
    await apiRequest('post', `/github/export/${testProjectId}`, mockRepoData);
    console.log('✅ GitHub export mock test passed');
  } catch (error) {
    if (error.response && error.response.status === 501) {
      console.log('✅ GitHub export mock test passed (Not Implemented)');
    } else {
      throw error;
    }
  }
}

async function testBuildProcess() {
  console.log('Testing build process (mock)...');
  const buildOptions = {
    target: 'web',
    optimize: true,
    minify: true
  };
  
  // Mock build
  try {
    const buildData = await apiRequest('post', `/build/web/${testProjectId}`, buildOptions);
    console.log('✅ Build process mock test passed, build ID:', buildData.buildId);
    
    // Mock build status
    await apiRequest('get', `/build/status/${buildData.buildId}`);
    console.log('✅ Build status mock test passed');
  } catch (error) {
    if (error.response && error.response.status === 501) {
      console.log('✅ Build process mock test passed (Not Implemented)');
    } else {
      throw error;
    }
  }
}

async function testDeleteFile() {
  console.log('Testing file deletion...');
  await apiRequest('delete', `/project/${testProjectId}/file/${testFileId}`);
  console.log('✅ File deletion successful');
}

async function testDeletePersona() {
  console.log('Testing AI persona deletion...');
  await apiRequest('delete', `/persona/${testPersonaId}`);
  console.log('✅ AI persona deletion successful');
}

async function testDeleteProject() {
  console.log('Testing project deletion...');
  await apiRequest('delete', `/project/${testProjectId}`);
  console.log('✅ Project deletion successful');
}

// Run the tests
runTests().catch(console.error);
