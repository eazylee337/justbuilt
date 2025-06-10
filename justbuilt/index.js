
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'frontend/just-built-frontend/build')));

// API routes - proxy to your Flask backend running on port 5001
app.use('/api', (req, res) => {
  // In a real setup, you'd proxy to http://localhost:5001
  res.status(503).json({ 
    error: 'Backend service not available. Flask backend should be running on port 5001.' 
  });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/just-built-frontend/build', 'index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log('Note: Flask backend needs to be started separately on port 5000 for full functionality');
});
