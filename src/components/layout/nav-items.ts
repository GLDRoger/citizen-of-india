import {
  Compass,
  FileText,
  House,
  Inbox,
  ListChecks,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { MessageKey } from "@/i18n/messages";

export interface NavItem {
  href: string;
  label: MessageKey;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/", label: "home", icon: House },
  { href: "/you", label: "you", icon: UserRound },
  { href: "/activity", label: "activity", icon: ListChecks },
  { href: "/inbox", label: "inbox", icon: Inbox },
  { href: "/documents", label: "documents", icon: FileText },
  { href: "/discover", label: "discover", icon: Compass },
];
