import { useState, useEffect, useCallback, useRef } from 'react';

// Define types for timer IDs to handle both browser and Node environments
type TimeoutID = ReturnType<typeof window.setTimeout>;
type IntervalID = ReturnType<typeof window.setInterval>;

interface UseInactivityTimerProps {
  onTimeout: () => void;
  enabled?: boolean;
  timeout?: number; 
  warningTime?: number;
}

export const useInactivityTimer = ({
  onTimeout,
  enabled = true,
  timeout = 300000, 
  warningTime = 60000, 
}: UseInactivityTimerProps) => {
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [countdown, setCountdown] = useState(warningTime / 1000);
  
  const timer = useRef<TimeoutID>();
  const warningTimer = useRef<TimeoutID>();
  const countdownInterval = useRef<IntervalID>();

  const clearAllTimers = useCallback(() => {
    if (timer.current !== undefined) window.clearTimeout(timer.current);
    if (warningTimer.current !== undefined) window.clearTimeout(warningTimer.current);
    if (countdownInterval.current !== undefined) window.clearInterval(countdownInterval.current);
    setIsWarningVisible(false);
  }, []);

  const resetTimers = useCallback(() => {
    clearAllTimers();
    
    if (!enabled) return;

    setCountdown(warningTime / 1000);

    warningTimer.current = window.setTimeout(() => {
      setIsWarningVisible(true);
      countdownInterval.current = window.setInterval(() => {
        setCountdown((prev) => prev > 0 ? prev - 1 : 0);
      }, 1000);
    }, timeout - warningTime);

    timer.current = window.setTimeout(() => {
      if (countdownInterval.current !== undefined) window.clearInterval(countdownInterval.current);
      onTimeout();
    }, timeout);
  }, [onTimeout, timeout, warningTime, enabled, clearAllTimers]);
  
  const handleStay = () => {
    resetTimers();
  };

  useEffect(() => {
    if (enabled) {
      const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
      
      const eventHandler = () => {
        resetTimers();
      };

      events.forEach((event) => {
        window.addEventListener(event, eventHandler);
      });

      resetTimers(); // Initial start

      return () => {
        events.forEach((event) => {
          window.removeEventListener(event, eventHandler);
        });
        clearAllTimers();
      };
    } else {
      clearAllTimers();
    }
  }, [enabled, resetTimers, clearAllTimers]);

  return { isWarningVisible, handleStay, countdown };
};
