'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRecorder } from '@/hooks/useRecorder';
import { api } from '@/lib/api';
import { Session, GeneratedQuestion, Answer } from '@/types';
import QuestionCard from '@/components/interview/QuestionCard';
import RecordButton from '@/components/interview/RecordButton';
import TranscriptBox from '@/components/interview/TranscriptBox';
import TimerBar from '@/components/interview/TimerBar';
import FollowUpCard from '@/components/interview/FollowUpCard';
import ResumeContextSheet from '@/components/interview/ResumeContextSheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { CheckCircle, ChevronRight, Loader2, Sparkles } from 'lucide-react';

export default function LiveInterviewPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);
  
  // Follow up states
  const [followUpActive, setFollowUpActive] = useState(false);
  const [isAnsweringFollowUp, setIsAnsweringFollowUp] = useState(false);
  const [followUpTranscript, setFollowUpTranscript] = useState('');
  
  // Navigation states
  const [completedQuestions, setCompletedQuestions] = useState<Record<string, Answer>>({});
  const [isSubmittingFinish, setIsSubmittingFinish] = useState(false);
  const clearAudioRef = useRef<(() => void) | null>(null);

  const uploadAndScoreResponse = useCallback(async (blob: Blob) => {
    if (!session) return;
    setIsProcessing(true);

    const currentQuestion = session.generatedQuestions[currentIdx];
    const formData = new FormData();
    const fileExt = blob.type.split(';')[0].split('/')[1] || 'webm';
    formData.append('audio', blob, `response.${fileExt}`);
    formData.append('questionId', currentQuestion.id);
    formData.append('sessionId', session._id);

    try {
      const response = await api.post('/transcribe', formData);
      const parsedAnswer: Answer = response.data.answer;

      if (isAnsweringFollowUp) {
        setFollowUpTranscript(parsedAnswer.transcript);
        toast.success('Follow-up answer processed!');
        setIsAnsweringFollowUp(false);
      } else {
        setTranscriptText(parsedAnswer.transcript);
        setCurrentAnswer(parsedAnswer);
        setCompletedQuestions((prev) => ({
          ...prev,
          [currentQuestion.id]: parsedAnswer,
        }));

        if (parsedAnswer.followUpQuestion) {
          setFollowUpActive(true);
        }
        toast.success('Response processed!');
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'Error processing speech. Please try again.'));
      clearAudioRef.current?.();
    } finally {
      setIsProcessing(false);
    }
  }, [session, currentIdx, isAnsweringFollowUp]);

  const handleAudioReady = useCallback(
    (blob: Blob) => {
      void uploadAndScoreResponse(blob);
    },
    [uploadAndScoreResponse]
  );

  const { isRecording, recordingTime, startRecording, stopRecording, clearAudio } =
    useRecorder(handleAudioReady);

  useEffect(() => {
    clearAudioRef.current = clearAudio;
  }, [clearAudio]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    const fetchSession = async () => {
      try {
        const response = await api.get(`/interview/session/${sessionId}`);
        setSession(response.data);
        
        // Map existing answers if session is re-loaded
        const completed: Record<string, Answer> = {};
        response.data.answers.forEach((ans: Answer) => {
          completed[ans.questionId] = ans;
        });
        setCompletedQuestions(completed);

        // Set index to first unanswered question
        const unansweredIndex = response.data.generatedQuestions.findIndex(
          (q: GeneratedQuestion) => !completed[q.id]
        );
        if (unansweredIndex !== -1) {
          setCurrentIdx(unansweredIndex);
        } else {
          setCurrentIdx(response.data.generatedQuestions.length - 1);
        }
      } catch (err: unknown) {
        console.error('Failed to load session details:', err);
        toast.error(getApiErrorMessage(err, 'Session not found or access denied.'));
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSession();
    }
  }, [authLoading, isAuthenticated, sessionId, router]);

  const handleNextQuestion = () => {
    // Reset states
    clearAudio();
    setTranscriptText('');
    setCurrentAnswer(null);
    setFollowUpActive(false);
    setFollowUpTranscript('');
    setIsAnsweringFollowUp(false);

    if (currentIdx < 4) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleCompleteInterview = async () => {
    setIsSubmittingFinish(true);
    try {
      await api.post(`/interview/complete/${sessionId}`);
      toast.success('Interview evaluation complete!');
      router.push(`/results/${sessionId}`);
    } catch (err) {
      console.error('Failed to complete interview session:', err);
      toast.error('Failed to compile report. Please try again.');
      setIsSubmittingFinish(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          <span className="text-sm font-semibold text-text-secondary">Loading mock session environment...</span>
        </div>
      </div>
    );
  }

  if (!session || session.generatedQuestions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted">
        <span>No questions loaded.</span>
      </div>
    );
  }

  const currentQuestion = session.generatedQuestions[currentIdx];
  const hasAnsweredCurrent = !!completedQuestions[currentQuestion.id];
  const allAnswered = session.generatedQuestions.every(q => !!completedQuestions[q.id]);

  // Dots color helper
  const getDotColor = (qId: string, idx: number) => {
    const ans = completedQuestions[qId];
    if (idx === currentIdx) return 'ring-4 ring-indigo-500/30 border-indigo-500 bg-indigo-500/10 scale-110';
    if (!ans) return 'bg-muted border-border';
    
    // Colored by score: emerald >=8, amber >=5, red <5
    const score = ans.scores.overallScore;
    if (score >= 8) return 'bg-emerald-500 border-emerald-500';
    if (score >= 5) return 'bg-amber-500 border-amber-500';
    return 'bg-rose-500 border-rose-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col justify-between space-y-6"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-text-primary capitalize">{session.domain} Mock Session</h2>
          <p className="text-xs text-text-secondary uppercase font-semibold tracking-wider">
            Difficulty: {session.difficulty}
          </p>
        </div>

        {/* View Resume Context Button */}
        {user?.resumeData && (
          <ResumeContextSheet resumeData={user.resumeData} />
        )}
      </div>

      {/* Progress indicators dots */}
      <div className="flex justify-center items-center gap-3">
        {session.generatedQuestions.map((q, idx) => (
          <motion.div
            key={q.id}
            onClick={() => {
              // Only allow switching to already answered questions or current index
              if (completedQuestions[q.id] || idx === currentIdx || completedQuestions[session.generatedQuestions[idx - 1]?.id]) {
                setCurrentIdx(idx);
                // Reset follow up views
                setFollowUpActive(false);
                setFollowUpTranscript('');
                setIsAnsweringFollowUp(false);
                clearAudio();
              }
            }}
            whileHover={{ scale: 1.15 }}
            className={`h-6 w-6 rounded-full border-2 cursor-pointer flex items-center justify-center text-[10px] font-bold text-foreground transition-all duration-300 ${getDotColor(q.id, idx)}`}
          >
            {idx + 1}
          </motion.div>
        ))}
      </div>

      {/* Split Screen Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start flex-1 pt-4">
        {/* Left Column: Question Details */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <QuestionCard question={currentQuestion} index={currentIdx} />
          </AnimatePresence>

          {/* Follow Up Question Box */}
          {followUpActive && currentAnswer && (
            <AnimatePresence>
              <FollowUpCard
                followUpQuestion={currentAnswer.followUpQuestion}
                onAnswerClick={() => {
                  clearAudio();
                  setIsAnsweringFollowUp(true);
                  setFollowUpActive(false);
                  toast.info('Record your follow-up answer now!');
                }}
                onSkipClick={() => {
                  setFollowUpActive(false);
                  toast.info('Follow-up skipped. Proceeding to next question.');
                }}
              />
            </AnimatePresence>
          )}

          {/* Follow up answer transcript showing if answered */}
          {followUpTranscript && (
            <Card className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                <Sparkles size={11} /> Follow-up Transcript
              </span>
              <p className="font-mono text-xs text-text-primary mt-2 whitespace-pre-wrap">
                {followUpTranscript}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Voice Recorder & Transcripts */}
        <div className="space-y-6">
          <Card className="bg-card border-border shadow-lg">
            <CardContent className="p-6 flex flex-col items-center justify-center space-y-6">
              
              {/* Timer limit display */}
              {isRecording && (
                <div className="w-full">
                  <TimerBar time={recordingTime} maxTime={120} label={isAnsweringFollowUp ? 'Follow-up Limit' : 'Response Limit'} />
                </div>
              )}

              {/* Central Mic Record controller */}
              <RecordButton
                isRecording={isRecording}
                isProcessing={isProcessing}
                onStart={startRecording}
                onStop={stopRecording}
                disabled={hasAnsweredCurrent && !isAnsweringFollowUp}
              />
            </CardContent>
          </Card>

          {/* Monospace Transcript Preview Box */}
          <TranscriptBox
            transcript={isAnsweringFollowUp ? followUpTranscript : transcriptText || completedQuestions[currentQuestion.id]?.transcript || ''}
            isProcessing={isProcessing}
            isRecording={isRecording}
          />
        </div>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-end gap-4 border-t border-border/50 pt-6">
        {allAnswered && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleCompleteInterview}
              disabled={isSubmittingFinish}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 shadow-xl cursor-pointer gap-2 h-11"
            >
              {isSubmittingFinish ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Scorecard...
                </>
              ) : (
                <>
                  Finish & Calculate Results
                  <CheckCircle size={16} />
                </>
              )}
            </Button>
          </motion.div>
        )}

        {!allAnswered && hasAnsweredCurrent && !followUpActive && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleNextQuestion}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 cursor-pointer gap-2 h-11"
            >
              Next Question
              <ChevronRight size={16} />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
