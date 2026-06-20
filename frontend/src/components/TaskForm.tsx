import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import type { Task, TaskCreate, TaskUpdate, TaskPriority } from '@/types';

interface TaskFormProps {
  mode: 'create' | 'edit';
  task?: Task | null;
  onSubmit: (data: TaskCreate | TaskUpdate) => void;
  onCancel?: () => void;
}

const priorityOptions = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
];

export default function TaskForm({ mode, task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
    setError('');
  }, [mode, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate || undefined,
    };

    onSubmit(mode === 'create' ? data : data);
    if (mode === 'create') {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">
        {mode === 'create' ? '➕ Nueva tarea' : '✏️ Editar tarea'}
      </h2>

      <Input
        label="Título"
        placeholder="¿Qué necesitas hacer?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={error}
      />

      <Input
        label="Descripción"
        placeholder="Detalles opcionales..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Prioridad"
          options={priorityOptions}
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
        />

        <Input
          label="Fecha límite"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" variant="primary">
          {mode === 'create' ? 'Crear tarea' : 'Guardar cambios'}
        </Button>
        {mode === 'edit' && onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
