require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const pdfRoutes = require('./routes/pdf');
const chatRoutes = require('./routes/chat');
const chatsRoutes = require('./routes/chats');

const app = express();
const BASE_PORT = parseInt(process.env.PORT, 10) || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chats', chatsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

function startServer(port, maxAttempts = 10) {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`PORT=${port}`); // Machine-parseable for client discovery
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && maxAttempts > 0) {
      console.log(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1, maxAttempts - 1);
    } else {
      console.error('Failed to start server:', err.message);
      process.exit(1);
    }
  });
}

connectDB().then(() => {
  startServer(BASE_PORT);
});
