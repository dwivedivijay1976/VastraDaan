const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Enhanced health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'VastraDaan Server is Running!',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Test all basic routes
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working correctly',
    data: {
      server: 'Express.js',
      status: 'Active',
      time: new Date().toISOString()
    }
  });
});

// Default route with better fallback
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>VastraDaan - Cloth Donation</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: Arial, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                min-height: 100vh; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                padding: 20px;
            }
            .container { 
                background: white; 
                padding: 40px; 
                border-radius: 15px; 
                box-shadow: 0 15px 35px rgba(0,0,0,0.1); 
                width: 100%; 
                max-width: 500px; 
                text-align: center;
            }
            h1 { color: #2c5530; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 20px; }
            .btn { 
                display: inline-block; 
                padding: 12px 24px; 
                background: #2c5530; 
                color: white; 
                text-decoration: none; 
                border-radius: 8px; 
                margin: 10px;
                border: none;
                cursor: pointer;
                font-size: 16px;
            }
            .btn:hover { background: #1e3a23; }
            .status { 
                background: #d4edda; 
                color: #155724; 
                padding: 15px; 
                border-radius: 8px; 
                margin-bottom: 20px; 
                border-left: 4px solid #28a745;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="status">
                <strong>✅ SERVER STATUS: RUNNING</strong>
            </div>
            <h1>🧵 VastraDaan</h1>
            <p>Cloth Donation Platform</p>
            <p>Your Express server is successfully deployed on Render.com!</p>
            
            <div style="margin: 30px 0;">
                <button class="btn" onclick="testAPI()">Test API Health</button>
                <a href="/api/health" class="btn" target="_blank">API Health</a>
                <a href="/api/test" class="btn" target="_blank">Test Endpoint</a>
            </div>
            
            <div id="apiResult" style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; display: none;"></div>
        </div>

        <script>
            async function testAPI() {
                try {
                    const response = await fetch('/api/health');
                    const data = await response.json();
                    document.getElementById('apiResult').innerHTML = `
                        <strong>✅ API Response:</strong><br>
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    `;
                    document.getElementById('apiResult').style.display = 'block';
                } catch (error) {
                    document.getElementById('apiResult').innerHTML = `
                        <strong>❌ API Error:</strong><br>
                        ${error.message}
                    `;
                    document.getElementById('apiResult').style.display = 'block';
                }
            }
            
            // Test API on page load
            testAPI();
        </script>
    </body>
    </html>
  `);
});

// Catch-all route
app.get('*', (req, res) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Page Not Found - VastraDaan</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
            .container { max-width: 500px; margin: 0 auto; text-align: center; }
            h1 { color: #dc3545; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>404 - Page Not Found</h1>
            <p>The requested URL was not found on this server.</p>
            <p><a href="/">← Go to Home Page</a></p>
        </div>
    </body>
    </html>
  `);
});

// Start server with error handling
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 =================================');
  console.log('✅ VastraDaan Server Started Successfully!');
  console.log(`✅ Port: ${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Process ID: ${process.pid}`);
  console.log(`✅ Node.js Version: ${process.version}`);
  console.log('🚀 =================================');
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
