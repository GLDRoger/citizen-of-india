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
import { createSeedGraph } from "@/features/graph/seed";
import type { GraphEdge, NodeType } from "@/features/graph/schema";
import { useAuthStore } from "@/features/auth/store";
import { easeOut, segment, useScrollScene } from "@/hooks/use-scroll-scene";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";
import styles from "./citizen-graph-map.module.css";

type GraphPhase = "identity" | "life" | "service";
type GraphMapMode = "journey" | "static";

interface Coordinate {
  x: number;
  y: number;
}

interface VisualNode {
  count: number;
  desktop: Coordinate;
  icon: LucideIcon;
  id: string;
  label: MessageKey;
  mobile: Coordinate;
  phase: GraphPhase;
}

const graph = createSeedGraph();
const activeEdges = graph.edges.filter((edge) => edge.status === "active");
const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
const arjunEdges = activeEdges.filter((edge) => edge.from === "person:arjun");

function directCount(edgeType: GraphEdge["type"], nodeType: NodeType) {
  return arjunEdges.filter((edge) => edge.type === edgeType && nodesById.get(edge.to)?.type === nodeType).length;
}

const parentIds = arjunEdges.filter((edge) => edge.type === "childOf").map((edge) => edge.to);
const familyPropertyCount = activeEdges.filter((edge) => (
  edge.type === "owns"
  && parentIds.includes(edge.from)
  && nodesById.get(edge.to)?.type === "property"
)).length;

const visualNodes: readonly VisualNode[] = [
  { count: parentIds.length, desktop: { x: 50, y: 10 }, icon: UsersRound, id: "family", label: "graphMapFamily", mobile: { x: 25, y: 7 }, phase: "life" },
  { count: familyPropertyCount, desktop: { x: 72, y: 17 }, icon: House, id: "property", label: "graphMapProperty", mobile: { x: 75, y: 7 }, phase: "life" },
  { count: directCount("residesAt", "address"), desktop: { x: 86, y: 34 }, icon: MapPin, id: "address", label: "graphMapAddress", mobile: { x: 25, y: 21 }, phase: "identity" },
  { count: directCount("employedBy", "employment"), desktop: { x: 90, y: 56 }, icon: BriefcaseBusiness, id: "work", label: "graphMapWork", mobile: { x: 75, y: 21 }, phase: "life" },
  { count: directCount("owns", "business"), desktop: { x: 80, y: 76 }, icon: Building2, id: "business", label: "graphMapBusiness", mobile: { x: 25, y: 35 }, phase: "life" },
  { count: directCount("owns", "vehicle"), desktop: { x: 61, y: 88 }, icon: Bike, id: "vehicle", label: "graphMapVehicle", mobile: { x: 75, y: 35 }, phase: "life" },
  { count: directCount("holds", "document"), desktop: { x: 39, y: 88 }, icon: FileStack, id: "documents", label: "graphMapDocuments", mobile: { x: 25, y: 68 }, phase: "identity" },
  { count: directCount("subjectOf", "benefit"), desktop: { x: 20, y: 76 }, icon: HandCoins, id: "benefits", label: "graphMapBenefits", mobile: { x: 75, y: 68 }, phase: "service" },
  { count: directCount("subjectOf", "application"), desktop: { x: 10, y: 56 }, icon: ClipboardCheck, id: "applications", label: "graphMapApplications", mobile: { x: 25, y: 82 }, phase: "service" },
  { count: directCount("subjectOf", "obligation"), desktop: { x: 14, y: 34 }, icon: Landmark, id: "obligations", label: "graphMapObligations", mobile: { x: 75, y: 82 }, phase: "service" },
  { count: directCount("subjectOf", "notice"), desktop: { x: 28, y: 17 }, icon: BellRing, id: "notices", label: "graphMapNotices", mobile: { x: 50, y: 94 }, phase: "service" },
];

const captions: ReadonlyArray<{ body: MessageKey; className: string; title: MessageKey }> = [
  { body: "graphMapIdentityBody", className: styles.captionIdentity, title: "graphMapIdentityTitle" },
  { body: "graphMapLifeBody", className: styles.captionLife, title: "graphMapLifeTitle" },
  { body: "graphMapServiceBody", className: styles.captionService, title: "graphMapServiceTitle" },
  { body: "graphMapResultBody", className: styles.captionResult, title: "graphMapResultTitle" },
];

function setProgress(element: HTMLElement, name: string, value: number) {
  element.style.setProperty(name, value.toFixed(4));
}

function paintGraph(progress: number, element: HTMLElement) {
  setProgress(element, "--graph-center", easeOut(segment(progress, 0, 0.08)));
  setProgress(element, "--graph-identity", easeOut(segment(progress, 0.04, 0.25)));
  setProgress(element, "--graph-life", easeOut(segment(progress, 0.25, 0.5)));
  setProgress(element, "--graph-service", easeOut(segment(progress, 0.5, 0.74)));
  setProgress(element, "--graph-result", easeOut(segment(progress, 0.74, 0.94)));
  setProgress(element, "--caption-identity", 1 - segment(progress, 0.2, 0.25));
  setProgress(element, "--caption-life", segment(progress, 0.25, 0.3) * (1 - segment(progress, 0.45, 0.5)));
  setProgress(element, "--caption-service", segment(progress, 0.5, 0.55) * (1 - segment(progress, 0.7, 0.75)));
  setProgress(element, "--caption-result", segment(progress, 0.75, 0.8));
}

function GraphEdges({ mobile }: { mobile: boolean }) {
  const center = mobile ? { x: 50, y: 52 } : { x: 50, y: 50 };
  return (
    <svg aria-hidden className={mobile ? styles.mobileEdges : styles.desktopEdges} preserveAspectRatio="none" viewBox="0 0 100 100">
      <ellipse className={styles.outerOrbit} cx="50" cy="50" rx="41" ry="40" vectorEffect="non-scaling-stroke" />
      <ellipse className={styles.innerOrbit} cx="50" cy="50" rx="25" ry="24" vectorEffect="non-scaling-stroke" />
      {visualNodes.map((node) => {
        const coordinate = mobile ? node.mobile : node.desktop;
        const destination = node.id === "property"
          ? (mobile ? visualNodes[0].mobile : visualNodes[0].desktop)
          : center;
        return <line className={cn(styles.edge, styles[`${node.phase}Edge`])} key={node.id} vectorEffect="non-scaling-stroke" x1={coordinate.x} x2={destination.x} y1={coordinate.y} y2={destination.y} />;
      })}
    </svg>
  );
}

function GraphNetwork() {
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
      </div>
      {visualNodes.map(({ count, icon: Icon, id, label, phase }) => (
        <div className={cn(styles.node, styles[`node${id[0].toUpperCase()}${id.slice(1)}`], styles[`${phase}Node`])} key={id}>
          <Icon aria-hidden />
          <span>{t(label)}</span>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  );
}

function CaptionStack() {
  const { t } = useI18n();
  return (
    <>
      <div aria-hidden className={styles.captionStack}>
        {captions.map((caption) => <div className={cn(styles.caption, caption.className)} key={caption.title}><strong className="font-display">{t(caption.title)}</strong><span>{t(caption.body)}</span></div>)}
      </div>
      <ol className="sr-only">{captions.map((caption) => <li key={caption.title}><strong>{t(caption.title)}</strong> {t(caption.body)}</li>)}</ol>
    </>
  );
}

export function CitizenGraphMap({ className, id, mode = "static" }: { className?: string; id?: string; mode?: GraphMapMode }) {
  const { t } = useI18n();
  const dataSaver = useAuthStore((state) => state.dataSaver);
  const sceneRef = useScrollScene<HTMLElement>(mode === "static" || dataSaver, paintGraph);
  const isJourney = mode === "journey";

  return (
    <section className={cn(styles.scene, (!isJourney || dataSaver) && styles.staticScene, dataSaver && styles.reducedScene, className)} id={id} ref={sceneRef}>
      <div className={styles.stage}>
        <div className={styles.shell}>
          <header className={styles.header}>
            <p>{t("graphMapEyebrow")}</p>
            <h2 className="font-display">{t("graphMapTitle")}</h2>
            <span>{t("graphMapBody")}</span>
          </header>
          <GraphNetwork />
          <footer className={styles.footer}>
            {isJourney ? <CaptionStack /> : <p className={styles.staticCaption}>{t("graphMapResultTitle")} {t("graphMapResultBody")}</p>}
            <div className={styles.source}>
              <span>{t("graphMapSource", { connections: arjunEdges.length, nodes: visualNodes.length })}</span>
              {isJourney && !dataSaver ? <span className={styles.scrollCue}>{t("graphMapScrollCue")}</span> : null}
              {isJourney ? <span className={styles.completeCue}>{t("graphMapCompleteCue")}</span> : null}
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
