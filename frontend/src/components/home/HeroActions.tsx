'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, LayoutDashboard, Sparkles } from 'lucide-react';

const baseBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-700';

export default function HeroActions() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="mt-10 flex justify-center">
        <div className="h-12 w-48 animate-pulse rounded-xl bg-white/20" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <p className="text-sm text-primary-100 sm:mr-2">
          Welcome back, <span className="font-semibold text-white">{user?.name?.split(' ')[0]}</span>
        </p>
        <Link
          href="/dashboard"
          className={`${baseBtn} bg-white px-8 py-3.5 text-base text-primary-700 shadow-lg shadow-primary-900/30 hover:bg-primary-50 hover:shadow-xl focus:ring-white`}
        >
          <LayoutDashboard className="h-5 w-5" />
          Go to Dashboard
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <Link
        href="/register"
        className={`${baseBtn} bg-white px-8 py-3.5 text-base text-primary-700 shadow-lg shadow-primary-900/30 hover:bg-primary-50 hover:shadow-xl focus:ring-white`}
      >
        <Sparkles className="h-5 w-5" />
        Start Planning Free
        <ArrowRight className="h-5 w-5" />
      </Link>
      <Link
        href="/login"
        className={`${baseBtn} border-2 border-white/40 bg-white/10 px-8 py-3.5 text-base text-white backdrop-blur-sm hover:border-white/70 hover:bg-white/20 focus:ring-white/50`}
      >
        Sign In
      </Link>
    </div>
  );
}
