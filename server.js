const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;  // ✅ FIXED: Use environment variable
const saltRounds = 10;
const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE || "ADMIN123";

// Google Client ID
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "853516383345-4p5d3upi7u7lakahao0htv2bpe762fgl.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- Middleware ---
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "https://vastradaan.onrender.com"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Health Check Route ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- Default Route to Serve Login Page ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'), (err) => {
        if (err) {
            console.error('Error serving login.html:', err);
            // Fallback response
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>VastraDaan - Server Running</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; background: #f0f8ff; }
                        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        h1 { color: #2c5530; text-align: center; }
                        .btn { display: inline-block; padding: 10px 20px; background: #2c5530; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🚀 VastraDaan Server is Running!</h1>
                        <p>Express server is deployed on Render.com.</p>
                        <p><strong>Note:</strong> The login.html file is not found in public folder.</p>
                        <p><a href="/api/health" class="btn">Test API Health</a></p>
                        <p><strong>Port:</strong> ${PORT}</p>
                    </div>
                </body>
                </html>
            `);
        }
    });
});

// --- Database Setup ---
const db = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                name TEXT NOT NULL,
                phone TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                address TEXT NOT NULL
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS donations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone TEXT NOT NULL,
                items TEXT NOT NULL,
                condition TEXT NOT NULL,
                pickup_date TEXT, 
                pickup_slot TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (phone) REFERENCES users(phone)
            )`);
        });
    }
});

// --- API Endpoints ---

// Google Authentication
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { name, email, sub } = payload;

        const sqlFind = `SELECT * FROM users WHERE phone = ?`;
        db.get(sqlFind, [email], (err, user) => {
            if (user) {
                res.json({ success: true, message: 'Login successful.', user: { name: user.name, phone: user.phone, address: user.address } });
            } else {
                const sqlInsert = `INSERT INTO users (name, phone, password, address) VALUES (?, ?, ?, ?)`;
                db.run(sqlInsert, [name, email, sub, 'Google User'], function(err) {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Registration failed.' });
                    }
                    res.json({ success: true, message: 'Registration and login successful.', user: { name: name, phone: email, address: 'Google User' } });
                });
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ success: false, message: 'Invalid Google token.' });
    }
});

// User Registration
app.post('/api/register', async (req, res) => {
    const { name, phone, password, address } = req.body;
    if (!name || !phone || !password || !address) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = `INSERT INTO users (name, phone, password, address) VALUES (?, ?, ?, ?)`;
        db.run(sql, [name, phone, hashedPassword, address], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Phone number already registered.' });
            }
            res.status(201).json({ success: true, message: 'User registered successfully.' });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

// User Login
app.post('/api/login', (req, res) => {
    const { phone, password } = req.body;
    const sql = `SELECT * FROM users WHERE phone = ?`;
    db.get(sql, [phone], async (err, user) => {
        if (err) { 
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' }); 
        }
        if (!user) { 
            return res.status(404).json({ success: false, message: 'User not found.' }); 
        }

        try {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                res.json({ success: true, message: 'Login successful.', user: { name: user.name, phone: user.phone, address: user.address } });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials.' });
            }
        } catch (error) {
            console.error('Password comparison error:', error);
            res.status(500).json({ success: false, message: 'Server error during login.' });
        }
    });
});

// Schedule Donation
app.post('/api/donations', (req, res) => {
    const { phone, items, condition, pickup_date, pickup_slot } = req.body;
    
    if (!phone || !items || !condition) {
        return res.status(400).json({ success: false, message: 'Phone, items, and condition are required.' });
    }

    const sql = `INSERT INTO donations (phone, items, condition, pickup_date, pickup_slot) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [phone, items, condition, pickup_date, pickup_slot], function(err) {
        if (err) {
            console.error('Donation error:', err);
            return res.status(500).json({ success: false, message: 'Failed to schedule donation.' });
        }
        res.status(201).json({ 
            success: true, 
            message: 'Donation scheduled successfully!',
            donationId: this.lastID
        });
    });
});

// Get user donations
app.get('/api/donations/:phone', (req, res) => {
    const { phone } = req.params;
    const sql = `SELECT * FROM donations WHERE phone = ? ORDER BY timestamp DESC`;
    
    db.all(sql, [phone], (err, donations) => {
        if (err) {
            console.error('Error fetching donations:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch donations.' });
        }
        res.json({ success: true, donations });
    });
});

// Get mocked tracking info for a donation
app.get('/api/tracking/:donationId', (req, res) => {
    const { donationId } = req.params;
    const statuses = ['Scheduled', 'Pickup Assigned', 'In Transit', 'Processing', 'Completed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    res.json({ 
        success: true, 
        donationId, 
        status: randomStatus, 
        updatedAt: new Date().toISOString()
    });
});

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'API endpoint not found' 
    });
});

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'), (err) => {
        if (err) {
            res.status(404).send(`
                <html>
                    <body>
                        <h1>VastraDaan - Page Not Found</h1>
                        <p>The requested page was not found on this server.</p>
                        <p><a href="/">Go to Home Page</a></p>
                        <p><strong>Server Port:</strong> ${PORT}</p>
                    </body>
                </html>
            `);
        }
    });
});

// --- Start Server ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📁 Current directory: ${__dirname}`);
    console.log(`🌐 Access your app`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚙️  Process ID: ${process.pid}`);
});
