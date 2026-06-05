'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ResumeTipsProps {
  tips: string[];
}

export default function ResumeTips({ tips }: ResumeTipsProps) {
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, x: -25 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  };

  // Enforce exactly 3 tips
  const tipsToDisplay = tips.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-indigo-500" />
        <h3 className="text-lg font-bold text-text-primary uppercase tracking-wider">How to Strengthen Your Resume</h3>
      </div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-50px' }}
        className="grid grid-cols-1 gap-4"
      >
        {tipsToDisplay.map((tip, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="bg-card border-border hover:border-indigo-500/20 transition-all duration-300 relative overflow-hidden">
              {/* Left indigo border accent */}
              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-indigo-500" />
              
              <CardContent className="p-5 pl-7 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                  <Lightbulb size={16} />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    Recommendation {index + 1}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-text-primary">
                    {tip}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
