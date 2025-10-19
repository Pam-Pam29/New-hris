import React from 'react';
import { BookOpen, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

// Local types to avoid missing imports
interface MigrationSubtopic {
  id: string;
  title: string;
  progress?: {
    completed?: boolean;
  };
}

export interface MigrationTopic {
  id: string;
  title: string;
  subtopics: MigrationSubtopic[];
}

interface TopicCardProps {
  topic: MigrationTopic;
  onTopicClick: (topicId: string) => void;
}

export function TopicCard({ topic, onTopicClick }: TopicCardProps) {
  const completedSubtopics = topic.subtopics.filter(s => s.progress?.completed).length;
  const totalSubtopics = topic.subtopics.length;
  const progress = totalSubtopics > 0 ? (completedSubtopics / totalSubtopics) * 100 : 0;
  const isComplete = progress === 100;

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onTopicClick(topic.id)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-xl">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{topic.title}</h3>
              <p className="text-muted-foreground">
                {completedSubtopics} of {totalSubtopics} lessons completed
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isComplete ? (
              <Badge variant="success">
                <CheckCircle className="w-4 h-4 mr-1" />
                Complete
              </Badge>
            ) : (
              <Badge variant="warning">
                <Clock className="w-4 h-4 mr-1" />
                In Progress
              </Badge>
            )}
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        <div className="h-2 w-full rounded-full bg-muted dark:bg-muted/50">
          <div
            className="h-2 rounded-full bg-primary dark:bg-primary/90"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {Math.round(progress)}% complete
          </span>
          <Button size="sm" variant="outline">
            {isComplete ? 'Review' : 'Continue'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
