'use client';

import { motion } from 'framer-motion';
import { BookOpen, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneratedQuestion } from '@/types';

interface QuestionCardProps {
  question: GeneratedQuestion;
  index: number;
}

export default function QuestionCard({ question, index }: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="w-full"
    >
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="flex flex-row items-start gap-4 pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-500">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-indigo-500 uppercase">
              Question {index + 1} of 5
            </span>
            <CardTitle className="text-xl font-bold text-text-primary leading-snug">
              {question.question}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="pt-2">
          {question.context && (
            <Badge
              variant="outline"
              className="py-1 px-3 bg-indigo-500/5 text-indigo-400 border-indigo-500/20 text-xs font-medium inline-flex items-center gap-1.5 rounded-full"
            >
              <BookOpen size={12} />
              {question.context}
            </Badge>
          )}

          {question.expectedTopics && question.expectedTopics.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Key Topics to cover:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {question.expectedTopics.map((topic, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-card text-text-secondary border border-border text-xs rounded-md">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
