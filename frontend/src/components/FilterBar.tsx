import { cn } from '@/utils/cn';
import Badge from '@/components/ui/Badge';

type FilterTab = 'all' | 'pending' | 'completed';

interface FilterBarProps {
  activeFilter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
  counts: { all: number; pending: number; completed: number };
  sortBy: 'date' | 'priority';
  onSortChange: (sort: 'date' | 'priority') => void;
}

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'completed', label: 'Completadas' },
];

export default function FilterBar({
  activeFilter,
  onFilterChange,
  counts,
  sortBy,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onFilterChange(tab.key)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150',
              activeFilter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            <Badge
              variant={tab.key === 'completed' ? 'success' : 'info'}
              className="ml-1.5"
            >
              {counts[tab.key]}
            </Badge>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Ordenar por:</span>
        <div className="flex gap-1">
          <button
            onClick={() => onSortChange('date')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150',
              sortBy === 'date'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            📅 Fecha
          </button>
          <button
            onClick={() => onSortChange('priority')}
            className={cn(
              'px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150',
              sortBy === 'priority'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            ⚡ Prioridad
          </button>
        </div>
      </div>
    </div>
  );
}
