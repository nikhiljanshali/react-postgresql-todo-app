import React, { useState } from 'react';
import { TodoProvider, useTodos } from './context/TodoContext';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { TaskControls } from './components/TaskControls';
import { TodoList } from './components/TodoList';
import { TodoModal } from './components/TodoModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Database, AlertCircle, CheckCircle2 } from 'lucide-react';

const TodoAppContent = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    initialData: null
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const { deleteTodo, dbStatus, isLoading } = useTodos();

  const handleOpenCreate = () => {
    setModalState({ isOpen: true, initialData: null });
  };

  const handleOpenEdit = (todo) => {
    setModalState({ isOpen: true, initialData: todo });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, initialData: null });
  };

  const handlePromptDelete = (todo) => {
    setDeleteTarget(todo);
  };

  const handleConfirmDelete = (id) => {
    deleteTodo(id);
    setDeleteTarget(null);
  };

  return (
    <div className="app-shell">
      <Navbar onOpenCreateModal={handleOpenCreate} />

      <main className="main-content">
        <div className="main-container">
          {/* Database Status Alert Banner */}
          {!dbStatus.isDbConnected && (
            <div className="db-banner-notice">
              <div className="db-banner-icon">
                <Database size={18} />
              </div>
              <div className="db-banner-content">
                <span className="db-banner-title">
                  PostgreSQL Connection Pending
                </span>
                <span className="db-banner-desc">
                  To persist data into your PostgreSQL database, provide your connection string in <code>.env</code> (e.g. from local PostgreSQL or Neon.tech / Supabase). App is currently operating in safe memory mode.
                </span>
              </div>
            </div>
          )}

          {/* Top Statistics Overview */}
          <StatsOverview />

          {/* Filtering, Searching, & Controls */}
          <TaskControls />

          {/* Todo Items List */}
          <TodoList 
            onEdit={handleOpenEdit} 
            onDelete={handlePromptDelete}
            onOpenCreateModal={handleOpenCreate}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            PlanFlow Task Management • Full-Stack React & PostgreSQL API
          </p>
          <p className="footer-subtext">
            {dbStatus.isDbConnected
              ? 'Tasks are dynamically synchronized with PostgreSQL database.'
              : 'Configure DATABASE_URL in .env to connect to your PostgreSQL database instance.'}
          </p>
        </div>
      </footer>

      {/* Create / Edit Modal */}
      <TodoModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        initialData={modalState.initialData}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        todo={deleteTarget}
      />
    </div>
  );
};

export default function App() {
  return (
    <TodoProvider>
      <TodoAppContent />
    </TodoProvider>
  );
}
