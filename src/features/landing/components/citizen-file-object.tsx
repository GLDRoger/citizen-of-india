"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/features/auth/store";
import { arjunEdges, arjunFile, arjunMoneyDue, countArjunLinks } from "@/features/graph/seed-facts";
import { useI18n } from "@/i18n/use-i18n";
import { DEMO_TODAY } from "@/lib/demo-clock";
import { ageFromDob } from "@/features/graph/selectors";
import { formatCurrency, formatDate, getInitials } from "@/lib/format";
import styles from "./citizen-file-object.module.css";

const documentCount = countArjunLinks("holds", "document");
const obligationCount = countArjunLinks("subjectOf", "obligation");

/**
 * Pointer tilt writes CSS custom properties through rAF. No React state, so
 * the hero never re-renders while the file moves.
 */
function usePointerTilt<T extends HTMLElement>(disabled: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || disabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const surface = element.closest("section") ?? element;
    let frame = 0;
    let next: { x: number; y: number } | null = null;

    const paint = () => {
      frame = 0;
      if (!next) return;
      element.style.setProperty("--ry", `${(next.x * 22).toFixed(2)}deg`);
      element.style.setProperty("--rx", `${(-next.y * 16).toFixed(2)}deg`);
      element.style.setProperty("--lift", Math.min(1, Math.hypot(next.x, next.y) * 2).toFixed(3));
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const bounds = element.getBoundingClientRect();
      next = { x: (event.clientX - bounds.left) / bounds.width - 0.5, y: (event.clientY - bounds.top) / bounds.height - 0.5 };
      element.dataset.live = "true";
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      next = { x: 0, y: 0 };
      element.dataset.live = "false";
      if (!frame) frame = requestAnimationFrame(paint);
    };
    surface.addEventListener("pointermove", onMove);
    surface.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      surface.removeEventListener("pointermove", onMove);
      surface.removeEventListener("pointerleave", onLeave);
    };
  }, [disabled]);
  return ref;
}

/** A back sheet: one document, peeking out of the file with its own label and masked number. */
function Sheet({ className, label, number, stamp }: { className: string; label: string; number: string; stamp: string }) {
  return (
    <div className={`${styles.sheet} ${className}`}>
      <header><span>{label}</span><span className={styles.number}>{number}</span></header>
      <div className={styles.lines}><span /><span /><span /><span /></div>
      <span className={styles.stamp}>{stamp}</span>
    </div>
  );
}

export function CitizenFileObject() {
  const { language, t } = useI18n();
  const dataSaver = useAuthStore((state) => state.dataSaver);
  const stageRef = usePointerTilt<HTMLDivElement>(dataSaver);
  const label = `${t("landingFileLabel")}: ${arjunFile.name}, ${t("landingFileMeta", { count: arjunEdges.length })}`;

  return (
    <div aria-label={label} className={styles.stage} ref={stageRef} role="img">
      <div className={styles.float}>
        <div className={styles.file}>
          <div className={styles.shadow} />
          <div className={styles.folder}>
            <span className={styles.tab}>{t("landingFileDocket")} · {arjunFile.docketNumber}</span>
            <span className={styles.spine} />
          </div>
          <Sheet className={styles.sheetPassport} label={t("landingFileSheetPassport")} number={arjunFile.passport} stamp={t("verified")} />
          <Sheet className={styles.sheetPan} label={t("landingFileSheetPan")} number={arjunFile.pan} stamp={t("verified")} />
          <div className={`${styles.sheet} ${styles.sheetFront}`}>
            <span className={styles.margin} />
            <header>
              <span>{t("landingFileLabel")}</span>
              <span className={styles.stampInline}>{t("verified")}</span>
            </header>
            <div className={styles.identity}>
              <span className={styles.monogram}>{getInitials(arjunFile.name)}</span>
              <div className={styles.name}>
                <strong className="font-display">{arjunFile.name}</strong>
                <small>{t("landingFileAge", { age: ageFromDob(arjunFile.dob) })} · {arjunFile.locality}, {arjunFile.city}</small>
              </div>
            </div>
            <dl className={styles.ids}>
              <div><dt>{t("landingFileSheetAadhaar")}</dt><dd>{arjunFile.aadhaar}</dd></div>
              <div><dt>{t("landingFileSheetPan")}</dt><dd>{arjunFile.pan}</dd></div>
            </dl>
            <ul className={styles.rows}>
              <li><span>{t("graphMapDocuments")}</span><strong>{documentCount}</strong></li>
              <li><span>{t("graphMapObligations")}</span><strong>{obligationCount}</strong></li>
              <li><span>{t("graphMapMoneyDue")}</span><strong>{formatCurrency(arjunMoneyDue)}</strong></li>
            </ul>
            <span className={styles.simulated}>{t("simulated")}</span>
            <footer>
              <span>{t("landingFileMeta", { count: arjunEdges.length })}</span>
              <span>{t("landingFileUpdated", { date: formatDate(DEMO_TODAY, language) })}</span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
