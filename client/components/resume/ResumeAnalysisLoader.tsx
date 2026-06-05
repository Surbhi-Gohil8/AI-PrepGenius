'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

interface ResumeAnalysisLoaderProps {
  onFinished?: () => void;
  title?: string;
}

export default function ResumeAnalysisLoader({ onFinished, title = 'AI Profile Analysis' }: ResumeAnalysisLoaderProps) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Extracting resume content...',
    'Identifying your technical skills...',
    'Detecting experience level...',
    'Generating tailored interview questions...'
  ];

  useEffect(() => {
    const intervals = [800, 1600, 2400, 3200];
    const timers = intervals.map((delay, index) => {
      return setTimeout(() => {
        setActiveStep(index + 1);
        if (index === steps.length - 1 && onFinished) {
          setTimeout(onFinished, 800); // Trigger finish callback after last check
        }
      }, delay);
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [steps.length, onFinished]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-2xl max-w-md mx-auto shadow-xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500 mb-6">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
      
      <h3 className="text-xl font-bold text-text-primary mb-2 bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-sm text-text-secondary text-center mb-8">
        Analyzing your background to personalize the session. This will take a few seconds.
      </p>

      <div className="w-full space-y-4">
        {steps.map((step, idx) => {
          const isCompleted = activeStep > idx;
          const isActive = activeStep === idx;
          const isUpcoming = activeStep < idx;

          return (
            <AnimatePresence key={idx}>
              {activeStep >= idx && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-3 text-sm text-left"
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    >
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    </motion.div>
                  ) : isActive ? (
                    <Loader2 size={18} className="text-indigo-500 animate-spin shrink-0" />
                  ) : (
                    <Circle size={18} className="text-text-muted shrink-0" />
                  )}
                  
                  <span
                    className={`font-medium transition-colors duration-300 ${
                      isCompleted
                        ? 'text-emerald-500'
                        : isActive
                        ? 'text-text-primary font-semibold'
                        : 'text-text-muted'
                    }`}
                  >
                    {step}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
}
