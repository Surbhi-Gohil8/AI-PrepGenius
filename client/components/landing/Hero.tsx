'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, FileText, ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  // Generate 15 floating particles with random positions & timings
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 4, // 4px to 10px
    x: Math.random() * 100, // percentage x-axis
    y: Math.random() * 100 + 100, // start below the screen
    duration: Math.random() * 12 + 8, // 8s to 20s
    delay: Math.random() * 5,
  }));

  return (
    <div className="relative overflow-hidden py-24 sm:py-32 flex flex-col items-center justify-center min-h-[85vh]">
      {/* Floating Particles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: '110vh', x: `${p.x}vw`, opacity: 0 }}
            animate={{
              y: '-10vh',
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear',
            }}
            style={{
              width: p.size,
              height: p.size,
            }}
            className="absolute rounded-full bg-indigo-500/25 blur-[1px]"
          />
        ))}
        {/* Large background glow circles */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-500/5 blur-[70px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center flex flex-col items-center space-y-8">
        {/* Badges row */}
        <div className="flex flex-wrap justify-center items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
          >
            <Zap size={12} className="fill-current" />
            Powered by Groq + LLaMA3
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20"
          >
            <FileText size={12} />
            Resume-Aware AI
          </motion.div>
        </div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl font-extrabold tracking-tight sm:text-6xl text-text-primary leading-[1.1] max-w-3xl"
        >
          Interviews Tailored to{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            YOUR Resume
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-lg sm:text-xl text-text-secondary max-w-2xl leading-relaxed font-medium"
        >
          Upload your resume, get AI-generated questions based on your actual projects and skills. No more generic questions.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center gap-4 pt-4"
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/interview">
              <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-bold px-8 shadow-xl hover:shadow-indigo-500/20 cursor-pointer gap-2 h-12">
                Upload Resume & Start
                <ArrowRight size={16} />
              </Button>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="border-border text-text-primary hover:bg-muted cursor-pointer gap-2 h-12 px-8">
                <Play size={14} className="fill-current text-indigo-500" />
                See How It Works
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
