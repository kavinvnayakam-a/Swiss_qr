"use client"

import { Clock } from 'lucide-react';

export default function SessionTimer({ timeLeft }: { timeLeft: number }) {

  const formatTime = (timeMs: number) => {
    if (timeMs < 0) timeMs = 0;
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-md border-2 border-foreground bg-card px-3 py-1.5 text-foreground shadow-[2px_2px_0px_#000]">
      <Clock className="h-5 w-5" />
      <span className="text-lg font-mono tabular-nums">{formatTime(timeLeft)}</span>
    </div>
  );
}
