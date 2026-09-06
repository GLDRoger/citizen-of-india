import type { Metadata } from "next";
import { TimelineScreen } from "@/features/activity/components/timeline-screen";

export const metadata: Metadata = { title: "Timeline" };

export default function ActivityPage() {
  return <TimelineScreen />;
}
