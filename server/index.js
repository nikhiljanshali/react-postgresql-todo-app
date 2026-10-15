import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  initializeDatabase, 
  getAllTodos, 
  createTodo, 
  updateTodo, 
  deleteTodo, 
  toggleTodo, 
  toggleSubtask, 
  clearCompleted, 
  resetDatabase,
  isDbConnected,
  dbError
} from './db.js';
import { INITIAL_MOCK_TODOS } from './seedData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory fallback dataset for when PostgreSQL connection is pending
let memoryTodos = JSON.parse(JSON.stringify(INITIAL_MOCK_TODOS));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: isDbConnected ? 'connected' : 'waiting_for_database',
    database: 'PostgreSQL',
    isDbConnected,
    error: dbError || null,
    message: isDbConnected 
      ? 'Connected to PostgreSQL database.' 
      : 'PostgreSQL is not connected yet. Operating in fallback mode. Configure DATABASE_URL in .env to persist to PostgreSQL.'
  });
});

// GET all todos
app.get('/api/todos', async (req, res) => {
  if (isDbConnected) {
    try {
      const todos = await getAllTodos();
      return res.json(todos);
    } catch (err) {
      console.error('Error fetching todos from PostgreSQL:', err);
      return res.status(500).json({ error: 'Failed to fetch todos from database' });
    }
  }

  // Fallback
  res.json(memoryTodos);
});

// POST create todo
app.post('/api/todos', async (req, res) => {
  const { title, description, category, priority, dueDate, subtasks } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const todoPayload = {
    id: 'todo-' + Date.now(),
    title: title.trim(),
    description: description || '',
    category: category || 'work',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
    completed: false,
    subtasks: (subtasks || []).map((sub, idx) => ({
      id: sub.id || `sub-${Date.now()}-${idx}`,
      title: typeof sub === 'string' ? sub.trim() : sub.title.trim(),
      completed: typeof sub === 'object' ? !!sub.completed : false
    })).filter(s => s.title.length > 0)
  };

  if (isDbConnected) {
    try {
      const created = await createTodo(todoPayload);
      return res.status(201).json(created);
    } catch (err) {
      console.error('Error creating todo in PostgreSQL:', err);
      return res.status(500).json({ error: 'Failed to create todo in database' });
    }
  }

  // Fallback
  memoryTodos.unshift(todoPayload);
  res.status(201).json(todoPayload);
});

// PUT update todo
app.put('/api/todos/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (isDbConnected) {
    try {
      await updateTodo(id, updates);
      return res.json({ success: true, message: 'Todo updated successfully' });
    } catch (err) {
      console.error('Error updating todo in PostgreSQL:', err);
      return res.status(500).json({ error: 'Failed to update todo in database' });
    }
  }

  // Fallback
  memoryTodos = memoryTodos.map(item => item.id === id ? { ...item, ...updates } : item);
  res.json({ success: true });
});

// DELETE todo
app.delete('/api/todos/:id', async (req, res) => {
  const { id } = req.params;

  if (isDbConnected) {
    try {
      await deleteTodo(id);
      return res.json({ success: true, message: 'Todo deleted successfully' });
    } catch (err) {
      console.error('Error deleting todo from PostgreSQL:', err);
      return res.status(500).json({ error: 'Failed to delete todo from database' });
    }
  }

  // Fallback
  memoryTodos = memoryTodos.filter(item => item.id !== id);
  res.json({ success: true });
});

// PATCH toggle completed
app.patch('/api/todos/:id/toggle', async (req, res) => {
  const { id } = req.params;

  if (isDbConnected) {
    try {
      const completedState = await toggleTodo(id);
      return res.json({ success: true, completed: completedState });
    } catch (err) {
      console.error('Error toggling todo:', err);
      return res.status(500).json({ error: 'Failed to toggle todo status' });
    }
  }

  // Fallback
  memoryTodos = memoryTodos.map(item => {
    if (item.id === id) {
      const nextCompleted = !item.completed;
      return {
        ...item,
        completed: nextCompleted,
        subtasks: item.subtasks.map(s => ({ ...s, completed: nextCompleted ? true : s.completed }))
      };
    }
    return item;
  });
  res.json({ success: true });
});

// PATCH toggle subtask
app.patch('/api/todos/:id/subtasks/:subtaskId/toggle', async (req, res) => {
  const { id, subtaskId } = req.params;

  if (isDbConnected) {
    try {
      await toggleSubtask(id, subtaskId);
      return res.json({ success: true });
    } catch (err) {
      console.error('Error toggling subtask:', err);
      return res.status(500).json({ error: 'Failed to toggle subtask status' });
    }
  }

  // Fallback
  memoryTodos = memoryTodos.map(item => {
    if (item.id === id) {
      const updatedSubtasks = item.subtasks.map(sub => 
        sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
      );
      const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
      return {
        ...item,
        subtasks: updatedSubtasks,
        completed: allDone ? true : item.completed
      };
    }
    return item;
  });
  res.json({ success: true });
});

// DELETE clear completed
app.delete('/api/todos-batch/completed', async (req, res) => {
  if (isDbConnected) {
    try {
      await clearCompleted();
      return res.json({ success: true, message: 'Completed todos cleared' });
    } catch (err) {
      console.error('Error clearing completed:', err);
      return res.status(500).json({ error: 'Failed to clear completed todos' });
    }
  }

  // Fallback
  memoryTodos = memoryTodos.filter(item => !item.completed);
  res.json({ success: true });
});

// POST reset to mockup data
app.post('/api/todos/reset', async (req, res) => {
  if (isDbConnected) {
    try {
      await resetDatabase();
      const todos = await getAllTodos();
      return res.json({ success: true, todos });
    } catch (err) {
      console.error('Error resetting database:', err);
      return res.status(500).json({ error: 'Failed to reset database' });
    }
  }

  // Fallback
  memoryTodos = JSON.parse(JSON.stringify(INITIAL_MOCK_TODOS));
  res.json({ success: true, todos: memoryTodos });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
  await initializeDatabase();
});
