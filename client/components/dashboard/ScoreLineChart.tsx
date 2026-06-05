'use client';

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Session } from '@/types';

interface ScoreLineChartProps {
  sessions: Session[];
}

export default function ScoreLineChart({ sessions }: ScoreLineChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="bg-card border-border h-[350px] flex items-center justify-center">
        <span className="text-text-muted text-sm">Loading performance chart...</span>
      </Card>
    );
  }

  // Take the last 10 sessions, reverse to show chronological order (oldest first)
  const chartData = [...sessions]
    .slice(0, 10)
    .reverse()
    .map((session, index) => ({
      name: `Session ${index + 1}`,
      score: session.overallScore,
      match: session.resumeMatchScore,
      date: new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-secondary">Progress Trajectory</CardTitle>
        <CardDescription className="text-xs text-text-muted">Track score gains over your last 10 sessions</CardDescription>
      </CardHeader>
      
      <CardContent className="h-[260px] p-2 flex items-center justify-center">
        {chartData.length === 0 ? (
          <span className="text-text-muted text-sm text-center">Complete an interview session to unlock charts</span>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeWidth={0.5} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 12
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                name="Overall Score"
                stroke="#6366F1"
                strokeWidth={3}
                activeDot={{ r: 6 }}
                dot={{ stroke: '#6366F1', strokeWidth: 2, r: 3, fill: 'var(--card)' }}
              />
              <Line
                type="monotone"
                dataKey="match"
                name="Resume Match %"
                stroke="#8B5CF6"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
