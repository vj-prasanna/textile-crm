"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = 0.55, y = 18, className }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y,
        duration,
        delay,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });
    }, ref);
    return () => ctx.revert();
  }, [delay, duration, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
