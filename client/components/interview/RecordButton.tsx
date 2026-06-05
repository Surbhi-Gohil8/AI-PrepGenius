'use client';

import { motion } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export default function RecordButton({
  isRecording,
  isProcessing,
  onStart,
  onStop,
  disabled = false
}: RecordButtonProps) {
  
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Concentric Pulse Rings while recording */}
      {isRecording && (
        <>
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-24 w-24 rounded-full bg-indigo-500/20 border border-indigo-500/30"
          />
          <motion.div
            animate={{ scale: [1, 2.0, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 1.8, delay: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-24 w-24 rounded-full bg-violet-500/10 border border-violet-500/25"
          />
          <motion.div
            animate={{ scale: [1, 2.4, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 1.8, delay: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute h-24 w-24 rounded-full bg-indigo-500/5 border border-indigo-500/10"
          />
        </>
      )}

      {/* Main Record Button */}
      <motion.div
        whileHover={!disabled && !isProcessing ? { scale: 1.05 } : {}}
        whileTap={!disabled && !isProcessing ? { scale: 0.95 } : {}}
        className="z-10"
      >
        <Button
          type="button"
          disabled={disabled || isProcessing}
          onClick={isRecording ? onStop : onStart}
          className={`h-20 w-20 rounded-full flex items-center justify-center shadow-lg cursor-pointer ${
            isRecording
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          } disabled:bg-muted disabled:text-text-muted border border-border/50`}
        >
          {isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isRecording ? (
            <Square className="h-8 w-8 fill-current" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </motion.div>
      
      <span className="text-xs font-semibold tracking-wide uppercase text-text-secondary mt-4">
        {isProcessing ? 'Processing Audio...' : isRecording ? 'Click to Submit' : 'Click to Speak'}
      </span>
    </div>
  );
}
