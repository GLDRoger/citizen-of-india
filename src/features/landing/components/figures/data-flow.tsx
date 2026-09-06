"use client";

import { useI18n } from "@/i18n/use-i18n";
import styles from "./data-flow.module.css";

/**
 * Where your data goes: out of a private super app to lenders, advertisers and
 * the next offer, or between you, Citizen and the departments, with nothing
 * leaving. Every label comes from the dictionaries.
 */
export function DataFlowFigure() {
  const { t } = useI18n();
  return (
    <div aria-hidden className={styles.figure}>
      <div className={styles.panel}>
        <span className={`${styles.node} ${styles.you}`}>{t("landingFlowYou")}</span>
        <span className={`${styles.flow} ${styles.flowOut}`} />
        <span className={`${styles.node} ${styles.app}`}>{t("landingFlowPrivateApp")}</span>
        <span className={`${styles.flow} ${styles.flowOut}`} />
        <span className={styles.out}>
          <span className={styles.node}>{t("landingFlowLenders")}</span>
          <span className={styles.node}>{t("landingFlowAdvertisers")}</span>
          <span className={styles.node}>{t("landingFlowOffers")}</span>
        </span>
        <span className={styles.note}><span>{t("landingFlowProfile")} →</span></span>
      </div>
      <div className={`${styles.panel} ${styles.panelPublic}`}>
        <span className={`${styles.node} ${styles.you}`}>{t("landingFlowYou")}</span>
        <span className={`${styles.flow} ${styles.flowBack}`} />
        <span className={`${styles.node} ${styles.citizen}`}>{t("landingFlowCitizen")}</span>
        <span className={`${styles.flow} ${styles.flowBoth}`} />
        <span className={`${styles.node} ${styles.gov}`}>{t("landingFlowGovernment")}</span>
        <span className={styles.note}>
          <span>← {t("landingFlowProof")}</span>
          <span className={styles.stamp}>{t("landingFlowNothing")}</span>
        </span>
      </div>
    </div>
  );
}
