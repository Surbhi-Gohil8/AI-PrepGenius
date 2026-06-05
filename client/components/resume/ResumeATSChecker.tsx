'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Tag,
  XCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { ATSAnalysis } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCountUp } from '@/hooks/useCountUp';
import { toast } from 'sonner';

interface ResumeATSCheckerProps {
  targetRoleDefault?: string;
}

export default function ResumeATSChecker({ targetRoleDefault = '' }: ResumeATSCheckerProps) {
  const [targetRole, setTargetRole] = useState(targetRoleDefault);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);

  const animatedScore = useCountUp(analysis?.score ?? 0, 1000);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await api.post('/resume/ats-analyze', {
        targetRole: targetRole.trim() || undefined
      });
      setAnalysis(response.data.analysis);
      toast.success('ATS analysis complete');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'ATS analysis failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor =
    (analysis?.score ?? 0) >= 75
      ? 'text-emerald-500'
      : (analysis?.score ?? 0) >= 50
        ? 'text-amber-500'
        : 'text-rose-500';

  const severityStyle = (severity: string) => {
    if (severity === 'high') return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
    if (severity === 'low') return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
  };

  return (
    <Card className="bg-card border-border w-full max-w-2xl mx-auto">
      <CardHeader className="border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
            <FileSearch className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-text-primary">ATS Resume Checker</CardTitle>
            <CardDescription className="text-text-secondary text-xs">
              Scan for ATS compatibility, keywords, and improvement tips
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Target role (e.g. Mechanical Engineer, Biotech Researcher)"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="bg-background border-border flex-1"
          />
          <Button
            onClick={runAnalysis}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shrink-0 cursor-pointer gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {analysis && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5 pt-2"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="text-center sm:text-left shrink-0">
                  <p className="text-xs font-semibold uppercase text-text-muted mb-1">ATS Score</p>
                  <p className={`text-5xl font-extrabold tabular-nums ${scoreColor}`}>
                    {animatedScore}
                    <span className="text-2xl text-text-muted">/100</span>
                  </p>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{analysis.summary}</p>
              </div>

              {analysis.strengths.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-text-muted flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Strengths
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-text-primary flex gap-2">
                        <span className="text-emerald-500 shrink-0">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.issues.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-text-muted flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-amber-500" /> Issues Found
                  </h4>
                  <ul className="space-y-2">
                    {analysis.issues.map((issue, i) => (
                      <li
                        key={i}
                        className="text-sm flex flex-col sm:flex-row sm:items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border"
                      >
                        <Badge variant="outline" className={`text-[10px] uppercase shrink-0 ${severityStyle(issue.severity)}`}>
                          {issue.severity} · {issue.category}
                        </Badge>
                        <span className="text-text-secondary">{issue.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-text-muted flex items-center gap-1.5">
                    <Tag size={14} className="text-indigo-500" /> Keywords Found
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.keywordsFound.map((kw) => (
                      <Badge key={kw} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-text-muted flex items-center gap-1.5">
                    <XCircle size={14} className="text-rose-400" /> Missing Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.keywordsMissing.map((kw) => (
                      <Badge key={kw} variant="outline" className="border-rose-500/30 text-rose-400">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {analysis.improvements.length > 0 && (
                <div className="space-y-2 border-t border-border/50 pt-4">
                  <h4 className="text-xs font-bold uppercase text-text-muted flex items-center gap-1.5">
                    <Lightbulb size={14} className="text-indigo-500" /> How to Improve
                  </h4>
                  <ol className="space-y-2 list-decimal list-inside">
                    {analysis.improvements.map((tip, i) => (
                      <li key={i} className="text-sm text-text-primary leading-relaxed pl-1">
                        {tip}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
