'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import { Button } from '@/components/ui/button';
import { Brain, LayoutDashboard, PlusCircle, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-text-primary">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-500">
              <Brain className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              PrepGenius AI
            </span>
          </Link>

          {/* Navigation Links for Authenticated Users */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link href="/dashboard">
                <Button
                  variant={pathname === '/dashboard' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2 cursor-pointer"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Button>
              </Link>
              <Link href="/interview">
                <Button
                  variant={pathname.startsWith('/interview') ? 'secondary' : 'ghost'}
                  size="sm"
                  className="gap-2 cursor-pointer"
                >
                  <PlusCircle size={16} />
                  Start Interview
                </Button>
              </Link>
            </nav>
          )}
        </div>

        {/* Action buttons / Profile */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback className="bg-indigo-600 text-white font-semibold">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-text-primary">{user.name}</p>
                    <p className="text-xs leading-none text-text-secondary">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted focus:text-text-primary">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted focus:text-text-primary">
                  <Link href="/interview" className="flex items-center gap-2">
                    <PlusCircle size={14} />
                    <span>New Interview</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 text-danger focus:bg-danger/10 focus:text-danger cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="cursor-pointer">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
