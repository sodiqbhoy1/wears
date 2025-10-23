"use client";
import { useState, useEffect } from 'react';

export default function CountUpStats({ end, duration = 2000, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`count-${end}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [end]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Handle decimal numbers properly
      const currentValue = progress * end;
      setCount(end % 1 === 0 ? Math.floor(currentValue) : parseFloat(currentValue.toFixed(1)));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <div id={`count-${end}`} className="text-2xl md:text-3xl font-bold text-[var(--brand)]">
      {prefix}{count}{suffix}
    </div>
  );
}