'use client';

import { motion } from 'framer-motion';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col flex-1"
    >
      <Hero />
      <Features />
      <HowItWorks />
    </motion.div>
  );
}
