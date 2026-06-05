'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileSearch, Mic2, Brain, TrendingUp } from 'lucide-react';

export default function Features() {
  const featuresList = [
    {
      title: 'Resume-Based Questions',
      description: 'Our AI parses your resume to craft tailored technical questions, referencing your specific projects, stack, and experience.',
      icon: FileSearch,
      glow: 'group-hover:text-indigo-400 group-hover:bg-indigo-500/10',
    },
    {
      title: 'Voice-Powered Answers',
      description: 'Practice speak-answering naturally. We record your voice response and transcribe it with high fidelity using Whisper-large-v3.',
      icon: Mic2,
      glow: 'group-hover:text-violet-400 group-hover:bg-violet-500/10',
    },
    {
      title: 'AI Scoring Engine',
      description: 'Receive multi-rubric score assessments evaluating technical accuracy, communication clarity, problem-solving, and structure.',
      icon: Brain,
      glow: 'group-hover:text-pink-400 group-hover:bg-pink-500/10',
    },
    {
      title: 'Track Progress Logs',
      description: 'Visualize your trajectory over time on the user dashboard. Monitor average match rates and overall rating indices.',
      icon: TrendingUp,
      glow: 'group-hover:text-emerald-400 group-hover:bg-emerald-500/10',
    },
  ];

  const containerVariants: any = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section className="py-20 bg-background border-t border-border/40" id="features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Core Features</span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-text-primary">
            Next-Gen Interview Preparation
          </h2>
          <p className="text-sm text-text-secondary">
            Equipped with state-of-the-art AI systems to recreate actual technical screening procedures.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuresList.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div key={index} variants={cardVariants}>
                <Card className="premium-card bg-card border-border hover:border-indigo-500/20 group h-full transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
                  <CardHeader className="p-6 pb-2">
                    <div className={`inline-flex p-3 rounded-xl bg-muted text-text-secondary transition-colors duration-300 ${feat.glow} shrink-0 mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg font-bold text-text-primary tracking-tight">
                      {feat.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    <CardDescription className="text-text-secondary text-sm leading-relaxed">
                      {feat.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
