'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Session } from '@/types';
import ScoreCard from '@/components/results/ScoreCard';
import RadarChart from '@/components/results/RadarChart';
import FeedbackAccordion from '@/components/results/FeedbackAccordion';
import ResumeMatchScore from '@/components/results/ResumeMatchScore';
import ResumeTips from '@/components/results/ResumeTips';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCountUp } from '@/hooks/useCountUp';
import {
  Award,
  BookOpen,
  Brain,
  Code2,
  Download,
  LayoutDashboard,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Trophy,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function ResultsPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await api.get(`/interview/session/${sessionId}`);
        
        // Force complete just in case they navigated manually
        if (response.data.status === 'ongoing') {
          const completeRes = await api.post(`/interview/complete/${sessionId}`);
          setSession(completeRes.data);
        } else {
          setSession(response.data);
        }
      } catch (err: any) {
        console.error('Failed to fetch session results:', err);
        toast.error('Results session not found.');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSession();
    }
  }, [authLoading, isAuthenticated, sessionId, router]);

  const animatedOverall = useCountUp(session?.overallScore || 0, 1000, 1);

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <span className="text-sm font-semibold text-text-secondary">Generating evaluation scorecard...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted">
        <span>Evaluation data not found.</span>
      </div>
    );
  }

  // Calculate averaged rubrics for display
  const totalAnswers = session.answers.length;
  const avgRubrics = {
    technicalAccuracy: totalAnswers > 0
      ? Number((session.answers.reduce((acc, a) => acc + a.scores.technicalAccuracy, 0) / totalAnswers).toFixed(1))
      : 0,
    communicationClarity: totalAnswers > 0
      ? Number((session.answers.reduce((acc, a) => acc + a.scores.communicationClarity, 0) / totalAnswers).toFixed(1))
      : 0,
    problemSolvingApproach: totalAnswers > 0
      ? Number((session.answers.reduce((acc, a) => acc + a.scores.problemSolvingApproach, 0) / totalAnswers).toFixed(1))
      : 0,
    confidenceAndStructure: totalAnswers > 0
      ? Number((session.answers.reduce((acc, a) => acc + a.scores.confidenceAndStructure, 0) / totalAnswers).toFixed(1))
      : 0,
    overallScore: session.overallScore
  };

  const getOverallColor = (val: number) => {
    if (val >= 8) return 'text-emerald-500 border-emerald-500/30';
    if (val >= 5) return 'text-amber-500 border-amber-500/30';
    return 'text-rose-500 border-rose-500/30';
  };

  const staggerContainer = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-10"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Interview Performance Report</h1>
          <p className="text-sm text-text-secondary">
            Diagnostics for your {session.domain} session.
          </p>
        </div>
        
        {/* Actions header bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/interview">
            <Button variant="outline" size="sm" className="border-border text-text-secondary hover:text-text-primary gap-1.5 cursor-pointer text-xs">
              <RefreshCw size={14} />
              Try Again
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 cursor-pointer text-xs">
              <LayoutDashboard size={14} />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid: Overall Score Ring & Resume Match Index */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Overall Score Circle Card */}
        <Card className="bg-card border-border flex flex-col justify-center items-center p-6 text-center shadow-md">
          <CardContent className="p-0 flex flex-col items-center justify-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Overall Evaluation Score</span>
            
            {/* SVG Progress Ring */}
            <div className="relative flex items-center justify-center h-40 w-40">
              <svg className="transform -rotate-90 w-full h-full">
                <circle cx="80" cy="80" r="64" className="stroke-muted" strokeWidth="10" fill="transparent" />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="64"
                  className={session.overallScore >= 8 ? 'stroke-emerald-500' : session.overallScore >= 5 ? 'stroke-amber-500' : 'stroke-rose-500'}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 64}
                  initial={{ strokeDashoffset: 2 * Math.PI * 64 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 64) - (session.overallScore / 10) * (2 * Math.PI * 64) }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-4xl font-extrabold tracking-tight ${getOverallColor(session.overallScore).split(' ')[0]}`}>
                  {animatedOverall}
                </span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">/ 10 Rating</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/5 text-indigo-400 border border-indigo-500/20">
              <Trophy size={12} className="fill-current text-indigo-400" />
              Evaluation complete
            </div>
          </CardContent>
        </Card>

        {/* Resume Match Score Widget */}
        <div className="lg:col-span-2">
          <ResumeMatchScore score={session.resumeMatchScore} analysis={session.resumeMatchAnalysis} />
        </div>
      </div>

      {/* Grid: Rubrics Cards & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* 4 Rubric Cards list */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <motion.div variants={staggerItem}>
            <ScoreCard
              title="Technical Accuracy"
              score={avgRubrics.technicalAccuracy}
              icon={Code2}
              feedback="Measures the depth, terminology correctness, stack specifications, and error-handling clarity in answers."
            />
          </motion.div>
          
          <motion.div variants={staggerItem}>
            <ScoreCard
              title="Problem Solving Approach"
              score={avgRubrics.problemSolvingApproach}
              icon={Brain}
              feedback="Measures structural reasoning, trade-off comparisons, scaling constraints, and data flows."
            />
          </motion.div>
          
          <motion.div variants={staggerItem}>
            <ScoreCard
              title="Communication Clarity"
              score={avgRubrics.communicationClarity}
              icon={MessageSquare}
              feedback="Measures logical ordering of terms, articulation cadence, pacing, and explanatory brevity."
            />
          </motion.div>
          
          <motion.div variants={staggerItem}>
            <ScoreCard
              title="Confidence & Structure"
              score={avgRubrics.confidenceAndStructure}
              icon={Award}
              feedback="Measures professional tone, verbal assertions, vocabulary command, and logical delivery formats."
            />
          </motion.div>
        </motion.div>

        {/* Radar Chart competencies view */}
        <div className="lg:col-span-1 h-full">
          <RadarChart scores={avgRubrics} />
        </div>
      </div>

      {/* Accordion List: Question Breakdown */}
      <FeedbackAccordion
        answers={session.answers}
        sessionId={session._id}
        onSessionUpdate={setSession}
      />

      {/* Resume Tips Coaching section */}
      <ResumeTips tips={session.resumeTips} />

      {/* Bottom Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 border-t border-border/50">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
          <Link href="/interview">
            <Button className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold h-11 px-8 cursor-pointer gap-2 shadow-xl">
              <RefreshCw size={16} />
              Try Again with Same Resume
            </Button>
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full border-border text-text-primary hover:bg-muted cursor-pointer h-11 px-8 gap-2">
              <LayoutDashboard size={16} />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
          <Button
            variant="ghost"
            className="w-full text-text-muted hover:text-text-secondary cursor-pointer h-11 px-8 gap-2"
            onClick={() => toast.info('Results download placeholder clicked. Report saved in history.')}
          >
            <Download size={16} />
            Download Results Report
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
