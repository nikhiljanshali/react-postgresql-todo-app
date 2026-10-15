import React from 'react';
import { useTodos } from '../context/TodoContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ListTodo, 
  TrendingUp,
  Calendar
} from 'lucide-react';

export const StatsOverview = () => {
  const { stats, filter, setFilter } = useTodos();

  const cards = [
    {
      id: 'all',
      title: 'Total Tasks',
      count: stats.totalCount,
      icon: ListTodo,
      color: 'blue',
      active: filter === 'all'
    },
    {
      id: 'today',
      title: 'Due Today',
      count: stats.dueTodayCount,
      icon: Calendar,
      color: 'indigo',
      active: filter === 'today'
    },
    {
      id: 'active',
      title: 'In Progress',
      count: stats.pendingCount,
      icon: Clock,
      color: 'amber',
      active: filter === 'active'
    },
    {
      id: 'completed',
      title: 'Completed',
      count: stats.completedCount,
      icon: CheckCircle2,
      color: 'emerald',
      active: filter === 'completed'
    },
    {
      id: 'overdue',
      title: 'Overdue',
      count: stats.overdueCount,
      icon: AlertTriangle,
      color: 'rose',
      active: filter === 'overdue',
      isWarning: stats.overdueCount > 0
    }
  ];

  return (
    <section className="stats-section">
      {/* Metric Cards Grid */}
      <div className="stats-grid">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              className={`stat-card stat-${card.color} ${card.active ? 'active-filter-card' : ''} ${card.isWarning ? 'has-warning' : ''}`}
              onClick={() => setFilter(card.id)}
              title={`Click to filter by ${card.title}`}
            >
              <div className="stat-card-header">
                <span className="stat-card-title">{card.title}</span>
                <div className={`stat-icon-wrapper stat-icon-${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="stat-card-body">
                <span className="stat-count">{card.count}</span>
                {card.id === 'completed' && stats.totalCount > 0 && (
                  <span className="stat-subtext">
                    {stats.completionPercentage}% done
                  </span>
                )}
                {card.id === 'overdue' && card.count > 0 && (
                  <span className="stat-subtext-danger">
                    Needs attention
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Overall Progress Banner */}
      <div className="progress-banner">
        <div className="progress-banner-header">
          <div className="progress-title-wrap">
            <TrendingUp size={18} className="progress-icon" />
            <span className="progress-label">Task Completion Rate</span>
          </div>
          <span className="progress-percentage">
            {stats.completedCount} of {stats.totalCount} completed ({stats.completionPercentage}%)
          </span>
        </div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
      </div>
    </section>
  );
};
