export function CitizenMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} fill="none" viewBox="0 0 48 48">
      <path d="M7 40V23C7 13 14 6 24 6s17 7 17 17v17M15 40V24c0-5 4-9 9-9s9 4 9 9v16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" />
      <circle cx="24" cy="29" r="3.25" fill="currentColor" />
    </svg>
  );
}
