import React from 'react';
import { useTodos } from '../context/TodoContext';
import { 
  CheckCircle2, 
  Plus, 
  RotateCcw, 
  Sun, 
  Moon, 
  Database,
  CalendarDays
} from 'lucide-react';

export const Navbar = ({ onOpenCreateModal }) => {
  const { theme, toggleTheme, resetToMockData, stats, dbStatus } = useTodos();

  const handleReset = () => {
    if (window.confirm('Reset database back to original mock demonstration data?')) {
      resetToMockData();
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Left: Branding & Date */}
        <div className="brand-section">
          <div className="logo-badge">
            <CheckCircle2 className="logo-icon" size={28} />
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1 className="brand-title">PlanFlow</h1>
              <span className="version-pill">React 19</span>
              
              {/* Database indicator badge */}
              <div 
                className={`db-status-pill ${dbStatus.isDbConnected ? 'connected' : 'disconnected'}`}
                title={dbStatus.message || (dbStatus.isDbConnected ? 'Connected to PostgreSQL' : 'PostgreSQL not connected')}
              >
                <Database size={11} />
                <span className="status-dot"></span>
                <span>{dbStatus.isDbConnected ? 'PostgreSQL' : 'PostgreSQL (Pending)'}</span>
              </div>
            </div>
            <div className="brand-subtitle">
              <CalendarDays size={13} className="subtitle-icon" />
              <span>{currentDate}</span>
              <span className="dot-divider">•</span>
              <span>{stats.pendingCount} tasks remaining</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="navbar-actions">
          <button 
            type="button"
            className="btn btn-secondary btn-icon-text"
            onClick={handleReset}
            title="Reset database to initial demonstration dataset"
          >
            <RotateCcw size={16} />
            <span className="hide-on-mobile">Reset Mock Data</span>
          </button>

          <button 
            type="button"
            className="btn btn-icon theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button 
            type="button"
            className="btn btn-primary btn-icon-text"
            onClick={onOpenCreateModal}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
