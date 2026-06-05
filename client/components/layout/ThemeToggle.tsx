'use client';

import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="w-9 h-9 rounded-full border border-border bg-card text-foreground cursor-pointer"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-warning" />
        ) : (
          <Moon className="h-4 w-4 text-primary" />
        )}
      </Button>
    </motion.div>
  );
}
