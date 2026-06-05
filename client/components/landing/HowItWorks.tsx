'use client';

import { motion } from 'framer-motion';
import { Upload, Cpu, Mic, BarChart3, ChevronRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Upload Your Resume',
      description: 'Upload your PDF or DOCX file. Our secure parser extracts the plain text to understand your technical credentials.',
      icon: Upload,
    },
    {
      step: '02',
      title: 'AI Profile Analysis',
      description: 'LLaMA3 compiles your core skills, years of experience, domains, and past roles to build a candidate metadata map.',
      icon: Cpu,
    },
    {
      step: '03',
      title: 'Mock Interview Screen',
      description: 'Respond verbally to 5 tailored questions. Audio clips are transcribed in real-time by the Whisper speech engine.',
      icon: Mic,
    },
    {
      step: '04',
      title: 'Score Card & Feedback',
      description: 'Review overall rubrics, radar graphs, expected keyword checkmarks, alignment index levels, and resume repair advice.',
      icon: BarChart3,
    },
  ];

  return (
    <section className="py-20 bg-background border-t border-border/40" id="how-it-works">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">Workflow</span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-text-primary">
            How does it work?
          </h2>
          <p className="text-sm text-text-secondary">
            A simple 4-step workflow that goes from resume submission to complete skills diagnostics.
          </p>
        </div>

        {/* Timeline Stepper */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line for desktop */}
          <div className="hidden lg:block absolute top-[52px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-indigo-500/20 via-violet-500/30 to-indigo-500/20 z-0" />

          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex flex-col items-center text-center space-y-4 relative z-10"
              >
                {/* Icon bubble */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-card border border-border group hover:border-indigo-500/30 shadow-md transition-all duration-300">
                  <div className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow">
                    {item.step}
                  </div>
                  <Icon className="h-8 w-8 text-indigo-500 transition-transform duration-300 group-hover:scale-110" />
                </div>

                {/* Content */}
                <div className="space-y-1.5 max-w-[240px]">
                  <h3 className="text-base font-bold text-text-primary tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
