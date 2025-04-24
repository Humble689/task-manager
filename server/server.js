const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect('mongodb://localhost:27017/task-manager')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Join user's room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Handle task updates
  socket.on('taskUpdate', (data) => {
    // Broadcast to all clients in the user's room
    io.to(data.userId).emit('taskUpdated', data.task);
  });

  // Handle task creation
  socket.on('taskCreate', (data) => {
    io.to(data.userId).emit('taskCreated', data.task);
  });

  // Handle task deletion
  socket.on('taskDelete', (data) => {
    io.to(data.userId).emit('taskDeleted', data.taskId);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/users', require('./routes/users'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 