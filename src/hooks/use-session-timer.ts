"use client"

import { useEffect, useRef, useState } from 'react';
import { useToast } from "@/hooks/use-toast";

const SESSION_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export const useSessionTimer = (onTimeout: () => void) => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION_MS);
  const hasTimedOut = useRef(false);

  useEffect(() => {
    // 1. Get or Set the session start time in LocalStorage
    let sessionStartTime = localStorage.getItem('grillicious_session_start');
    
    if (!sessionStartTime) {
      sessionStartTime = Date.now().toString();
      localStorage.setItem('grillicious_session_start', sessionStartTime);
    }

    const startTime = parseInt(sessionStartTime);
    const endTime = startTime + SESSION_DURATION_MS;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        clearInterval(intervalId);
        setTimeLeft(0);
        
        if (!hasTimedOut.current) {
          hasTimedOut.current = true;
          handleExpiry();
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    const handleExpiry = () => {
      // Clear storage so the next QR scan starts fresh
      localStorage.removeItem('grillicious_session_start');
      
      toast({
        title: "Session Expired",
        description: "Your 10-minute session has ended. Redirecting...",
        variant: "destructive",
      });

      // Execute the provided cleanup (like clearing the cart)
      onTimeout();

      // Redirect to home/scan page
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    };

    return () => clearInterval(intervalId);
  }, [onTimeout, toast]);

  return { 
    timeLeft,
    minutesLeft: Math.floor(timeLeft / 60000),
    secondsLeft: Math.floor((timeLeft % 60000) / 1000)
  };
};