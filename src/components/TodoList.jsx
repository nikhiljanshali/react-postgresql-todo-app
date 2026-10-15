import React from 'react';
import { useTodos } from '../context/TodoContext';
import { TodoItem } from './TodoItem';
import { 
  CheckCircle, 
  SearchX, 
  FolderPlus, 
  RotateCcw, 
  Plus 
} from 'lucide-react';

export const TodoList = ({ onEdit, onDelete, onOpenCreateModal }) => {
  const { 
    filteredTodos, 
    todos, 
    searchQuery, 
    setSearchQuery,
    filter, 
    setFilter,
    selectedCategory,
    setSelectedCategory,
    resetToMockData 
  } = useTodos();

  if (todos.length === 0) {
    return (
      <div className="empty-state-card">
        <div className="empty-icon-wrap empty-icon-success">
          <CheckCircle size={42} />
        </div>
        <h3 className="empty-title">All tasks completed!</h3>
        <p className="empty-subtitle">
          You don't have any tasks in your list right now. Add a new task or reload the demonstration dataset.
        </p>
        <div className="empty-actions">
          <button 
            type="button" 
            className="btn btn-primary btn-icon-text"
            onClick={onOpenCreateModal}
          >
            <Plus size={16} />
            <span>Create New Task</span>
          </button>
          <button 
            type="button" 
            className="btn btn-secondary btn-icon-text"
            onClick={resetToMockData}
          >
            <RotateCcw size={16} />
            <span>Restore Mock Data</span>
          </button>
        </div>
      </div>
    );
  }

  if (filteredTodos.length === 0) {
    return (
      <div className="empty-state-card">
        <div className="empty-icon-wrap">
          <SearchX size={42} />
        </div>
        <h3 className="empty-title">No matching tasks found</h3>
        <p className="empty-subtitle">
          {searchQuery ? (
            <>No results matching <strong>"{searchQuery}"</strong>.</>
          ) : (
            <>No tasks found with the current filter criteria.</>
          )}
        </p>
        <div className="empty-actions">
          {searchQuery && (
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => setSearchQuery('')}
            >
              Clear Search Query
            </button>
          )}
          {(filter !== 'all' || selectedCategory !== 'all') && (
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setFilter('all');
                setSelectedCategory('all');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="todo-list-wrapper">
      <div className="todo-list-header">
        <span className="todo-list-count">
          Showing <strong>{filteredTodos.length}</strong> {filteredTodos.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>
      <div className="todos-grid">
        {filteredTodos.map(todo => (
          <TodoItem 
            key={todo.id} 
            todo={todo} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))}
      </div>
    </div>
  );
};
