"use client";

import {
  BellRing,
  Bike,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileStack,
  HandCoins,
  House,
  Landmark,
  MapPin,
  ScrollText,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { arjunEdges, arjunMoneyDue, arjunParentIds, challanAmount, countArjunLinks, familyPropertyCount } from "@/features/graph/seed-facts";
import { easeOut, segment, useScrollScene } from "@/hooks/use-scroll-scene";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import styles from "./citizen-graph-map.module.css";

type GraphPhase = "identity" | "life" | "service";
type GraphMapMode = "journey" | "static";

interface Coordinate {
  x: number;
  y: number;
}

interface VisualNode {
  /** How the count changes when the challan is paid in the "act" beat. */
  actDelta?: number;
  actBadge?: MessageKey;
  count: number;
  desktop: Coordinate;
  icon: LucideIcon;
  id: string;
  label: MessageKey;
  mobile: Coordinate;
  phase: GraphPhase;
}

const visualNodes: readonly VisualNode[] = [
  { count: arjunParentIds.length, desktop: { x: 50, y: 10 }, icon: UsersRound, id: "family", label: "graphMapFamily", mobile: { x: 25, y: 7 }, phase: "life" },
  { count: familyPropertyCount, desktop: { x: 72, y: 17 }, icon: House, id: "property", label: "graphMapProperty", mobile: { x: 75, y: 7 }, phase: "life" },
  { count: countArjunLinks("residesAt", "address"), desktop: { x: 86, y: 34 }, icon: MapPin, id: "address", label: "graphMapAddress", mobile: { x: 25, y: 21 }, phase: "identity" },
  { count: countArjunLinks("employedBy", "employment"), desktop: { x: 90, y: 56 }, icon: BriefcaseBusiness, id: "work", label: "graphMapWork", mobile: { x: 75, y: 21 }, phase: "life" },
  { count: countArjunLinks("owns", "business"), desktop: { x: 80, y: 76 }, icon: Building2, id: "business", label: "graphMapBusiness", mobile: { x: 25, y: 35 }, phase: "life" },
  { count: countArjunLinks("owns", "vehicle"), desktop: { x: 61, y: 88 }, icon: Bike, id: "vehicle", label: "graphMapVehicle", mobile: { x: 75, y: 35 }, phase: "life" },
  { actBadge: "graphMapReceiptBadge", actDelta: 1, count: countArjunLinks("holds", "document"), desktop: { x: 39, y: 88 }, icon: FileStack, id: "documents", label: "graphMapDocuments", mobile: { x: 25, y: 71 }, phase: "identity" },
  { count: countArjunLinks("subjectOf", "benefit"), desktop: { x: 20, y: 76 }, icon: HandCoins, id: "benefits", label: "graphMapBenefits", mobile: { x: 75, y: 71 }, phase: "service" },
  { count: countArjunLinks("subjectOf", "application"), desktop: { x: 10, y: 56 }, icon: ClipboardCheck, id: "applications", label: "graphMapApplications", mobile: { x: 25, y: 84 }, phase: "service" },
  { actBadge: "graphMapPaidBadge", actDelta: -1, count: countArjunLinks("subjectOf", "obligation"), desktop: { x: 14, y: 34 }, icon: Landmark, id: "obligations", label: "graphMapObligations", mobile: { x: 75, y: 84 }, phase: "service" },
  { count: countArjunLinks("subjectOf", "notice"), desktop: { x: 28, y: 17 }, icon: BellRing, id: "notices", label: "graphMapNotices", mobile: { x: 50, y: 94 }, phase: "service" },
];

const obligationsAfter = (visualNodes.find((node) => node.id === "obligations")?.count ?? 0) - 1;
const moneyAfter = arjunMoneyDue - challanAmount;

const captions: ReadonlyArray<{ body: MessageKey; className: string; params?: Record<string, string | number>; title: MessageKey }> = [
  { body: "graphMapIdentityBody", className: styles.captionIdentity, title: "graphMapIdentityTitle" },
  { body: "graphMapLifeBody", className: styles.captionLife, title: "graphMapLifeTitle" },
  { body: "graphMapServiceBody", className: styles.captionService, title: "graphMapServiceTitle" },
  { body: "graphMapActBody", className: styles.captionAct, params: { money: formatCurrency(moneyAfter), obligations: obligationsAfter }, title: "graphMapActTitle" },
  { body: "graphMapResultBody", className: styles.captionResult, title: "graphMapResultTitle" },
];

function setProgress(element: HTMLElement, name: string, value: number) {
  element.style.setProperty(name, value.toFixed(4));
}

/**
 * Scroll timeline. Beats: the record appears, identity attaches, life attaches,
 * services attach, then one action (paying the challan) writes through the
 * graph, and the final caption lands. Caption windows never overlap.
 */
function paintGraph(progress: number, element: HTMLElement) {
  setProgress(element, "--graph-center", easeOut(segment(progress, 0, 0.06)));
  setProgress(element, "--graph-identity", easeOut(segment(progress, 0.03, 0.2)));
  setProgress(element, "--graph-life", easeOut(segment(progress, 0.2, 0.4)));
  setProgress(element, "--graph-service", easeOut(segment(progress, 0.4, 0.58)));
  const act = easeOut(segment(progress, 0.64, 0.8));
  setProgress(element, "--graph-act", act);
  setProgress(element, "--graph-pulse", Math.sin(Math.min(1, segment(progress, 0.62, 0.84)) * Math.PI));
  setProgress(element, "--graph-result", easeOut(segment(progress, 0.86, 0.96)));
  setProgress(element, "--caption-identity", 1 - segment(progress, 0.16, 0.2));
  setProgress(element, "--caption-life", segment(progress, 0.2, 0.24) * (1 - segment(progress, 0.36, 0.4)));
  setProgress(element, "--caption-service", segment(progress, 0.4, 0.44) * (1 - segment(progress, 0.56, 0.6)));
  setProgress(element, "--caption-act", segment(progress, 0.6, 0.64) * (1 - segment(progress, 0.82, 0.86)));
  setProgress(element, "--caption-result", segment(progress, 0.86, 0.9));
}

function GraphEdges({ mobile }: { mobile: boolean }) {
  const center = mobile ? { x: 50, y: 52 } : { x: 50, y: 50 };
  return (
    <svg aria-hidden className={mobile ? styles.mobileEdges : styles.desktopEdges} preserveAspectRatio="none" viewBox="0 0 100 100">
      <ellipse className={styles.outerOrbit} cx="50" cy="50" rx="41" ry="40" vectorEffect="non-scaling-stroke" />
      <ellipse className={styles.innerOrbit} cx="50" cy="50" rx="25" ry="24" vectorEffect="non-scaling-stroke" />
      {visualNodes.map((node) => {
        const coordinate = mobile ? node.mobile : node.desktop;
        const destination = node.id === "property" ? (mobile ? visualNodes[0].mobile : visualNodes[0].desktop) : center;
        return <line className={cn(styles.edge, styles[`${node.phase}Edge`], node.actDelta ? styles.actEdge : undefined)} key={node.id} vectorEffect="non-scaling-stroke" x1={coordinate.x} x2={destination.x} y1={coordinate.y} y2={destination.y} />;
      })}
    </svg>
  );
}

function NodeCount({ node }: { node: VisualNode }) {
  if (!node.actDelta) return <strong>{node.count}</strong>;
  return (
    <strong className={styles.countSwap}>
      <span className={styles.countBefore}>{node.count}</span>
      <span className={styles.countAfter}>{node.count + node.actDelta}</span>
    </strong>
  );
}

function GraphNetwork({ journey }: { journey: boolean }) {
  const { t } = useI18n();
  const nodeSummary = visualNodes.map((node) => `${t(node.label)} ${node.count}`).join(", ");
  const graphLabel = `${t("graphMapTitle")} ${t("graphMapBody")} ${nodeSummary}. ${t("graphMapSource", { connections: arjunEdges.length, nodes: visualNodes.length })}`;
  return (
    <div aria-label={graphLabel} className={styles.network} role="img">
      <GraphEdges mobile={false} />
      <GraphEdges mobile />
      <div className={styles.centerNode}>
        <ScrollText aria-hidden className={styles.centerIcon} />
        <span>{t("graphMapCenterLabel")}</span>
        <strong className="font-display">{t("graphVisualPersonName")}</strong>
        <small>{t("graphMapCenterMeta", { count: arjunEdges.length })}</small>
        {journey ? (
          <small className={styles.money}>
            {t("graphMapMoneyDue")}{" "}
            <span className={styles.countSwap}>
              <span className={styles.countBefore}>{formatCurrency(arjunMoneyDue)}</span>
              <span className={styles.countAfter}>{formatCurrency(moneyAfter)}</span>
            </span>
          </small>
        ) : null}
      </div>
      {visualNodes.map((node) => {
        const { icon: Icon, id, label, phase } = node;
        return (
          <div className={cn(styles.node, styles[`node${id[0].toUpperCase()}${id.slice(1)}`], styles[`${phase}Node`], node.actDelta ? styles.actNode : undefined)} key={id}>
            <Icon aria-hidden />
            <span>{t(label)}</span>
            {journey ? <NodeCount node={node} /> : <strong>{node.count}</strong>}
            {journey && node.actBadge ? <em className={styles.badge}>{t(node.actBadge)}</em> : null}
          </div>
        );
      })}
    </div>
  );
}

function CaptionStack() {
  const { t } = useI18n();
  return (
    <>
      <div aria-hidden className={styles.captionStack}>
        {captions.map((caption) => <div className={cn(styles.caption, caption.className)} key={caption.title}><strong className="font-display">{t(caption.title)}</strong><span>{t(caption.body, caption.params)}</span></div>)}
      </div>
      <ol className="sr-only">{captions.map((caption) => <li key={caption.title}><strong>{t(caption.title)}</strong> {t(caption.body, caption.params)}</li>)}</ol>
    </>
  );
}

export function CitizenGraphMap({ className, id, mode = "static" }: { className?: string; id?: string; mode?: GraphMapMode }) {
  const { t } = useI18n();
  const dataSaver = useAuthStore((state) => state.dataSaver);
  const sceneRef = useScrollScene<HTMLElement>(mode === "static" || dataSaver, paintGraph);
  const isJourney = mode === "journey" && !dataSaver;

  return (
    <section className={cn(styles.scene, !isJourney && styles.staticScene, dataSaver && styles.reducedScene, className)} id={id} ref={sceneRef}>
      <div className={styles.stage}>
        <div className={styles.shell}>
          <header className={styles.header}>
            <p>{t("graphMapEyebrow")}</p>
            <h2 className="font-display">{t("graphMapTitle")}</h2>
            <span>{t("graphMapBody")}</span>
          </header>
          <GraphNetwork journey={isJourney} />
          <footer className={styles.footer}>
            {isJourney ? <CaptionStack /> : <p className={styles.staticCaption}>{t("graphMapResultTitle")} {t("graphMapResultBody")}</p>}
            <div className={styles.source}>
              <span>{t("graphMapSource", { connections: arjunEdges.length, nodes: visualNodes.length })}</span>
              {isJourney ? <span className={styles.scrollCue}>{t("graphMapScrollCue")}</span> : null}
              {isJourney ? <span className={styles.completeCue}>{t("graphMapCompleteCue")}</span> : null}
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
