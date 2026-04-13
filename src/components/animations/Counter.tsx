"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface CounterProps {
  target: number;
  formatter?: (val: number) => string;
  duration?: number;
  delay?: number;
  className?: string;
}

export function Counter({
  target,
  formatter,
  duration = 1.2,
  delay = 0,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = formatter ?? ((v: number) => Math.round(v).toLocaleString("en-IN"));

  useEffect(() => {
    const proxy = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(proxy, {
        val: target,
        duration,
        delay,
        ease: "power2.out",
        onUpdate() {
          if (ref.current) ref.current.textContent = fmt(proxy.val);
        },
        onComplete() {
          if (ref.current) ref.current.textContent = fmt(target);
        },
      });
    });
    return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {fmt(0)}
    </span>
  );
}
