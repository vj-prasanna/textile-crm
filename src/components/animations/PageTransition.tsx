"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y: 10,
        duration: 0.4,
        ease: "power2.out",
        clearProps: "opacity,y",
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className} style={{ minHeight: "100%" }}>
      {children}
    </div>
  );
}
