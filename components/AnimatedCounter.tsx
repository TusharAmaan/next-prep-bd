"use client";

import { useEffect, useState } from "react";

export default function AnimatedCounter({ 
  value, 
  suffix = "" 
}: { 
  value: number; 
  suffix?: string; 
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1200; // Smooth 1.2s count up animation

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function: easeOutQuad
      const easedPercentage = percentage * (2 - percentage);
      
      setCount(Math.floor(easedPercentage * value));

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{count}{suffix}</span>;
}
