import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info';
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  children: ReactNode;
  className?: string;
}

const colorMap: Record<string, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
};

export default function Badge({ variant, color, children, className }: BadgeProps) {
  const key = variant || color || 'info';
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colorMap[key] || colorMap.info, className)}>
      {children}
    </span>
  );
}
