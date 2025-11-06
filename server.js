const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = 3000;
const saltRounds = 10;
const ADMIN_SECRET_CODE = "ADMIN123";

// IMPORTANT: Replace this with your actual Google Client ID
const GOOGLE_CLIENT_ID = "853516383345-4p5d3upi7u7lakahao0htv2bpe762fgl.apps.googleusercontent.com";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// --- Middleware ---
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Default Route to Serve Login Page ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
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
                db.run(sqlInsert, [name, email, sub, 'Google User'], function() {
                    res.json({ success: true, message: 'Registration and login successful.', user: { name: name, phone: email, address: 'Google User' } });
                });
            }
        });
    } catch (error) {
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
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

// User Login
app.post('/api/login', (req, res) => {
    const { phone, password } = req.body;
    const sql = `SELECT * FROM users WHERE phone = ?`;
    db.get(sql, [phone], async (err, user) => {
        if (err) { return res.status(500).json({ success: false, message: 'Database error.' }); }
        if (!user) { return res.status(404).json({ success: false, message: 'User not found.' }); }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.json({ success: true, message: 'Login successful.', user: { name: user.name, phone: user.phone, address: user.address } });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    });
});

// In your server.js file...

// This is an example. Adapt it to your existing code.
app.post('/api/donations', async (req, res) => {
    const { phone, items, condition, quantity, pickupDate, pickupSlot, earnings } = req.body;

    // --- THIS IS THE NEW LOGIC YOU MUST ADD ---
    try {
        // 1. Find the user in your database using their phone number
        const user = await db.collection('users').findOne({ phone: phone });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 2. Calculate the new total earnings
        const currentEarnings = user.earnings || 0;
        const newTotalEarnings = currentEarnings + earnings;

        // 3. Update the user's record in the database with the new total
        await db.collection('users').updateOne(
            { phone: phone },
            { $set: { earnings: newTotalEarnings } }
        );

        // 4. Save the new donation to the donations collection (your existing logic)
        const newDonation = {
            // ... your donation fields ...
            status: 'Pending'
        };
        const donationResult = await db.collection('donations').insertOne(newDonation);

        // 5. Send a success response WITH the new total earnings
        res.status(201).json({ 
            success: true, 
            message: 'Donation scheduled and earnings updated!',
            donationId: donationResult.insertedId,
            newTotalEarnings: newTotalEarnings // <-- This is crucial
        });

    } catch (error) {
        console.error('Error processing donation:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get mocked tracking info for a donation
app.get('/api/tracking/:donationId', (req, res) => {
    const { donationId } = req.params;
    // This is just a placeholder and would need real logic in a full application
    res.json({ success: true, donationId, status: 'Pickup Scheduled', updatedAt: new Date() });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});