import Image from "next/image";

export function CitizenMark({ className }: { className?: string }) {
  return (
    <Image alt="" aria-hidden className={className} height={64} src="/citizen-logo.png" width={64} />
  );
}
