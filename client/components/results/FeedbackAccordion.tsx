'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Answer, Session } from '@/types';
import { BookOpen, Award, MessageSquare, AlertCircle, GraduationCap, Loader2 } from 'lucide-react';
import SuggestedAnswerPanel from '@/components/results/SuggestedAnswerPanel';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface FeedbackAccordionProps {
  answers: Answer[];
  sessionId?: string;
  onSessionUpdate?: (session: Session) => void;
}

export default function FeedbackAccordion({ answers, sessionId, onSessionUpdate }: FeedbackAccordionProps) {
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const hasAllSuggestions = answers.length > 0 && answers.every((a) => a.suggestedAnswer?.trim());

  const loadSuggestions = async () => {
    if (!sessionId) return;
    setLoadingSuggestions(true);
    try {
      const response = await api.post(`/interview/session/${sessionId}/suggested-answers`);
      onSessionUpdate?.(response.data);
      toast.success('Ideal answers ready — expand each question to study.');
    } catch {
      toast.error('Could not generate ideal answers. Try again.');
    } finally {
      setLoadingSuggestions(false);
    }
  };
  const getScoreColor = (val: number) => {
    if (val >= 8) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25';
    if (val >= 5) return 'text-amber-500 bg-amber-500/10 border-amber-500/25';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/25';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary uppercase tracking-wider">Detailed Q&A Breakdown</h3>
        {sessionId && !hasAllSuggestions && (
          <Button
            size="sm"
            variant="outline"
            disabled={loadingSuggestions}
            onClick={loadSuggestions}
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer gap-2 shrink-0"
          >
            {loadingSuggestions ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GraduationCap className="h-4 w-4" />
            )}
            {loadingSuggestions ? 'Generating...' : 'Get ideal answers to learn'}
          </Button>
        )}
      </div>

      {hasAllSuggestions && (
        <p className="text-xs text-emerald-400/90 flex items-center gap-1.5">
          <GraduationCap size={14} />
          Expand each question to compare your answer with the suggested response.
        </p>
      )}
      
      <Accordion type="single" collapsible className="w-full space-y-3">
        {answers.map((ans, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="border border-border bg-card rounded-xl overflow-hidden px-4 py-1"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-left w-[95%] gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    Question {index + 1}
                  </span>
                  <h4 className="text-base font-bold text-text-primary pr-2 leading-relaxed">
                    {ans.question}
                  </h4>
                  {ans.context && (
                    <Badge variant="outline" className="py-0.5 px-2 bg-indigo-500/5 text-indigo-400 border-indigo-500/20 text-xxs font-medium rounded-full mt-1 inline-flex items-center gap-1">
                      <BookOpen size={10} />
                      {ans.context}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-text-secondary">Score:</span>
                  <Badge variant="outline" className={`py-1 px-3 text-sm font-bold border rounded-full ${getScoreColor(ans.scores.overallScore)}`}>
                    {ans.scores.overallScore}/10
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="pt-2 pb-6 space-y-6 border-t border-border/50">
              {/* Monospace Verbatim Transcript */}
              <div className="space-y-2 mt-4">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-indigo-400" /> Your Response Verbatim
                </h5>
                <Card className="bg-background border-border/50 overflow-hidden">
                  <ScrollArea className="h-28">
                    <CardContent className="p-4 font-mono text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
                      {ans.transcript || 'No verbal response recorded.'}
                    </CardContent>
                  </ScrollArea>
                </Card>
              </div>

              <SuggestedAnswerPanel answer={ans} />

              {/* Follow-up question if generated */}
              {ans.followUpQuestion && (
                <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-lg flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Interviewer Follow-up Question</h5>
                    <p className="text-sm text-text-primary font-medium italic mt-1">
                      &ldquo;{ans.followUpQuestion}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Rubric Breakdowns */}
              <div className="space-y-3 pt-2">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <Award size={13} className="text-indigo-400" /> Rubric Feedback
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tech Accuracy */}
                  <div className="p-4 border border-border/50 bg-background rounded-lg space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-text-primary">Technical Accuracy</span>
                      <span className={`text-sm font-bold ${getScoreColor(ans.scores.technicalAccuracy).split(' ')[0]}`}>
                        {ans.scores.technicalAccuracy}/10
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed pt-1">
                      {ans.feedback.technicalAccuracy}
                    </p>
                  </div>

                  {/* Problem Solving */}
                  <div className="p-4 border border-border/50 bg-background rounded-lg space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-text-primary">Problem Solving</span>
                      <span className={`text-sm font-bold ${getScoreColor(ans.scores.problemSolvingApproach).split(' ')[0]}`}>
                        {ans.scores.problemSolvingApproach}/10
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed pt-1">
                      {ans.feedback.problemSolvingApproach}
                    </p>
                  </div>

                  {/* Communication */}
                  <div className="p-4 border border-border/50 bg-background rounded-lg space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-text-primary">Communication</span>
                      <span className={`text-sm font-bold ${getScoreColor(ans.scores.communicationClarity).split(' ')[0]}`}>
                        {ans.scores.communicationClarity}/10
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed pt-1">
                      {ans.feedback.communicationClarity}
                    </p>
                  </div>

                  {/* Confidence / Structure */}
                  <div className="p-4 border border-border/50 bg-background rounded-lg space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-text-primary">Confidence & Structure</span>
                      <span className={`text-sm font-bold ${getScoreColor(ans.scores.confidenceAndStructure).split(' ')[0]}`}>
                        {ans.scores.confidenceAndStructure}/10
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed pt-1">
                      {ans.feedback.confidenceAndStructure}
                    </p>
                  </div>
                </div>

                {/* Overall Summary */}
                <div className="p-4 border border-border/60 bg-muted/30 rounded-lg">
                  <h6 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Summary Evaluation</h6>
                  <p className="text-sm text-text-primary leading-relaxed mt-1">
                    {ans.feedback.summary}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
