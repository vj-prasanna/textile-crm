"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  y?: number;
}

export function StaggerList({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  y = 16,
}: StaggerListProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.children.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current!.children, {
        opacity: 0,
        y,
        duration: 0.5,
        stagger,
        delay,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });
    }, ref);
    return () => ctx.revert();
  }, [stagger, delay, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
