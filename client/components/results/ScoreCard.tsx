'use client';

import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  feedback: string;
  icon: LucideIcon;
}

export default function ScoreCard({
  title,
  score,
  maxScore = 10,
  feedback,
  icon: Icon
}: ScoreCardProps) {
  
  const getScoreColor = (val: number) => {
    if (val >= 8) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25';
    if (val >= 5) return 'text-amber-500 bg-amber-500/10 border-amber-500/25';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/25';
  };

  return (
    <Card className="bg-card border-border flex flex-col justify-between overflow-hidden shadow-md">
      <div className="p-5 flex-1 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wider text-text-secondary">{title}</span>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Icon size={18} />
          </div>
        </div>

        {/* Score Ring / Value */}
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(score).split(' ')[0]}`}>
            {score}
          </span>
          <span className="text-text-muted text-sm font-semibold">/ {maxScore}</span>
        </div>

        {/* Short feedback text */}
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
          {feedback}
        </p>
      </div>
      
      {/* Bottom accent colored line */}
      <div className={`h-1.5 w-full bg-current ${getScoreColor(score).split(' ')[0]}`} />
    </Card>
  );
}
