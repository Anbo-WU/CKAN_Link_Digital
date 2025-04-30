const express = require('express');
const cors = require('cors');
const requestIp = require('request-ip');
require('dotenv').config(); // Load .env variables

const experimentRoutes = require('./routes/experimentRoutes');
const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' })); // Configure CORS appropriately for your frontend URL
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(requestIp.mw()); // Must come before routes that need the IP

// Routes
app.use('/api', experimentRoutes); // Prefix API routes

// Basic root route
app.get('/', (req, res) => {
    res.send('OOI Prototype Server Running');
});

// Error Handling Middleware (basic example)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


module.exports = app;