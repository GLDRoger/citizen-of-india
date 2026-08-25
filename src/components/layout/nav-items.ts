import {
  Compass,
  Grid2X2,
  House,
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
  { href: "/services", label: "services", icon: Grid2X2 },
  { href: "/discover", label: "discover", icon: Compass },
];
