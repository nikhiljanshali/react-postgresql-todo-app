import React, { useState, useEffect } from 'react';
import { useTodos } from '../context/TodoContext';
import { CATEGORIES, PRIORITIES } from '../data/mockTodos';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Tag, 
  AlertCircle 
} from 'lucide-react';

export const TodoModal = ({ isOpen, onClose, initialData }) => {
  const { addTodo, updateTodo } = useTodos();

  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('work');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [error, setError] = useState('');

  // Sync state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setCategory(initialData.category || 'work');
        setPriority(initialData.priority || 'medium');
        setDueDate(initialData.dueDate || '');
        setSubtasks(initialData.subtasks ? initialData.subtasks.map(s => ({ ...s })) : []);
      } else {
        // Defaults for new task
        setTitle('');
        setDescription('');
        setCategory('work');
        setPriority('medium');
        setDueDate(new Date().toISOString().split('T')[0]);
        setSubtasks([]);
      }
      setSubtaskInput('');
      setError('');
    }
  }, [isOpen, initialData]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddSubtask = (e) => {
    e?.preventDefault();
    const trimmed = subtaskInput.trim();
    if (!trimmed) return;

    setSubtasks(prev => [
      ...prev,
      {
        id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        title: trimmed,
        completed: false
      }
    ]);
    setSubtaskInput('');
  };

  const handleRemoveSubtask = (idxToRemove) => {
    setSubtasks(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate,
      subtasks
    };

    if (isEditing) {
      updateTodo(initialData.id, payload);
    } else {
      addTodo(payload);
    }

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <span className="modal-subtitle">
              {isEditing ? 'Update task details and checklist' : 'Fill in the details to plan your task'}
            </span>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="form-error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Title <span className="required-star">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              className="form-input"
              placeholder="e.g. Prepare marketing presentation"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">
              Description / Notes
            </label>
            <textarea
              id="task-desc"
              className="form-textarea"
              placeholder="Add extra context, links, or notes..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Grid row: Category, Priority, Due Date */}
          <div className="form-grid-3">
            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="task-due-date">
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="form-group subtasks-form-section">
            <label className="form-label">
              Subtasks Checklist ({subtasks.length})
            </label>
            <div className="subtask-add-row">
              <input
                type="text"
                className="form-input"
                placeholder="Type a subtask and press enter or click Add..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-icon-text"
                onClick={handleAddSubtask}
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="modal-subtasks-list">
                {subtasks.map((sub, idx) => (
                  <div key={sub.id || idx} className="modal-subtask-row">
                    <CheckCircle2 size={15} className="subtask-icon-bullet" />
                    <span className="subtask-text">{sub.title}</span>
                    <button
                      type="button"
                      className="subtask-remove-btn"
                      onClick={() => handleRemoveSubtask(idx)}
                      title="Remove subtask"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {isEditing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
