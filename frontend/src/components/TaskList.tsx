import TaskItem from '@/components/TaskItem';
import type { Task, TaskStatus } from '@/types';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
  onEdit: (task: Task) => void;
}

export default function TaskList({ tasks, onToggle, onDelete, onEdit }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-6xl mb-4">📋</span>
        <h3 className="text-lg font-medium text-gray-700 mb-1">
          ¡Crea tu primera tarea!
        </h3>
        <p className="text-sm text-gray-500">
          Usa el formulario de arriba para empezar a organizar tu día.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
