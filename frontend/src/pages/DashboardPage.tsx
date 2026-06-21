import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { tasksApi } from '@/api/client';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import FilterBar from '@/components/FilterBar';
import SearchBar from '@/components/SearchBar';
import Button from '@/components/ui/Button';
import type { Task, TaskCreate, TaskUpdate } from '@/types';
import { TaskStatus } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const clearTokens = useAuthStore((s) => s.clearTokens);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = { page: '1', limit: '50' };
      if (filter === 'pending') params.status = 'pending';
      else if (filter === 'completed') params.status = 'completed';
      if (searchQuery) params.q = searchQuery;
      const res = await tasksApi.list(params);
      setTasks(res.data.data);
    } catch (err) {
      setError('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  }, [filter, searchQuery]);

  useEffect(() => { if (token) fetchTasks(); }, [token, fetchTasks]);

  const handleCreate = async (data: TaskCreate | TaskUpdate) => {
    const res = await tasksApi.create(data as TaskCreate);
    setTasks((prev) => [res.data, ...prev]);
  };

  const handleUpdate = async (id: number, data: TaskUpdate) => {
    const res = await tasksApi.update(id, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
  };

  const handleDelete = async (id: number) => {
    await tasksApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggle = async (task: Task) => {
    const newStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    await handleUpdate(task.id, { status: newStatus });
    fetchTasks();
  };

  const handleEdit = (task: Task) => { setEditingTask(task); setFormMode('edit'); };
  const handleCancelEdit = () => { setEditingTask(null); setFormMode('create'); };
  const handleSearch = useCallback((q: string) => setSearchQuery(q), []);
  const handleLogout = () => { clearTokens(); navigate('/login'); };

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  if (!token) { navigate('/login', { replace: true }); return null; }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">📋 Todo App</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>🚪 Salir</Button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <SearchBar onSearch={handleSearch} />
        <FilterBar activeFilter={filter} onFilterChange={setFilter} counts={counts} sortBy={sortBy} onSortChange={setSortBy} />
        <TaskForm mode="create" onSubmit={async (d) => { await handleCreate(d as TaskCreate); fetchTasks(); }} />
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">⚠️ {error}</div>}
        <TaskList tasks={tasks} loading={loading} onToggle={handleToggle} onDelete={handleDelete} onUpdate={handleUpdate} />
      </main>
    </div>
  );
}
