import {
  BookOpenText,
  Compass,
  Grid2X2,
  House,
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
  { href: "/home", label: "home", icon: House },
  { href: "/services", label: "services", icon: Grid2X2 },
  { href: "/you", label: "you", icon: UserRound },
  { href: "/discover", label: "discover", icon: Compass },
  { href: "/manifesto", label: "manifestoNav", icon: BookOpenText },
];
