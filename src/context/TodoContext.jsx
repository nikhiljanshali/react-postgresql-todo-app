import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_MOCK_TODOS } from '../data/mockTodos';

const TodoContext = createContext();

const THEME_KEY = 'flux_todo_theme_mode';

export const TodoProvider = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'light';
  });

  // State from Database
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({
    isDbConnected: false,
    database: 'PostgreSQL',
    message: 'Checking database connection...'
  });

  // Filter and Search states
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'active', 'completed', 'high', 'overdue'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');

  // Check health and database status
  const checkDbStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch {
      setDbStatus({
        isDbConnected: false,
        database: 'PostgreSQL',
        message: 'Could not reach backend API.'
      });
    }
  }, []);

  // Fetch all todos from backend
  const fetchTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/todos');
      if (res.ok) {
        const data = await res.json();
        setTodos(Array.isArray(data) ? data : []);
      } else {
        // Fallback to mock data if server error
        setTodos(INITIAL_MOCK_TODOS);
      }
    } catch (err) {
      console.warn('API error, falling back to local dataset:', err);
      setTodos(INITIAL_MOCK_TODOS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    checkDbStatus();
    fetchTodos();
  }, [checkDbStatus, fetchTodos]);

  // Persist theme & apply to document
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Add todo to database
  const addTodo = async (todoData) => {
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
      });
      if (res.ok) {
        const created = await res.json();
        setTodos(prev => [created, ...prev]);
        return created;
      }
    } catch (err) {
      console.error('Failed to create todo:', err);
    }
  };

  // Update todo in database
  const updateTodo = async (id, updatedFields) => {
    // Optimistic update
    setTodos(prev =>
      prev.map(item => item.id === id ? { ...item, ...updatedFields } : item)
    );

    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
    } catch (err) {
      console.error('Failed to update todo:', err);
      fetchTodos(); // Rollback if failed
    }
  };

  // Delete todo from database
  const deleteTodo = async (id) => {
    // Optimistic update
    setTodos(prev => prev.filter(item => item.id !== id));

    try {
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete todo:', err);
      fetchTodos();
    }
  };

  // Toggle todo completion
  const toggleComplete = async (id) => {
    // Optimistic update
    setTodos(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextVal = !item.completed;
          return {
            ...item,
            completed: nextVal,
            subtasks: (item.subtasks || []).map(s => ({
              ...s,
              completed: nextVal ? true : s.completed
            }))
          };
        }
        return item;
      })
    );

    try {
      await fetch(`/api/todos/${id}/toggle`, {
        method: 'PATCH'
      });
    } catch (err) {
      console.error('Failed to toggle todo:', err);
      fetchTodos();
    }
  };

  // Toggle subtask completion
  const toggleSubtask = async (todoId, subtaskId) => {
    // Optimistic update
    setTodos(prev =>
      prev.map(item => {
        if (item.id === todoId) {
          const updatedSubtasks = (item.subtasks || []).map(sub =>
            sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
          );
          const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
          return {
            ...item,
            subtasks: updatedSubtasks,
            completed: allCompleted ? true : item.completed
          };
        }
        return item;
      })
    );

    try {
      await fetch(`/api/todos/${todoId}/subtasks/${subtaskId}/toggle`, {
        method: 'PATCH'
      });
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
      fetchTodos();
    }
  };

  // Reset database back to mock data
  const resetToMockData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/todos/reset', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setTodos(data.todos || []);
      }
    } catch (err) {
      console.error('Failed to reset todos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear completed todos in database
  const clearCompleted = async () => {
    // Optimistic update
    setTodos(prev => prev.filter(item => !item.completed));

    try {
      await fetch('/api/todos-batch/completed', {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to clear completed todos:', err);
      fetchTodos();
    }
  };

  // Date comparison helper
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculated statistics
  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const overdueCount = todos.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;
  const dueTodayCount = todos.filter(t => !t.completed && t.dueDate === todayStr).length;
  const completionPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Filtered and sorted list
  const filteredTodos = todos.filter(item => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = item.title?.toLowerCase().includes(q);
      const matchesDesc = item.description?.toLowerCase().includes(q);
      const matchesSubtask = (item.subtasks || []).some(s => s.title?.toLowerCase().includes(q));
      if (!matchesTitle && !matchesDesc && !matchesSubtask) {
        return false;
      }
    }

    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    if (filter === 'active' && item.completed) return false;
    if (filter === 'completed' && !item.completed) return false;
    if (filter === 'high' && item.priority !== 'high') return false;
    if (filter === 'overdue' && (item.completed || !item.dueDate || item.dueDate >= todayStr)) return false;
    if (filter === 'today' && (item.completed || item.dueDate !== todayStr)) return false;

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'dueDate') {
      comparison = (a.dueDate || '').localeCompare(b.dueDate || '');
    } else if (sortBy === 'priority') {
      const weights = { high: 3, medium: 2, low: 1 };
      comparison = (weights[b.priority] || 0) - (weights[a.priority] || 0);
    } else if (sortBy === 'createdAt') {
      comparison = new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'title') {
      comparison = (a.title || '').localeCompare(b.title || '');
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <TodoContext.Provider
      value={{
        theme,
        toggleTheme,
        todos,
        filteredTodos,
        isLoading,
        dbStatus,
        checkDbStatus,
        filter,
        setFilter,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        stats: {
          totalCount,
          completedCount,
          pendingCount,
          overdueCount,
          dueTodayCount,
          completionPercentage
        },
        addTodo,
        updateTodo,
        deleteTodo,
        toggleComplete,
        toggleSubtask,
        resetToMockData,
        clearCompleted
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};
