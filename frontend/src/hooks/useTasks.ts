import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import type { Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority } from '@/types';

interface UseTasksOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  q?: string;
  sortBy?: 'date' | 'priority';
}

export default function useTasks(options: UseTasksOptions = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((s) => s.token);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (options.status) params.status = options.status;
      if (options.priority) params.priority = options.priority;
      if (options.q) params.q = options.q;

      const res = await tasksApi.list(params);
      let data = res.data.data;

      if (options.sortBy === 'priority') {
        const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
        data = [...data].sort(
          (a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1)
        );
      }

      setTasks(data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || 'Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  }, [token, options.status, options.priority, options.q, options.sortBy]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data: TaskCreate) => {
    try {
      const res = await tasksApi.create(data);
      setTasks((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      throw new Error(axiosErr?.response?.data?.detail || 'Error al crear la tarea');
    }
  };

  const updateTask = async (id: number, data: TaskUpdate) => {
    try {
      const res = await tasksApi.update(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
      return res.data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      throw new Error(axiosErr?.response?.data?.detail || 'Error al actualizar la tarea');
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await tasksApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      throw new Error(axiosErr?.response?.data?.detail || 'Error al eliminar la tarea');
    }
  };

  const toggleStatus = async (id: number, status: TaskStatus) => {
    try {
      const res = await tasksApi.update(id, { status });
      setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || 'Error al cambiar el estado');
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleStatus,
  };
}
