"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n/use-i18n";
import styles from "./crore-grid.module.css";

const CRORES = 140;
const dots = Array.from({ length: CRORES }, (_, index) => index);
const PHASES = 9;

/** A fixed sprinkle so the three colours look scattered rather than striped. */
function baseColour(index: number) {
  return (Math.imul(index + 1, 2654435761) >>> 27) % 3;
}

/**
 * 1.4 billion people as 140 dots of one crore each. They fill in one by one
 * when the grid enters the viewport, then trade colours as the reader scrolls
 * past, so the figure stays alive without asking for attention.
 */
export function CroreGrid() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cells = Array.from(element.children) as HTMLElement[];
    let phase = -1;
    let frame = 0;
    let visible = false;

    const paint = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)));
      const next = Math.floor(progress * PHASES);
      if (next === phase) return;
      phase = next;
      cells.forEach((cell, index) => { cell.dataset.c = String((baseColour(index) + phase) % 3); });
    };
    const onScroll = () => { if (visible && !frame) frame = requestAnimationFrame(paint); };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { element.dataset.in = "true"; onScroll(); }
    }, { threshold: 0.2 });

    observer.observe(element);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <figure className="m-0">
      <div aria-hidden className={styles.grid} ref={ref}>
        {dots.map((index) => <span className={styles.dot} data-c={baseColour(index)} key={index} style={{ "--i": index } as React.CSSProperties} />)}
      </div>
      <figcaption className={styles.caption}>{t("landingUpiFigure")}</figcaption>
    </figure>
  );
}
