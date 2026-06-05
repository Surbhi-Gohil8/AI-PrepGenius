import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PrepGenius AI',
  description: 'Upload your resume and practice mock interviews with real-time audio transcripts, feedback, scores, and questions custom-tailored to your experience and projects.',
  keywords: ['PrepGenius AI', 'AI Mock Interview', 'Resume Parser', 'Interview Prep', 'Whisper Speech to Text'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-primary/30">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <TooltipProvider>
              <Navbar />
              <main className="flex-1 flex flex-col">
                {children}
              </main>
              <Toaster position="top-right" theme="dark" closeButton />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
