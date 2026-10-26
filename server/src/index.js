
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const pdfRoutes = require('./routes/pdf');
const chatRoutes = require('./routes/chat');
const chatsRoutes = require('./routes/chats');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chats', chatsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error',
  });
});

// Connect to MongoDB, then export the Express app for Vercel.
connectDB().catch((error) => {
  console.error('Database connection failed:', error.message);
});

module.exports = app;
