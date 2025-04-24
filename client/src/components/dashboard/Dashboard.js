import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const Dashboard = ({ isGuest, guestUser }) => {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: ''
  });

  const { user } = useAuth();
  const socket = useSocket();
  const currentUser = isGuest ? guestUser : user;

  useEffect(() => {
    if (isGuest) {
      // For guest users, use local storage to persist tasks
      const savedTasks = localStorage.getItem('guestTasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
      setLoading(false);
    } else {
      fetchTasks();
    }

    if (socket && !isGuest) {
      // Socket events only for logged-in users
      socket.on('taskUpdated', (updatedTask) => {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task._id === updatedTask._id ? updatedTask : task
          )
        );
        showNotification('Task updated successfully', 'success');
      });

      socket.on('taskCreated', (newTask) => {
        setTasks(prevTasks => [newTask, ...prevTasks]);
        showNotification('New task created', 'success');
      });

      socket.on('taskDeleted', (taskId) => {
        setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
        showNotification('Task deleted successfully', 'success');
      });
    }

    return () => {
      if (socket && !isGuest) {
        socket.off('taskUpdated');
        socket.off('taskCreated');
        socket.off('taskDeleted');
      }
    };
  }, [socket, isGuest]);

  // Save guest tasks to local storage whenever they change
  useEffect(() => {
    if (isGuest) {
      localStorage.setItem('guestTasks', JSON.stringify(tasks));
    }
  }, [tasks, isGuest]);

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again later.');
      showNotification('Error fetching tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: ''
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGuest) {
      // Handle guest task creation/update
      if (editingTask) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === editingTask.id ? { ...task, ...formData } : task
          )
        );
      } else {
        const newTask = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString()
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
      }
      handleClose();
      showNotification(editingTask ? 'Task updated successfully' : 'Task created successfully', 'success');
    } else {
      try {
        if (editingTask) {
          await axios.put(`http://localhost:5000/api/tasks/${editingTask._id}`, formData);
        } else {
          await axios.post('http://localhost:5000/api/tasks', formData);
        }
        handleClose();
      } catch (error) {
        console.error('Error saving task:', error);
        showNotification('Error saving task', 'error');
      }
    }
  };

  const handleDelete = async (taskId) => {
    if (isGuest) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      showNotification('Task deleted successfully', 'success');
    } else {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Error deleting task', 'error');
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchTasks}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              {isGuest ? 'Guest Tasks' : 'My Tasks'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
            >
              Add Task
            </Button>
          </Box>
        </Grid>
        {tasks.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No tasks found. Create your first task!
              </Typography>
            </Paper>
          </Grid>
        ) : (
          tasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id || task._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {task.description}
                  </Typography>
                  <Box display="flex" gap={1} mb={2}>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                    <Chip
                      label={task.priority}
                      color={getPriorityColor(task.priority)}
                      size="small"
                    />
                  </Box>
                  {task.dueDate && (
                    <Typography variant="body2" color="text.secondary">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton size="small" onClick={() => handleOpen(task)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(task.id || task._id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingTask ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard; 