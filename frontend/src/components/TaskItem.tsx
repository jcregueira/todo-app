import { useState } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { Task } from '@/types';
import { TaskStatus, TaskPriority } from '@/types';

const priorityColorMap: Record<TaskPriority, 'green' | 'yellow' | 'red'> = {
  low: 'green',
  medium: 'yellow',
  high: 'red',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: '🟢 Baja',
  medium: '🟡 Media',
  high: '🔴 Alta',
};

export const TaskItem: React.FC<{
  task: Task;
  onToggle: (t: Task) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}> = ({ task, onToggle, onDelete, onEdit }) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

  const handleSave = async () => {
    if (title.trim() && title !== task.title) {
      const { tasksApi } = await import('@/api/client');
      await tasksApi.update(task.id, { title: title.trim() });
    }
    setEditing(false);
  };

  return (
    <div className={`group flex items-start gap-3 p-3 bg-white rounded-lg border transition-all ${
      isCompleted ? 'opacity-60 border-gray-200' : isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
    }`}>
      <button
        onClick={() => onToggle(task)}
        className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {isCompleted && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button size="sm" onClick={handleSave}>Guardar</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
          </div>
        ) : (
          <div>
            <p className={`text-sm font-medium ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
            {task.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge color={priorityColorMap[task.priority]}>{priorityLabels[task.priority]}</Badge>
              {task.due_date && (
                <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                  {isOverdue ? '⚠️ Vencida: ' : '📅 '}{new Date(task.due_date).toLocaleDateString('es-ES')}
                </span>
              )}
              {isCompleted && <Badge color="green">✅ Completada</Badge>}
            </div>
          </div>
        )}
      </div>

      {!editing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>✏️</Button>
          {showConfirmDelete ? (
            <div className="flex gap-1">
              <Button size="sm" variant="danger" onClick={() => onDelete(task.id)}>Sí</Button>
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
