import type { Metadata } from "next";
import { InboxScreen } from "@/features/inbox/components/inbox-screen";

export const metadata: Metadata = { title: "Inbox" };

export default function InboxPage() {
  return <InboxScreen />;
}
