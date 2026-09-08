"use client";

import Image from "next/image";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/store";
import { cn } from "@/lib/cn";
import { Monument, type MonumentName } from "./monuments";
import styles from "./illustrated-backdrop.module.css";

/** Decorative enhancement only; saved data-saver preferences gate the request. */
export function IllustratedBackdrop({ name, className, variant = "header" }: {
  name: MonumentName;
  className?: string;
  variant?: "header" | "home" | "card" | "compact";
}) {
  const hydrated = useAuthStore((state) => state.hydrated);
  const dataSaver = useAuthStore((state) => state.dataSaver);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImage = hydrated && !dataSaver && !failed;

  return (
    <span aria-hidden="true" className={cn(styles.artwork, styles[variant], className)} data-monument={name}>
      <Monument className={cn(styles.outline, showImage && loaded && styles.hidden)} name={name} />
      {showImage ? (
        <Image
          alt=""
          className={cn(styles.image, loaded && styles.loaded)}
          fetchPriority="low"
          fill
          loading={variant === "card" ? "lazy" : "eager"}
          onError={() => setFailed(true)}
          onLoad={() => setLoaded(true)}
          sizes={variant === "card" ? "240px" : "(min-width: 1024px) 480px, (min-width: 640px) 380px, 240px"}
          src={`/artwork/${name}.webp`}
        />
      ) : null}
    </span>
  );
}
