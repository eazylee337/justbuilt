
#!/usr/bin/env python3
import subprocess
import sys
import os
import time
import threading

def start_flask_backend():
    """Start the Flask backend server"""
    print("Starting Flask backend on port 5001...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    backend_path = os.path.join(script_dir, 'backend', 'src')
    os.chdir(backend_path)
    # Set environment variable for Flask to use port 5001
    env = os.environ.copy()
    env['FLASK_RUN_PORT'] = '5001'
    subprocess.run([sys.executable, 'main.py'], env=env)

def start_node_frontend():
    """Start the Node.js frontend server"""
    print("Starting Node.js frontend...")
    time.sleep(3)  # Give Flask a moment to start
    # Find the directory containing index.js (should be the directory where start.py is located)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    subprocess.run(['node', 'index.js'])

if __name__ == '__main__':
    # Start Flask backend in a separate thread
    flask_thread = threading.Thread(target=start_flask_backend)
    flask_thread.daemon = True
    flask_thread.start()
    
    # Start Node.js frontend
    start_node_frontend()
