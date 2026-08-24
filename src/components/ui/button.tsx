import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
type ButtonVariant = "primary" | "secondary" | "quiet" | "danger" | "inverse";
const variants: Record<ButtonVariant, string> = { primary: "bg-green-deep text-paper hover:bg-ink", secondary: "bg-transparent px-0 text-ink underline decoration-ink/30 underline-offset-4", quiet: "bg-transparent px-0 text-ink-mute underline underline-offset-4", danger: "bg-brick text-paper", inverse: "bg-paper text-green-deep" };
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; loading?: boolean; children: ReactNode; }
export function Button({ variant = "primary", loading = false, className, disabled, children, ...props }: ButtonProps) { return <button className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] px-5 font-display text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-deep disabled:opacity-50", variants[variant], className)} disabled={disabled || loading} {...props}>{loading ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : null}{children}</button>; }
interface LinkButtonProps { href: string; children: ReactNode; variant?: ButtonVariant; className?: string; }
export function LinkButton({ href, children, variant = "primary", className }: LinkButtonProps) { return <Link className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] px-5 font-display text-sm font-semibold", variants[variant], className)} href={href}>{children}</Link>; }
