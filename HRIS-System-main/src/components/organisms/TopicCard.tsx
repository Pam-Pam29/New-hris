import React from 'react';
import { BookOpen, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../molecules/Card';
import { ProgressBar } from '../molecules/ProgressBar';
import { Badge } from '../atoms/Badge';
import { Button } from '../molecules/Button';
import { MigrationTopic } from '../../types';

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
    <Card hover onClick={() => onTopicClick(topic.id)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-xl">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{topic.title}</h3>
              <p className="text-gray-600">
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
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        <ProgressBar 
          progress={progress} 
          showLabel={false}
          variant={isComplete ? 'success' : 'default'}
        />
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
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