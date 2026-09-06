"use client";

import type { CSSProperties } from "react";
import { useI18n } from "@/i18n/use-i18n";
import styles from "./crore-grid.module.css";

const USERS_IN_CRORE = 55.49;
const dots = Array.from({ length: Math.ceil(USERS_IN_CRORE) }, (_, index) => index);

/** One crore onboarded UPI users per dot, with a fractional last dot and a dated primary source. */
export function CroreGrid() {
  const { t } = useI18n();
  return (
    <figure className="m-0">
      <div aria-hidden className={styles.grid}>
        {dots.map((index) => <span className={styles.dot} key={index} style={{ "--fill": `${Math.min(1, USERS_IN_CRORE - index) * 100}%` } as CSSProperties} />)}
      </div>
      <figcaption className={styles.caption}>{t("landingUpiFigure")} <a className="inline-flex min-h-11 items-center font-bold text-indigo-deep underline underline-offset-4" href="https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2286608&lang=2&reg=48" rel="noreferrer" target="_blank">{t("landingUpiSource")}</a></figcaption>
    </figure>
  );
}
