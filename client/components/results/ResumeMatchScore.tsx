'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, FileCheck2, Info } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

interface ResumeMatchScoreProps {
  score: number;
  analysis: string;
}

export default function ResumeMatchScore({ score, analysis }: ResumeMatchScoreProps) {
  const animatedScore = useCountUp(score, 1200);

  const getColorClass = (val: number) => {
    if (val >= 70) return 'text-emerald-500 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (val >= 40) return 'text-amber-500 stroke-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 stroke-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  const getTrackColorClass = () => {
    return 'stroke-muted';
  };

  // SVG parameters
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="premium-card bg-card border-border shadow-lg">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-500">
            <FileCheck2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-text-primary">Resume Match Rating</CardTitle>
            <CardDescription className="text-text-secondary text-xs">Verifying verbal claims vs. declared credentials</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* SVG Gauge */}
          <div className="relative flex items-center justify-center h-32 w-32 shrink-0">
            <svg className="transform -rotate-90 w-full h-full">
              {/* Back track */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className={getTrackColorClass()}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Animated Progress Circle */}
              <motion.circle
                cx="64"
                cy="64"
                r={radius}
                className={getColorClass(score).split(' ')[1]} // Get stroke-color
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-3xl font-extrabold tracking-tight ${getColorClass(score).split(' ')[0]}`}>
                {animatedScore}%
              </span>
              <span className="text-[10px] uppercase font-bold text-text-muted">Match</span>
            </div>
          </div>

          {/* Description & analysis text */}
          <div className="flex-1 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/5 text-indigo-400 border border-indigo-500/20">
              <Sparkles size={12} />
              AI Alignment Review
            </div>
            
            <p className="text-sm leading-relaxed text-text-primary">
              {analysis || 'Analyzing response alignments with resume claims...'}
            </p>
            
            <div className="flex items-start gap-2 bg-muted/30 p-3 rounded-lg border border-border/30 text-xs text-text-secondary">
              <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Match Rating measures technical coherence. Fluency, keyword depth, and reference to declared projects in answers are compared with resume claims.
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
