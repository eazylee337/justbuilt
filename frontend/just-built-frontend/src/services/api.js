// API client for Just Built IDE frontend
// This service handles all communication with Netlify Functions and Netlify DB

import axios from 'axios';

// Base API client with error handling and authentication
const apiClient = axios.create({
  baseURL: '/.netlify/functions',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authentication token to requests if available
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle common error responses
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User and authentication API
export const authApi = {
  // Register a new user
  async register(email, password) {
    const response = await apiClient.post('/auth-register', { email, password });
    return response.data;
  },

  // Login user
  async login(email, password) {
    const response = await apiClient.post('/auth-login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  // Logout user
  logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  },

  // Get current user profile
  async getCurrentUser() {
    const response = await apiClient.get('/auth-user');
    return response.data;
  },

  // Update user profile
  async updateProfile(profileData) {
    const response = await apiClient.put('/auth-profile', profileData);
    return response.data;
  }
};

// Projects API
export const projectsApi = {
  // Get all projects for current user
  async getProjects() {
    const response = await apiClient.get('/projects');
    return response.data;
  },

  // Get a specific project by ID
  async getProject(projectId) {
    const response = await apiClient.get(`/project/${projectId}`);
    return response.data;
  },

  // Create a new project
  async createProject(projectData) {
    const response = await apiClient.post('/project', projectData);
    return response.data;
  },

  // Update an existing project
  async updateProject(projectId, projectData) {
    const response = await apiClient.put(`/project/${projectId}`, projectData);
    return response.data;
  },

  // Delete a project
  async deleteProject(projectId) {
    const response = await apiClient.delete(`/project/${projectId}`);
    return response.data;
  }
};

// Project files API
export const filesApi = {
  // Get all files for a project
  async getProjectFiles(projectId) {
    const response = await apiClient.get(`/project/${projectId}/files`);
    return response.data;
  },

  // Get a specific file
  async getFile(projectId, fileId) {
    const response = await apiClient.get(`/project/${projectId}/file/${fileId}`);
    return response.data;
  },

  // Create a new file
  async createFile(projectId, fileData) {
    const response = await apiClient.post(`/project/${projectId}/file`, fileData);
    return response.data;
  },

  // Update file content
  async updateFile(projectId, fileId, fileData) {
    const response = await apiClient.put(`/project/${projectId}/file/${fileId}`, fileData);
    return response.data;
  },

  // Delete a file
  async deleteFile(projectId, fileId) {
    const response = await apiClient.delete(`/project/${projectId}/file/${fileId}`);
    return response.data;
  }
};

// AI Personas API
export const personasApi = {
  // Get all AI personas for current user
  async getPersonas() {
    const response = await apiClient.get('/personas');
    return response.data;
  },

  // Get a specific persona
  async getPersona(personaId) {
    const response = await apiClient.get(`/persona/${personaId}`);
    return response.data;
  },

  // Create a new persona
  async createPersona(personaData) {
    const response = await apiClient.post('/persona', personaData);
    return response.data;
  },

  // Update a persona
  async updatePersona(personaId, personaData) {
    const response = await apiClient.put(`/persona/${personaId}`, personaData);
    return response.data;
  },

  // Delete a persona
  async deletePersona(personaId) {
    const response = await apiClient.delete(`/persona/${personaId}`);
    return response.data;
  }
};

// Knowledge Graph API
export const knowledgeApi = {
  // Get all knowledge nodes
  async getNodes(filters = {}) {
    const response = await apiClient.get('/knowledge/nodes', { params: filters });
    return response.data;
  },

  // Get a specific node
  async getNode(nodeId) {
    const response = await apiClient.get(`/knowledge/node/${nodeId}`);
    return response.data;
  },

  // Create a new node
  async createNode(nodeData) {
    const response = await apiClient.post('/knowledge/node', nodeData);
    return response.data;
  },

  // Update a node
  async updateNode(nodeId, nodeData) {
    const response = await apiClient.put(`/knowledge/node/${nodeId}`, nodeData);
    return response.data;
  },

  // Delete a node
  async deleteNode(nodeId) {
    const response = await apiClient.delete(`/knowledge/node/${nodeId}`);
    return response.data;
  },

  // Get relations between nodes
  async getRelations(filters = {}) {
    const response = await apiClient.get('/knowledge/relations', { params: filters });
    return response.data;
  },

  // Create a relation between nodes
  async createRelation(relationData) {
    const response = await apiClient.post('/knowledge/relation', relationData);
    return response.data;
  },

  // Delete a relation
  async deleteRelation(relationId) {
    const response = await apiClient.delete(`/knowledge/relation/${relationId}`);
    return response.data;
  }
};

// Timeline API
export const timelineApi = {
  // Get all branches for a project
  async getBranches(projectId) {
    const response = await apiClient.get(`/project/${projectId}/timeline/branches`);
    return response.data;
  },

  // Create a new branch
  async createBranch(projectId, branchData) {
    const response = await apiClient.post(`/project/${projectId}/timeline/branch`, branchData);
    return response.data;
  },

  // Get nodes for a branch
  async getNodes(branchId) {
    const response = await apiClient.get(`/timeline/branch/${branchId}/nodes`);
    return response.data;
  },

  // Create a node in a branch
  async createNode(branchId, nodeData) {
    const response = await apiClient.post(`/timeline/branch/${branchId}/node`, nodeData);
    return response.data;
  },

  // Update a node
  async updateNode(nodeId, nodeData) {
    const response = await apiClient.put(`/timeline/node/${nodeId}`, nodeData);
    return response.data;
  }
};

// Visual-to-Code API
export const visualToCodeApi = {
  // Get all sketches for a project
  async getSketches(projectId) {
    const response = await apiClient.get(`/project/${projectId}/sketches`);
    return response.data;
  },

  // Get a specific sketch
  async getSketch(sketchId) {
    const response = await apiClient.get(`/sketch/${sketchId}`);
    return response.data;
  },

  // Create a new sketch
  async createSketch(projectId, sketchData) {
    const response = await apiClient.post(`/project/${projectId}/sketch`, sketchData);
    return response.data;
  },

  // Update a sketch
  async updateSketch(sketchId, sketchData) {
    const response = await apiClient.put(`/sketch/${sketchId}`, sketchData);
    return response.data;
  },

  // Delete a sketch
  async deleteSketch(sketchId) {
    const response = await apiClient.delete(`/sketch/${sketchId}`);
    return response.data;
  },

  // Get elements for a sketch
  async getElements(sketchId) {
    const response = await apiClient.get(`/sketch/${sketchId}/elements`);
    return response.data;
  },

  // Create an element in a sketch
  async createElement(sketchId, elementData) {
    const response = await apiClient.post(`/sketch/${sketchId}/element`, elementData);
    return response.data;
  },

  // Update an element
  async updateElement(elementId, elementData) {
    const response = await apiClient.put(`/sketch/element/${elementId}`, elementData);
    return response.data;
  },

  // Delete an element
  async deleteElement(elementId) {
    const response = await apiClient.delete(`/sketch/element/${elementId}`);
    return response.data;
  },

  // Generate code from sketch
  async generateCode(sketchId, options = {}) {
    const response = await apiClient.post(`/sketch/${sketchId}/generate-code`, options);
    return response.data;
  }
};

// LLM API
export const llmApi = {
  // Generate code from prompt
  async generateCode(prompt, options = {}) {
    const response = await apiClient.post('/llm/generate-code', { prompt, ...options });
    return response.data;
  },

  // Generate plan from requirements
  async generatePlan(requirements, options = {}) {
    const response = await apiClient.post('/llm/generate-plan', { requirements, ...options });
    return response.data;
  },

  // Execute a step in the plan
  async executeStep(stepId, options = {}) {
    const response = await apiClient.post(`/llm/execute-step/${stepId}`, options);
    return response.data;
  },

  // Get available LLM models
  async getAvailableModels() {
    const response = await apiClient.get('/llm/models');
    return response.data;
  },

  // Set LLM preferences
  async setPreferences(preferences) {
    const response = await apiClient.post('/llm/preferences', preferences);
    return response.data;
  }
};

// GitHub integration API
export const githubApi = {
  // Connect GitHub account
  async connect(code) {
    const response = await apiClient.post('/github/connect', { code });
    return response.data;
  },

  // Get user repositories
  async getRepositories() {
    const response = await apiClient.get('/github/repositories');
    return response.data;
  },

  // Import project from repository
  async importRepository(repoFullName, options = {}) {
    const response = await apiClient.post('/github/import', { repoFullName, ...options });
    return response.data;
  },

  // Export project to repository
  async exportToRepository(projectId, repoDetails) {
    const response = await apiClient.post(`/github/export/${projectId}`, repoDetails);
    return response.data;
  }
};

// Build and deployment API
export const buildApi = {
  // Build project for local use
  async buildLocal(projectId, options = {}) {
    const response = await apiClient.post(`/build/local/${projectId}`, options);
    return response.data;
  },

  // Build project for web use
  async buildWeb(projectId, options = {}) {
    const response = await apiClient.post(`/build/web/${projectId}`, options);
    return response.data;
  },

  // Get build status
  async getBuildStatus(buildId) {
    const response = await apiClient.get(`/build/status/${buildId}`);
    return response.data;
  },

  // Get build logs
  async getBuildLogs(buildId) {
    const response = await apiClient.get(`/build/logs/${buildId}`);
    return response.data;
  },

  // Download build artifacts
  async downloadArtifacts(buildId) {
    const response = await apiClient.get(`/build/download/${buildId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Export all APIs
export default {
  auth: authApi,
  projects: projectsApi,
  files: filesApi,
  personas: personasApi,
  knowledge: knowledgeApi,
  timeline: timelineApi,
  visualToCode: visualToCodeApi,
  llm: llmApi,
  github: githubApi,
  build: buildApi
};
