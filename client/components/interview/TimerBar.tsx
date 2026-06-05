'use client';

import { motion } from 'framer-motion';

interface TimerBarProps {
  time: number;
  maxTime?: number;
  label?: string;
}

export default function TimerBar({ time, maxTime = 120, label = 'Response Limit' }: TimerBarProps) {
  const percentage = Math.min((time / maxTime) * 100, 100);
  const isRunningOut = maxTime - time <= 15; // Warn user at 15s remaining

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
        <span className="text-text-secondary">{label}</span>
        <span className={`transition-colors duration-300 ${isRunningOut ? 'text-danger animate-pulse font-bold' : 'text-text-secondary'}`}>
          {formatTime(time)} / {formatTime(maxTime)}
        </span>
      </div>

      <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/10">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isRunningOut
              ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
              : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
          }`}
        />
      </div>
    </div>
  );
}
