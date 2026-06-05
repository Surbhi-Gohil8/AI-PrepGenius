'use client';

import { useState, useEffect } from 'react';

export function useCountUp(end: number, duration: number = 1000, decimals: number = 0): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = progress * end;
      setCount(Number(currentVal.toFixed(decimals)));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration, decimals]);

  return count;
}
