"use client";

import { BriefcaseBusiness, Building2, CarFront, FileText, House, LocateFixed, MapPin, UserRound, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/use-i18n";
import { cn } from "@/lib/cn";
import { groupLabelKeys, groupOrder, spiralPath, type MapGroup, type MapNode, type RecordMap } from "./model";
import styles from "./record-map.module.css";

const NODE_RADIUS = 22;

const groupColor: Record<MapGroup, string> = {
  identity: "var(--indigo)",
  family: "var(--brick)",
  work: "var(--green-deep)",
  assets: "var(--saffron)",
};

const icons: Partial<Record<MapNode["node"]["type"], LucideIcon>> = {
  person: UserRound,
  employment: Building2,
  business: BriefcaseBusiness,
  vehicle: CarFront,
  property: House,
  address: MapPin,
};

function needsAttention(node: MapNode) {
  const state = node.node.verification.state;
  return state === "mismatch" || state === "expired" || state === "not-documented";
}

interface Offset {
  x: number;
  y: number;
}

function NodeIcon({ color, node }: { color: string; node: MapNode }) {
  const Icon = icons[node.node.type] ?? FileText;
  return <Icon aria-hidden className={styles.icon} height={18} strokeWidth={1.9} style={{ color }} width={18} x={-9} y={-9} />;
}

function MapNodeMark({ node, onSelect, selected }: { node: MapNode; onSelect: (id: string) => void; selected: boolean }) {
  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(node.id);
    }
  };
  return (
    <g
      aria-label={`${node.title}, ${node.subtitle}`}
      aria-pressed={selected}
      className={styles.node}
      onClick={() => onSelect(node.id)}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      transform={`translate(${node.x.toFixed(1)} ${node.y.toFixed(1)})`}
    >
      <circle className={styles.ring} r={NODE_RADIUS + 5} />
      <circle className={styles.disc} r={NODE_RADIUS} style={{ stroke: groupColor[node.group] }} />
      <NodeIcon color={groupColor[node.group]} node={node} />
      {needsAttention(node) ? <circle className={styles.warn} cx={NODE_RADIUS - 6} cy={-NODE_RADIUS + 6} r={5} /> : null}
      <text className={styles.label} y={NODE_RADIUS + 16}>{node.title}</text>
      <text className={styles.sublabel} y={NODE_RADIUS + 29}>{node.subtitle}</text>
    </g>
  );
}

function CenterMark({ name, you }: { name: string; you: string }) {
  return (
    <g className={styles.center}>
      <circle className={styles.centerDisc} r={34} />
      <text className={styles.centerLabel} y={4}>{you}</text>
      <text className={styles.centerName} y={58}>{name}</text>
    </g>
  );
}

export function RecordMap({ map, onSelect, selectedId }: { map: RecordMap; onSelect: (id: string) => void; selectedId: string | null }) {
  const { t } = useI18n();
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ pointerId: number; startX: number; startY: number; origin: Offset; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    suppressClick.current = false;
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, origin: offset, moved: false };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.pointerId !== event.pointerId) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (!state.moved && Math.hypot(dx, dy) < 4) return;
    if (!state.moved) {
      // Capture only once it is really a drag, so a plain tap still reaches the node underneath.
      state.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    setOffset({ x: state.origin.x + dx, y: state.origin.y + dy });
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    suppressClick.current = drag.current.moved;
    drag.current = null;
    setDragging(false);
  };
  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    // A drag that ended on a node must not also select it.
    if (suppressClick.current) { event.stopPropagation(); event.preventDefault(); suppressClick.current = false; }
  };

  const centerOn = (node?: MapNode) => setOffset(node ? { x: -node.x, y: -node.y } : { x: 0, y: 0 });
  const select = (id: string) => {
    onSelect(id);
    const node = map.nodes.find((candidate) => candidate.id === id);
    if (node) centerOn(node);
  };

  const byId = new Map(map.nodes.map((node) => [node.id, node]));
  const originX = size.width / 2 + offset.x;
  const originY = size.height / 2 + offset.y;
  const ariaLabel = t("recordsMapAria", { name: map.center.attrs.name, count: map.nodes.length });

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("recordsViewLabel")}>
        {groupOrder.filter((group) => map.groups[group] > 0).map((group) => {
          const first = map.nodes.find((node) => node.group === group);
          return (
            <button className="inline-flex min-h-9 items-center gap-2 rounded-[2px] border border-paper-line bg-panel px-3 text-xs font-bold text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-deep" key={group} onClick={() => first && select(first.id)} type="button">
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: groupColor[group] }} />
              {t(groupLabelKeys[group])}
              <span className="text-ink-mute">{map.groups[group]}</span>
            </button>
          );
        })}
      </div>
      <div
        className={styles.stage}
        data-dragging={dragging}
        onClickCapture={onClickCapture}
        onPointerCancel={onPointerUp}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        ref={stageRef}
      >
        <p className={styles.hint}>{t("recordsMapHint")}</p>
        <div className={styles.tools}>
          <Button className="min-h-9 px-3 text-xs" onClick={() => centerOn()} variant="secondary"><LocateFixed aria-hidden className="size-4" />{t("recordsMapRecenter")}</Button>
        </div>
        {size.width > 0 ? (
          <svg aria-label={ariaLabel} className={styles.canvas} role="group" viewBox={`0 0 ${size.width} ${size.height}`}>
            <g className={styles.pan} transform={`translate(${originX.toFixed(1)} ${originY.toFixed(1)})`}>
              <path className={styles.spiral} d={spiralPath(map.nodes)} />
              {map.nodes.map((node) => <line className={cn(styles.edge, styles[node.group])} key={`edge-${node.id}`} x1={0} x2={node.x} y1={0} y2={node.y} />)}
              {map.nodes.map((node) => {
                const target = node.linkedTo ? byId.get(node.linkedTo) : undefined;
                return target ? <line className={styles.link} key={`link-${node.id}`} x1={node.x} x2={target.x} y1={node.y} y2={target.y} /> : null;
              })}
              <CenterMark name={map.center.attrs.name} you={t("recordsMapYou")} />
              {map.nodes.map((node) => <MapNodeMark key={node.id} node={node} onSelect={select} selected={node.id === selectedId} />)}
            </g>
          </svg>
        ) : null}
      </div>
    </div>
  );
}
