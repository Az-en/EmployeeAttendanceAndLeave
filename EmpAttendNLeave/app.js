// app.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(express.json());

// Serve static HTML files from 'public' folder
app.use(express.static('public'));

// Routes
app.use('/api/employees', require('./routes/employeeRoute'));
app.use('/api/attendance', require('./routes/attendanceRoute'));
app.use('/api/leaves', require('./routes/leaveRoute'));

module.exports = app;
