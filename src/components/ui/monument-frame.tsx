import type { SVGProps } from "react";

/** Shared canvas for monument line drawings (400 × 240, stroke-only). */
export type MonumentProps = SVGProps<SVGSVGElement>;

/** Mirror a left-half group across the x = 200 axis of the 400-wide canvas. */
export const MIRROR = "scale(-1 1) translate(-400 0)";

export function MonumentFrame({ children, ...props }: MonumentProps) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 400 240"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      strokeLinecap="round"
      {...props}
    >
      {children}
    </svg>
  );
}
