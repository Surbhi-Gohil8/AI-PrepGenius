'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlignLeft, MessageSquareCode } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TranscriptBoxProps {
  transcript: string;
  isProcessing: boolean;
  isRecording: boolean;
}

export default function TranscriptBox({
  transcript,
  isProcessing,
  isRecording
}: TranscriptBoxProps) {
  
  return (
    <Card className="bg-card border-border flex flex-col h-full min-h-[220px]">
      <CardHeader className="py-4 border-b border-border/50 flex flex-row items-center gap-2">
        <MessageSquareCode size={18} className="text-indigo-500" />
        <CardTitle className="text-sm font-bold text-text-primary uppercase tracking-wider">Your Transcript</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 relative">
        {isRecording && !transcript && (
          <div className="absolute inset-0 flex flex-col justify-center items-center text-text-muted gap-2 text-sm p-4">
            <AlignLeft className="animate-pulse text-indigo-500/60" size={24} />
            <span className="animate-pulse">Listening... start speaking your answer.</span>
          </div>
        )}

        {isProcessing && (
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-[90%] bg-muted" />
            <Skeleton className="h-4 w-[75%] bg-muted" />
            <Skeleton className="h-4 w-[85%] bg-muted" />
          </div>
        )}

        {!isRecording && !isProcessing && !transcript && (
          <div className="absolute inset-0 flex flex-col justify-center items-center text-text-muted text-sm p-4">
            <span>Your verbal response transcript will appear here.</span>
          </div>
        )}

        {transcript && (
          <ScrollArea className="h-[180px] p-4">
            <p className="font-mono text-sm leading-relaxed text-text-primary whitespace-pre-wrap">
              {transcript}
            </p>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
