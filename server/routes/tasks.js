const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Get all tasks for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Create a new task
router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      user: req.user.userId
    });
    await task.save();

    // Emit task creation event
    const io = req.app.get('io');
    io.to(req.user.userId).emit('taskCreated', task);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task' });
  }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Emit task update event
    const io = req.app.get('io');
    io.to(req.user.userId).emit('taskUpdated', task);
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Emit task deletion event
    const io = req.app.get('io');
    io.to(req.user.userId).emit('taskDeleted', req.params.id);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

module.exports = router; 