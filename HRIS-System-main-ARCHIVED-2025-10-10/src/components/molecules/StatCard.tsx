import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  color?: string; // e.g., 'secondary', 'violet', 'green', etc.
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, description, color = 'secondary' }) => {
  // Use color as a ring/accent, fallback to secondary
  const ringClass = color === 'secondary' ? 'ring-secondary' : `ring-${color}-500`;
  const valueClass = color === 'secondary' ? 'text-foreground' : `text-${color}-600 dark:text-${color}-400`;

  return (
    <Card className={`w-full shadow-sm bg-card text-card-foreground border-0 ring-2 ${ringClass}`}>
      <CardHeader>
        <CardTitle className="text-base font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold mb-1 ${valueClass}`}>{value}</div>
        {description && <div className="text-xs text-muted-foreground">{description}</div>}
      </CardContent>
    </Card>
  );
}; 