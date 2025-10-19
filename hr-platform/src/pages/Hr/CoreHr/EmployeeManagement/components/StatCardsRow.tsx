import React from "react";
import { StatCard } from '@/components/molecules/StatCard';
import { Avatar } from '@/components/ui/avatar';
import type { Employee } from "../types";

interface StatCardsRowProps {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  terminated: number;
  departments: number;
  onLeaveEmployees: Employee[];
}

export const StatCardsRow: React.FC<StatCardsRowProps> = ({
  totalEmployees,
  activeEmployees,
  onLeave,
  terminated,
  departments,
  onLeaveEmployees,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12 mt-8">
    <StatCard label="Total Employees" value={totalEmployees} color="violet" className="shadow-lg bg-secondary/20 border-2 border-violet-200 dark:border-violet-800" />
    <StatCard label="Active Employees" value={activeEmployees} color="violet" className="shadow-lg bg-secondary/20 border-2 border-violet-200 dark:border-violet-800" />
    <StatCard
      label="On Leave"
      value={onLeave}
      color="violet"
      className="shadow-lg bg-secondary/20 border-2 border-violet-200 dark:border-violet-800"
    >
      {onLeave > 0 && (
        <div className="flex items-center mb-2 -space-x-2">
          {onLeaveEmployees.slice(0, 3).map(emp => (
            <Avatar key={emp.id} className="w-7 h-7 border-2 border-background dark:border-background">
              <span className="text-xs font-semibold bg-muted rounded-full w-full h-full flex items-center justify-center">
                {emp.name.split(' ').map(n => n[0]).join('')}
              </span>
            </Avatar>
          ))}
          {onLeaveEmployees.length > 3 && (
            <span className="ml-2 text-xs text-muted-foreground">+{onLeaveEmployees.length - 3}</span>
          )}
        </div>
      )}
    </StatCard>
    <StatCard label="Terminated" value={terminated} color="violet" className="shadow-lg bg-secondary/20 border-2 border-violet-200 dark:border-violet-800" />
    <StatCard label="Departments" value={departments} color="violet" className="shadow-lg bg-secondary/20 border-2 border-violet-200 dark:border-violet-800" />
  </div>
); 