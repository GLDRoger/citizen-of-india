import type { Metadata } from "next";
import { ProfileStart } from "@/features/auth/components/profile-start";

export const metadata: Metadata = { title: "Start the demo" };

export default function StartPage() {
  return <ProfileStart />;
}
