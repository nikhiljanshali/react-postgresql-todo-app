import React, { useState } from 'react';
import { useTodos } from '../context/TodoContext';
import { CATEGORIES, PRIORITIES } from '../data/mockTodos';
import { 
  Check, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  CheckSquare,
  Square,
  Briefcase,
  User,
  BookOpen,
  Heart,
  DollarSign,
  Tag
} from 'lucide-react';

const CATEGORY_ICONS = {
  Briefcase,
  User,
  BookOpen,
  Heart,
  DollarSign
};

export const TodoItem = ({ todo, onEdit, onDelete }) => {
  const { toggleComplete, toggleSubtask, addTodo } = useTodos();
  const [showSubtasks, setShowSubtasks] = useState(false);

  const categoryObj = CATEGORIES.find(c => c.id === todo.category) || {
    id: todo.category,
    label: todo.category,
    color: '#6366f1',
    icon: 'Tag'
  };
  const CategoryIcon = CATEGORY_ICONS[categoryObj.icon] || Tag;

  const priorityObj = PRIORITIES[todo.priority] || PRIORITIES.medium;

  // Format due date relative helper
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !todo.completed && todo.dueDate && todo.dueDate < todayStr;
  const isToday = !todo.completed && todo.dueDate === todayStr;

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr === todayStr) return 'Today';
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    if (dateStr === tomorrowStr) return 'Tomorrow';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (dateStr === yesterdayStr) return 'Yesterday';

    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const completedSubtasksCount = (todo.subtasks || []).filter(s => s.completed).length;
  const totalSubtasksCount = (todo.subtasks || []).length;

  const handleDuplicate = () => {
    addTodo({
      title: `${todo.title} (Copy)`,
      description: todo.description,
      category: todo.category,
      priority: todo.priority,
      dueDate: todo.dueDate,
      subtasks: (todo.subtasks || []).map(s => s.title)
    });
  };

  return (
    <div className={`todo-card ${todo.completed ? 'is-completed' : ''} ${isOverdue ? 'is-overdue-card' : ''}`}>
      <div className="todo-main-row">
        {/* Completion Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={todo.completed}
          className={`custom-checkbox ${todo.completed ? 'checked' : ''}`}
          onClick={() => toggleComplete(todo.id)}
          title={todo.completed ? 'Mark incomplete' : 'Mark completed'}
        >
          {todo.completed && <Check size={14} strokeWidth={3} />}
        </button>

        {/* Content Body */}
        <div className="todo-body">
          <div className="todo-title-row">
            <h3 className={`todo-title ${todo.completed ? 'completed-text' : ''}`}>
              {todo.title}
            </h3>
          </div>

          {todo.description && (
            <p className={`todo-desc ${todo.completed ? 'completed-text' : ''}`}>
              {todo.description}
            </p>
          )}

          {/* Metadata Badges (Category, Priority, Due Date, Subtask counter) */}
          <div className="todo-badges-row">
            {/* Category */}
            <span 
              className="badge category-badge"
              style={{
                color: categoryObj.color,
                borderColor: `${categoryObj.color}40`,
                backgroundColor: `${categoryObj.color}15`
              }}
            >
              <CategoryIcon size={12} />
              <span>{categoryObj.label}</span>
            </span>

            {/* Priority */}
            <span 
              className={`badge priority-badge priority-${todo.priority}`}
              style={{
                color: priorityObj.color,
                backgroundColor: priorityObj.bg
              }}
            >
              <span className="priority-dot" style={{ backgroundColor: priorityObj.color }} />
              <span>{priorityObj.label}</span>
            </span>

            {/* Due Date */}
            {todo.dueDate && (
              <span className={`badge due-date-badge ${isOverdue ? 'badge-danger' : isToday ? 'badge-warning' : ''}`}>
                {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                <span>{formatDueDate(todo.dueDate)}</span>
                {isOverdue && <span className="overdue-tag">Overdue</span>}
              </span>
            )}

            {/* Subtasks pill */}
            {totalSubtasksCount > 0 && (
              <button
                type="button"
                className={`subtasks-toggle-badge ${showSubtasks ? 'is-expanded' : ''}`}
                onClick={() => setShowSubtasks(!showSubtasks)}
                title="Toggle checklist"
              >
                <CheckSquare size={12} />
                <span>{completedSubtasksCount}/{totalSubtasksCount} subtasks</span>
                {showSubtasks ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
        </div>

        {/* Quick Actions Menu */}
        <div className="todo-actions-menu">
          <button
            type="button"
            className="action-btn edit-btn"
            onClick={() => onEdit(todo)}
            title="Edit task"
          >
            <Edit3 size={15} />
          </button>

          <button
            type="button"
            className="action-btn copy-btn"
            onClick={handleDuplicate}
            title="Duplicate task"
          >
            <Copy size={15} />
          </button>

          <button
            type="button"
            className="action-btn delete-btn"
            onClick={() => onDelete(todo)}
            title="Delete task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Expandable Subtasks Checklist */}
      {showSubtasks && totalSubtasksCount > 0 && (
        <div className="subtasks-container">
          <div className="subtasks-list">
            {todo.subtasks.map(sub => (
              <label 
                key={sub.id} 
                className={`subtask-item ${sub.completed ? 'subtask-completed' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={() => toggleSubtask(todo.id, sub.id)}
                  className="subtask-checkbox"
                />
                <span className="subtask-title">{sub.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
