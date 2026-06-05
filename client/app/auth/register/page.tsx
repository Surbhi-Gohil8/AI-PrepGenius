'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Loader2 } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/errors';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await register(name, email, password);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Registration failed. Email might be in use.'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
    >
      {/* Background glow circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-500/5 blur-[80px] pointer-events-none" />

      <Card className="w-full max-w-md bg-card border-border shadow-xl z-10">
        <CardHeader className="space-y-3 flex flex-col items-center pb-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-500">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-text-primary">Create an account</CardTitle>
            <CardDescription className="text-text-secondary text-sm">
              Sign up for resume-tailored practice interviews
            </CardDescription>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-danger text-sm py-3 px-4 rounded-lg">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="bg-background border-border text-foreground h-11 focus-visible:ring-indigo-500/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-background border-border text-foreground h-11 focus-visible:ring-indigo-500/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-background border-border text-foreground h-11 focus-visible:ring-indigo-500/50"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 border-t border-border/50 pt-6">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </motion.div>
            
            <p className="text-xs text-center text-text-secondary">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-indigo-500 hover:text-indigo-400">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
