'use client';

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';

interface StatsCardProps {
  title: string;
  value: number;
  decimals?: number;
  suffix?: string;
  icon: LucideIcon;
  description: string;
}

export default function StatsCard({
  title,
  value,
  decimals = 0,
  suffix = '',
  icon: Icon,
  description
}: StatsCardProps) {
  const animatedValue = useCountUp(value, 1000, decimals);

  return (
    <Card className="bg-card border-border hover:border-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
      <CardContent className="p-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">{title}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {animatedValue}
              {suffix}
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
          <Icon size={20} />
        </div>
      </CardContent>
    </Card>
  );
}
