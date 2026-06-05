'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Session } from '@/types';
import StatsCard from '@/components/dashboard/StatsCard';
import ScoreLineChart from '@/components/dashboard/ScoreLineChart';
import SessionHistory from '@/components/dashboard/SessionHistory';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Activity, TrendingUp, Target, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import ResumeATSChecker from '@/components/resume/ResumeATSChecker';

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await api.get('/interview/history');
        setSessions(response.data);
      } catch (err) {
        console.error('Failed to load session history:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchHistory();
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || historyLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <span className="text-sm font-semibold text-text-secondary">Loading your profile dashboard...</span>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalSessions = sessions.length;
  
  const avgScore = totalSessions > 0
    ? Number((sessions.reduce((acc, s) => acc + s.overallScore, 0) / totalSessions).toFixed(1))
    : 0;

  const avgMatchScore = totalSessions > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.resumeMatchScore, 0) / totalSessions)
    : 0;

  const bestScore = totalSessions > 0
    ? Math.max(...sessions.map((s) => s.overallScore))
    : 0;

  const hasResume = user?.resumeData !== null && user?.resumeData !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-8"
    >
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Welcome back, {user?.name}
          </h1>
          <p className="text-text-secondary text-sm">
            Track your performance indicators and resume alignment levels.
          </p>
        </div>
      </div>

      {/* Resume Status Warning Card if no resume uploaded */}
      {!hasResume && (
        <Alert variant="destructive" className="bg-amber-500/10 border-amber-500/25 text-amber-500 flex flex-col md:flex-row items-start md:items-center justify-between p-6 gap-4 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <AlertTitle className="font-bold text-sm text-text-primary">No resume uploaded yet</AlertTitle>
              <AlertDescription className="text-text-secondary text-xs mt-1">
                Upload your resume profile to activate personalized, resume-aware interview sessions. Without it, you cannot start practicing.
              </AlertDescription>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => router.push('/interview')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer gap-1.5 shrink-0 text-xs h-10 px-4"
            >
              Upload Now
              <ArrowRight size={14} />
            </Button>
          </motion.div>
        </Alert>
      )}

      {hasResume && (
        <ResumeATSChecker
          targetRoleDefault={user?.resumeData?.detectedDomains?.[0] || ''}
        />
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Practice Sessions"
          value={totalSessions}
          icon={Activity}
          description="Completed interview sessions logged in system"
        />
        
        <StatsCard
          title="Average Score"
          value={avgScore}
          decimals={1}
          suffix="/10"
          icon={TrendingUp}
          description="Average score across all completed sessions"
        />
        
        <StatsCard
          title="Average Match Rating"
          value={avgMatchScore}
          suffix="%"
          icon={Target}
          description="Alignment rating of verbal claims vs. resume profile"
        />
        
        <StatsCard
          title="Best Overall Rating"
          value={bestScore}
          decimals={1}
          suffix="/10"
          icon={Trophy}
          description="Your highest scored interview session so far"
        />
      </div>

      {/* Charts and History grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress chart */}
        <div className="lg:col-span-1">
          <ScoreLineChart sessions={sessions} />
        </div>
        
        {/* Recent sessions log */}
        <div className="lg:col-span-2">
          <SessionHistory sessions={sessions} />
        </div>
      </div>
    </motion.div>
  );
}
