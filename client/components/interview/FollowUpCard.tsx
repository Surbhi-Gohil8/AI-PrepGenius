'use client';

import { motion } from 'framer-motion';
import { Sparkles, Mic, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FollowUpCardProps {
  followUpQuestion: string;
  onAnswerClick: () => void;
  onSkipClick: () => void;
}

export default function FollowUpCard({
  followUpQuestion,
  onAnswerClick,
  onSkipClick
}: FollowUpCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full mt-6"
    >
      <Card className="bg-card border border-indigo-500/20 shadow-xl overflow-hidden relative">
        {/* Glow effect on border */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <CardTitle className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
            AI Follow-Up Question
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-lg font-medium text-text-primary italic leading-relaxed">
            &ldquo;{followUpQuestion}&rdquo;
          </p>
          <p className="text-xs text-text-secondary mt-3">
            Interviewer is drilling deeper into your previous response. Answering follow-ups counts as bonus marks!
          </p>
        </CardContent>

        <CardFooter className="flex gap-3 border-t border-border/50 pt-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={onAnswerClick}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer gap-2"
            >
              <Mic size={16} />
              Answer Follow-up
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant="ghost"
              onClick={onSkipClick}
              className="text-text-secondary hover:text-text-primary cursor-pointer border border-border gap-2"
            >
              Proceed to Next
              <ArrowRight size={16} />
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
