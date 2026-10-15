import React from 'react';
import { useTodos } from '../context/TodoContext';
import { CATEGORIES } from '../data/mockTodos';
import { 
  Search, 
  X, 
  ArrowUpDown, 
  Filter, 
  Trash2,
  Tag,
  Briefcase,
  User,
  BookOpen,
  Heart,
  DollarSign
} from 'lucide-react';

const CATEGORY_ICONS = {
  Briefcase,
  User,
  BookOpen,
  Heart,
  DollarSign
};

export const TaskControls = () => {
  const { 
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
    stats,
    clearCompleted
  } = useTodos();

  const handleClearCompleted = () => {
    if (window.confirm(`Are you sure you want to delete all ${stats.completedCount} completed tasks?`)) {
      clearCompleted();
    }
  };

  return (
    <div className="controls-container">
      {/* Search Bar & Sort Row */}
      <div className="search-sort-row">
        {/* Search input */}
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, description or subtask..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="sort-group">
          <label className="sort-label">
            <ArrowUpDown size={15} />
            <span>Sort:</span>
          </label>
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="createdAt">Date Created</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
          <button
            type="button"
            className="btn btn-secondary btn-icon-only sort-dir-btn"
            onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Categories Filter Bar */}
      <div className="filter-scroll-wrapper">
        <div className="categories-filter-bar">
          <button
            type="button"
            className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <Tag size={13} />
            <span>All Categories</span>
          </button>

          {CATEGORIES.map(cat => {
            const IconComponent = CATEGORY_ICONS[cat.icon] || Tag;
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                style={{
                  '--cat-color': cat.color
                }}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <IconComponent size={13} style={{ color: cat.color }} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Filter Tabs & Batch Actions */}
      <div className="status-tabs-row">
        <div className="tabs-group">
          {[
            { id: 'all', label: 'All Tasks', count: stats.totalCount },
            { id: 'active', label: 'Active', count: stats.pendingCount },
            { id: 'completed', label: 'Completed', count: stats.completedCount },
            { id: 'high', label: 'High Priority' },
            { id: 'overdue', label: 'Overdue', count: stats.overdueCount, isAlert: stats.overdueCount > 0 }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${filter === tab.id ? 'active' : ''} ${tab.isAlert ? 'tab-alert' : ''}`}
              onClick={() => setFilter(tab.id)}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="tab-badge">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {stats.completedCount > 0 && (
          <button
            type="button"
            className="btn btn-ghost-danger btn-sm clear-completed-btn"
            onClick={handleClearCompleted}
            title="Remove all completed tasks"
          >
            <Trash2 size={14} />
            <span>Clear Completed ({stats.completedCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};
