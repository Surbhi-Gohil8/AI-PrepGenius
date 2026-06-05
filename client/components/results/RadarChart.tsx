'use client';

import React from 'react';
import { useIsClient } from '@/hooks/useIsClient';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RubricScores } from '@/types';

interface RadarChartProps {
  scores: RubricScores;
}

export default function RadarChart({ scores }: RadarChartProps) {
  const mounted = useIsClient();

  if (!mounted) {
    return (
      <Card className="bg-card border-border h-[350px] flex items-center justify-center">
        <span className="text-text-muted text-sm">Loading chart analytics...</span>
      </Card>
    );
  }

  const data = [
    { subject: 'Technical Accuracy', A: scores.technicalAccuracy, fullMark: 10 },
    { subject: 'Communication', A: scores.communicationClarity, fullMark: 10 },
    { subject: 'Problem Solving', A: scores.problemSolvingApproach, fullMark: 10 },
    { subject: 'Confidence', A: scores.confidenceAndStructure, fullMark: 10 }
  ];

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-secondary">Skills Assessment</CardTitle>
        <CardDescription className="text-xs text-text-muted">Breakdown across core competencies</CardDescription>
      </CardHeader>
      
      <CardContent className="h-[280px] p-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="var(--border)" strokeWidth={0.5} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'var(--foreground)', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name="Score"
              dataKey="A"
              stroke="#6366F1"
              fill="#6366F1"
              fillOpacity={0.25}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
