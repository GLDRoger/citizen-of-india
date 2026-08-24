import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger" | "inverse";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-action text-action-ink hover:bg-action-strong active:translate-y-px",
  secondary: "border border-line bg-surface text-ink hover:bg-surface-strong",
  quiet: "bg-transparent text-ink-muted hover:bg-surface-strong hover:text-ink",
  danger: "bg-danger-soft text-danger hover:bg-danger-soft-strong",
  inverse: "bg-action-ink text-action-strong hover:bg-saffron",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-5 text-sm font-bold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

export function LinkButton({ href, children, variant = "primary", className }: LinkButtonProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-5 text-sm font-bold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action",
        variants[variant],
        className,
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
