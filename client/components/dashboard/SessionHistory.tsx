'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Session } from '@/types';
import { ExternalLink, Calendar, Award, Zap, FileCheck2 } from 'lucide-react';

interface SessionHistoryProps {
  sessions: Session[];
}

export default function SessionHistory({ sessions }: SessionHistoryProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25';
    if (score >= 5) return 'text-amber-500 bg-amber-500/10 border-amber-500/25';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/25';
  };

  const getMatchColor = (match: number) => {
    if (match >= 70) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/25';
    if (match >= 40) return 'text-amber-500 bg-amber-500/10 border-amber-500/25';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/25';
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Easy':
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-secondary">Recent Sessions</CardTitle>
        <CardDescription className="text-xs text-text-muted">Review performance across your mock interview sessions</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-text-muted gap-2 text-sm min-h-[150px]">
            <span>You have no completed interview sessions yet.</span>
            <Link href="/interview">
              <Button size="sm" className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer">
                Start First Session
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-xs font-semibold uppercase tracking-wider text-text-muted bg-muted/20">
                  <th className="p-4 pl-6">Domain / Tech</th>
                  <th className="p-4">Difficulty</th>
                  <th className="p-4">Completed Date</th>
                  <th className="p-4 text-center">Score</th>
                  <th className="p-4 text-center">Resume Match</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-sm">
                {sessions.map((session) => (
                  <tr key={session._id} className="hover:bg-card/50 transition-colors duration-200">
                    <td className="p-4 pl-6 font-bold text-text-primary">
                      {session.domain}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={`py-0.5 px-2.5 rounded-full text-xs border ${getDifficultyColor(session.difficulty)}`}>
                        {session.difficulty}
                      </Badge>
                    </td>
                    <td className="p-4 text-text-secondary text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-text-muted" />
                        {new Date(session.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="outline" className={`py-0.5 px-2.5 rounded-full font-bold border ${getScoreColor(session.overallScore)}`}>
                        {session.overallScore} / 10
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="outline" className={`py-0.5 px-2.5 rounded-full font-bold border ${getMatchColor(session.resumeMatchScore)}`}>
                        {session.resumeMatchScore}%
                      </Badge>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                        <Link href={`/results/${session._id}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 cursor-pointer gap-1 text-xs">
                            View Report
                            <ExternalLink size={12} />
                          </Button>
                        </Link>
                      </motion.div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
