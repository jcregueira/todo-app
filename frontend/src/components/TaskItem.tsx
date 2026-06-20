import React, { useState } from 'react';
import { Button, Select, Badge } from '@/components/ui/Button';
import type { Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority } from '@/types';

const priorityColors: Record<TaskPriority, 'green' | 'yellow' | 'red'> = {
  [TaskPriority.LOW]: 'green',
  [TaskPriority.MEDIUM]: 'yellow',
  [TaskPriority.HIGH]: 'red',
};

const priorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Baja',
  [TaskPriority.MEDIUM]: 'Media',
  [TaskPriority.HIGH]: 'Alta',
};

export const TaskItem: React.FC<{ task: Task; onToggle: (t: Task) => Promise<unknown>; onUpdate: (id: number, d: TaskUpdate) => Promise<unknown>; onDelete: (id: number) => Promise<void> }> = ({ task, onToggle, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

  const handleSave = async () => {
    if (title.trim() && title !== task.title) {
      await onUpdate(task.id, { title: title.trim() });
    }
    setEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(task.id);
    setShowConfirmDelete(false);
  };

  return (
    <div className={`group flex items-start gap-3 p-3 bg-white rounded-lg border transition-all ${isCompleted ? 'opacity-60 border-gray-200' : isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
      {/* Checkbox */}
      <button onClick={() => onToggle(task)} className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'}`}>
        {isCompleted && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex gap-2">
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSave()} className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <Button size="sm" onClick={handleSave}>Guardar</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
          </div>
        ) : (
          <div>
            <p className={`text-sm font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
            {task.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>}
            <div className="flex items-center gap-2 mt-1.5">
              <Badge color={priorityColors[task.priority]}>{priorityLabels[task.priority]}</Badge>
              {task.due_date && (
                <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                  {isOverdue ? '⚠️ Vencida: ' : '📅 '}{new Date(task.due_date).toLocaleDateString('es-ES')}
                </span>
              )}
              {isCompleted && <Badge color="green">Completada</Badge>}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!editing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>✏️</Button>
          {showConfirmDelete ? (
            <div className="flex gap-1">
              <Button size="sm" variant="danger" onClick={handleDelete}>Sí</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowConfirmDelete(false)}>No</Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setShowConfirmDelete(true)}>🗑️</Button>
          )}
        </div>
      )}
    </div>
  );
};

interface TaskFormProps { onSubmit: (data: TaskCreate) => Promise<void>; onCancel?: () => void; }

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit({ title: title.trim(), description: description || undefined, priority, due_date: dueDate || undefined });
    setTitle(''); setDescription(''); setPriority(TaskPriority.MEDIUM); setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la tarea *" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción (opcional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div className="flex gap-3">
        <Select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} options={[{ value: 'low', label: 'Prioridad baja' }, { value: 'medium', label: 'Prioridad media' }, { value: 'high', label: 'Prioridad alta' }]} className="flex-1" />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}
        <Button type="submit" disabled={!title.trim()}>Crear tarea</Button>
      </div>
    </form>
  );
};
