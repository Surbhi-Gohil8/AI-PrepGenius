'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Sparkles } from 'lucide-react';
import { Answer } from '@/types';

interface SuggestedAnswerPanelProps {
  answer: Answer;
}

export default function SuggestedAnswerPanel({ answer }: SuggestedAnswerPanelProps) {
  if (!answer.suggestedAnswer?.trim()) return null;

  return (
    <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-4 w-4 text-emerald-500" />
        <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Learn: Ideal Answer
        </h5>
        <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400 ml-auto">
          Study guide
        </Badge>
      </div>

      <Card className="bg-background/80 border-emerald-500/15">
        <ScrollArea className="max-h-48">
          <CardContent className="p-4 text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
            {answer.suggestedAnswer}
          </CardContent>
        </ScrollArea>
      </Card>

      {answer.keyPoints && answer.keyPoints.length > 0 && (
        <div className="space-y-2">
          <h6 className="text-[10px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1">
            <Sparkles size={12} className="text-emerald-500" />
            How to answer this way
          </h6>
          <ul className="space-y-1.5">
            {answer.keyPoints.map((point, i) => (
              <li key={i} className="text-xs text-text-secondary flex gap-2">
                <span className="text-emerald-500 font-bold shrink-0">{i + 1}.</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
