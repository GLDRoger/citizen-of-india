import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
type ButtonVariant = "primary" | "secondary" | "quiet" | "danger" | "inverse" | "inverseQuiet";
const variants: Record<ButtonVariant, string> = {
  primary: "bg-indigo-deep text-paper hover:bg-indigo",
  secondary: "border border-paper-line bg-paper-shade text-ink hover:border-indigo/45 hover:text-indigo-deep",
  quiet: "bg-transparent text-indigo-deep hover:bg-indigo-tint",
  danger: "bg-brick text-white hover:bg-ink",
  inverse: "bg-paper text-indigo-deep hover:bg-saffron hover:text-ink",
  inverseQuiet: "border border-paper/30 bg-transparent text-paper hover:bg-paper/10",
};
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant; loading?: boolean; children: ReactNode; }
export function Button({ variant = "primary", loading = false, className, disabled, children, ...props }: ButtonProps) { return <button className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] px-5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-deep disabled:cursor-not-allowed disabled:opacity-50", variants[variant], className)} disabled={disabled || loading} {...props}>{loading ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : null}{children}</button>; }
interface LinkButtonProps { href: string; children: ReactNode; variant?: ButtonVariant; className?: string; }
export function LinkButton({ href, children, variant = "primary", className }: LinkButtonProps) { return <Link className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] px-5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-deep", variants[variant], className)} href={href}>{children}</Link>; }
