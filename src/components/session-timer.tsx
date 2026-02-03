"use client"

import { Clock } from 'lucide-react';

export default function SessionTimer({ timeLeft }: { timeLeft: number }) {

  const formatTime = (timeMs: number) => {
    if (timeMs < 0) timeMs = 0;
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return {
      display: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      isUrgent: minutes < 2 // Visual cue for last 2 minutes
    };
  };

  const { display, isUrgent } = formatTime(timeLeft);

  return (
    <div className="flex items-center gap-1.5 transition-all">
      <Clock 
        className={`h-3.5 w-3.5 ${isUrgent ? 'text-red-500 animate-pulse' : 'text-white'}`} 
      />
      <span className={`
        text-sm font-black tabular-nums tracking-wider
        ${isUrgent ? 'text-red-500' : 'text-white'}
      `}>
        {display}
      </span>
    </div>
  );
}
