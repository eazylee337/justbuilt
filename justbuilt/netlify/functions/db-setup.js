// Netlify Function for database setup and initialization
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Create database schema if it doesn't exist
const createSchema = async (client) => {
  // Create users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create profiles table
  await client.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create projects table
  await client.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create project_files table
  await client.query(`
    CREATE TABLE IF NOT EXISTS project_files (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      content TEXT,
      path TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create ai_personas table
  await client.query(`
    CREATE TABLE IF NOT EXISTS ai_personas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      traits JSONB,
      expertise JSONB,
      coding_style JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create knowledge_nodes table
  await client.query(`
    CREATE TABLE IF NOT EXISTS knowledge_nodes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create knowledge_relations table
  await client.query(`
    CREATE TABLE IF NOT EXISTS knowledge_relations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
      target_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      strength INTEGER,
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create timeline_branches table
  await client.query(`
    CREATE TABLE IF NOT EXISTS timeline_branches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT false,
      parent_id UUID REFERENCES timeline_branches(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create timeline_nodes table
  await client.query(`
    CREATE TABLE IF NOT EXISTS timeline_nodes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      branch_id UUID NOT NULL REFERENCES timeline_branches(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      parent_id UUID REFERENCES timeline_nodes(id),
      step_number INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create sketches table
  await client.query(`
    CREATE TABLE IF NOT EXISTS sketches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      background TEXT DEFAULT '#ffffff',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create sketch_elements table
  await client.query(`
    CREATE TABLE IF NOT EXISTS sketch_elements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sketch_id UUID NOT NULL REFERENCES sketches(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      x FLOAT NOT NULL,
      y FLOAT NOT NULL,
      width FLOAT NOT NULL,
      height FLOAT NOT NULL,
      properties JSONB,
      parent_id UUID REFERENCES sketch_elements(id),
      z_index INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database schema created successfully');
};

// Create indexes for better performance
const createIndexes = async (client) => {
  // Users table indexes
  await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');

  // Projects table indexes
  await client.query('CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)');

  // Project files indexes
  await client.query('CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_project_files_path ON project_files(path)');

  // AI personas indexes
  await client.query('CREATE INDEX IF NOT EXISTS idx_ai_personas_user_id ON ai_personas(user_id)');

  // Knowledge graph indexes
  await client.query('CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_type ON knowledge_nodes(type)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_knowledge_relations_source_id ON knowledge_relations(source_id)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_knowledge_relations_target_id ON knowledge_relations(target_id)');

  // Timeline indexes
  await client.query('CREATE INDEX IF NOT EXISTS idx_timeline_branches_project_id ON timeline_branches(project_id)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_timeline_nodes_branch_id ON timeline_nodes(branch_id)');

  // Sketch indexes
  await client.query('CREATE INDEX IF NOT EXISTS idx_sketches_project_id ON sketches(project_id)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_sketch_elements_sketch_id ON sketch_elements(sketch_id)');

  console.log('Database indexes created successfully');
};

// Seed initial data for development
const seedInitialData = async (client) => {
  // Check if we already have users
  const { rows } = await client.query('SELECT COUNT(*) FROM users');
  if (parseInt(rows[0].count) > 0) {
    console.log('Database already has data, skipping seed');
    return;
  }

  // Create a demo user
  const userId = uuidv4();
  await client.query(
    'INSERT INTO users (id, email) VALUES ($1, $2)',
    [userId, 'demo@justbuilt.dev']
  );

  // Create user profile
  await client.query(
    'INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)',
    [userId, 'Demo User']
  );

  // Create a sample project
  const projectId = uuidv4();
  await client.query(
    'INSERT INTO projects (id, user_id, name, description) VALUES ($1, $2, $3, $4)',
    [projectId, userId, 'Sample Project', 'A demo project created automatically']
  );

  // Create a sample file
  await client.query(
    'INSERT INTO project_files (project_id, name, content, path) VALUES ($1, $2, $3, $4)',
    [
      projectId,
      'index.js',
      'console.log("Hello from Just Built IDE!");',
      '/index.js'
    ]
  );

  // Create a sample AI persona
  await client.query(
    'INSERT INTO ai_personas (user_id, name, description, traits, expertise, coding_style) VALUES ($1, $2, $3, $4, $5, $6)',
    [
      userId,
      'Frontend Expert',
      'Specialized in modern frontend development',
      JSON.stringify([{ name: 'Detail-Oriented', strength: 8 }]),
      JSON.stringify([{ name: 'React', level: 9 }]),
      JSON.stringify({ name: 'Clean and Readable', preference: 'explicit' })
    ]
  );

  // Create sample knowledge nodes
  const reactNodeId = uuidv4();
  const javascriptNodeId = uuidv4();

  await client.query(
    'INSERT INTO knowledge_nodes (id, type, name, description) VALUES ($1, $2, $3, $4)',
    [reactNodeId, 'framework', 'React', 'A JavaScript library for building user interfaces']
  );

  await client.query(
    'INSERT INTO knowledge_nodes (id, type, name, description) VALUES ($1, $2, $3, $4)',
    [javascriptNodeId, 'language', 'JavaScript', 'A high-level, interpreted programming language']
  );

  // Create a relation between nodes
  await client.query(
    'INSERT INTO knowledge_relations (source_id, target_id, type, strength) VALUES ($1, $2, $3, $4)',
    [reactNodeId, javascriptNodeId, 'uses', 8]
  );

  // Create a timeline branch
  const branchId = uuidv4();
  await client.query(
    'INSERT INTO timeline_branches (id, project_id, name, description, is_active) VALUES ($1, $2, $3, $4, $5)',
    [branchId, projectId, 'Main', 'Main development branch', true]
  );

  // Create a timeline node
  await client.query(
    'INSERT INTO timeline_nodes (branch_id, type, title, content, step_number) VALUES ($1, $2, $3, $4, $5)',
    [branchId, 'plan', 'Project Initialization', 'Initial project setup', 1]
  );

  // Create a sample sketch
  const sketchId = uuidv4();
  await client.query(
    'INSERT INTO sketches (id, project_id, name, width, height) VALUES ($1, $2, $3, $4, $5)',
    [sketchId, projectId, 'Homepage Design', 1200, 800]
  );

  // Create a sketch element
  await client.query(
    'INSERT INTO sketch_elements (sketch_id, type, x, y, width, height, properties) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [
      sketchId,
      'container',
      0,
      0,
      1200,
      800,
      JSON.stringify({ backgroundColor: '#f5f5f5' })
    ]
  );

  console.log('Initial data seeded successfully');
};

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check for setup token to prevent unauthorized access
  const token = event.headers.authorization;
  if (!token || token !== `Bearer ${process.env.SETUP_TOKEN}`) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  // Connect to the database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');

    // Create schema
    await createSchema(client);

    // Create indexes
    await createIndexes(client);

    // Seed initial data if requested
    const body = JSON.parse(event.body || '{}');
    if (body.seedData) {
      await seedInitialData(client);
    }

    // Commit the transaction
    await client.query('COMMIT');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Database setup completed successfully' })
    };
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    
    console.error('Database setup error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    // Release the client back to the pool
    client.release();
  }
};
