"use client";

import { useEffect, useRef } from "react";

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function segment(progress: number, start: number, end: number) {
  return clamp((progress - start) / (end - start));
}

export function easeOut(value: number) {
  return 1 - (1 - value) ** 3;
}

export function useScrollScene<T extends HTMLElement>(disabled: boolean, frame: (progress: number, element: T) => void) {
  const elementRef = useRef<T>(null);
  const frameRef = useRef(frame);

  useEffect(() => {
    frameRef.current = frame;
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (disabled || reduceMotion) {
      frameRef.current(1, element);
      return;
    }

    let animationFrame = 0;
    let lastProgress = -1;

    const paint = () => {
      const bounds = element.getBoundingClientRect();
      const track = Math.max(1, bounds.height - window.innerHeight);
      const progress = clamp(-bounds.top / track);
      if (progress !== lastProgress) {
        lastProgress = progress;
        frameRef.current(progress, element);
      }
    };

    const loop = () => {
      paint();
      animationFrame = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !animationFrame) animationFrame = requestAnimationFrame(loop);
      if (!entry?.isIntersecting && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    }, { rootMargin: "50% 0px" });

    paint();
    observer.observe(element);
    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [disabled]);

  return elementRef;
}
