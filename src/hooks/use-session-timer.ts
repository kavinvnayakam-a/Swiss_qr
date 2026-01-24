"use client"

import { useEffect, useRef, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

const SESSION_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export const useSessionTimer = (
  onTimeout: () => void,
) => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION_MS);
  const timeoutId = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const sessionEndTime = Date.now() + SESSION_DURATION_MS;

    const intervalId = setInterval(() => {
        const remaining = sessionEndTime - Date.now();
        setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    timeoutId.current = setTimeout(() => {
      toast({
        title: "Session Expired",
        description: "Your 10-minute session has ended. Your cart has been cleared.",
        variant: "destructive",
        duration: 5000,
      });
      onTimeout();
      setTimeout(() => {
        window.location.href = '/';
      }, 5000);
    }, SESSION_DURATION_MS);

    return () => {
        clearInterval(intervalId);
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }
    };

  }, [onTimeout, toast]);

  return { timeLeft };
};
