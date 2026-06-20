import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { TaskPriority } from '@/types';
import type { Task, TaskCreate, TaskUpdate } from '@/types';

interface TaskFormProps {
  mode: 'create' | 'edit';
  task?: Task;
  onSubmit: (data: TaskCreate | TaskUpdate) => Promise<void>;
  onCancel?: () => void;
}

export default function TaskForm({ mode, task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState(task?.due_date?.slice(0, 10) || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const data = mode === 'create'
      ? { title: title.trim(), description: description || undefined, priority, due_date: dueDate || undefined }
      : { title: title.trim(), description: description || undefined, priority, due_date: dueDate || null };
    await onSubmit(data);
    if (mode === 'create') { setTitle(''); setDescription(''); setPriority(TaskPriority.MEDIUM); setDueDate(''); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-white rounded-xl border border-gray-200">
      <h3 className="font-medium text-gray-800">{mode === 'edit' ? '✏️ Editar tarea' : '➕ Nueva tarea'}</h3>
      <Input placeholder="Título de la tarea *" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input placeholder="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex gap-3">
        <Select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          options={[
            { value: TaskPriority.LOW, label: '🟢 Prioridad baja' },
            { value: TaskPriority.MEDIUM, label: '🟡 Prioridad media' },
            { value: TaskPriority.HIGH, label: '🔴 Prioridad alta' },
          ]}
          className="flex-1"
        />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" disabled={!title.trim()}>{mode === 'edit' ? 'Guardar' : 'Crear tarea'}</Button>
      </div>
    </form>
  );
}
