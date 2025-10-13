import React from 'react';
import { BookOpen, CheckCircle, FileText, TrendingUp } from 'lucide-react';
import { StatCard } from '../molecules/StatCard';
import { UserStats } from '../../types';

interface StatsOverviewProps {
  stats: UserStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Lessons"
        value={stats.totalProgress}
        icon={BookOpen}
        color="blue"
      />
      
      <StatCard
        title="Completed"
        value={stats.completedProgress}
        icon={CheckCircle}
        color="green"
      />
      
      <StatCard
        title="Documents"
        value={stats.totalDocuments}
        icon={FileText}
        color="purple"
      />
      
      <StatCard
        title="Completion Rate"
        value={`${Math.round(stats.completionRate)}%`}
        icon={TrendingUp}
        color="orange"
      />
    </div>
  );
}