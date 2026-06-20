import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import useTasks from '@/hooks/useTasks';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import FilterBar from '@/components/FilterBar';
import SearchBar from '@/components/SearchBar';
import Button from '@/components/ui/Button';
import type { Task, TaskStatus, TaskPriority } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const clearTokens = useAuthStore((s) => s.clearTokens);

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const statusFilter =
    filter === 'pending'
      ? TaskStatus.PENDING
      : filter === 'completed'
        ? TaskStatus.COMPLETED
        : undefined;

  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleStatus,
  } = useTasks({
    status: statusFilter,
    q: searchQuery || undefined,
    sortBy,
  });

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
    completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
  };

  const handleLogout = () => {
    clearTokens();
    navigate('/login');
  };

  const handleCreate = async (data: { title: string; description?: string; priority?: TaskPriority; due_date?: string }) => {
    await createTask(data);
  };

  const handleUpdate = async (data: { title?: string; description?: string; status?: TaskStatus; priority?: TaskPriority; due_date?: string | null }) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
      setEditingTask(null);
      setFormMode('create');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormMode('edit');
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setFormMode('create');
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  if (!token) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">📋 Todo App</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            🚪 Salir
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <SearchBar onSearch={handleSearch} />

        <FilterBar
          activeFilter={filter}
          onFilterChange={setFilter}
          counts={counts}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <TaskForm
          mode={formMode}
          task={editingTask}
          onSubmit={formMode === 'create' ? handleCreate : handleUpdate}
          onCancel={formMode === 'edit' ? handleCancelEdit : undefined}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onToggle={toggleStatus}
            onDelete={deleteTask}
            onEdit={handleEdit}
          />
        )}
      </main>
    </div>
  );
}
