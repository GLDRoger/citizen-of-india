import type { ReactNode } from "react";

const indiaWords = /(India|भारत|ಭಾರತ)/u;
const tokens = /(\[\[.*?\]\]|\*\*.*?\*\*|\^\^.*?\^\^|_[^_\s][^_]*?_)/u;

function render(text: string, key: string): ReactNode[] {
  return text.split(tokens).filter(Boolean).map((chunk, index) => {
    const id = `${key}-${index}`;
    if (chunk.startsWith("[[")) return <mark className="pop" key={id}>{render(chunk.slice(2, -2), id)}</mark>;
    if (chunk.startsWith("**")) return <strong className="text-ink-strong" key={id}>{render(chunk.slice(2, -2), id)}</strong>;
    if (chunk.startsWith("^^")) return <span className="oversize" key={id}>{render(chunk.slice(2, -2), id)}</span>;
    if (chunk.startsWith("_") && chunk.endsWith("_") && chunk.length > 2) return <em key={id}>{render(chunk.slice(1, -1), id)}</em>;
    return chunk.split(indiaWords).filter(Boolean).map((part, partIndex) => (
      indiaWords.test(part) ? <span className="india" key={`${id}-${partIndex}`}>{part}</span> : part
    ));
  });
}

/**
 * Renders dictionary copy with a small gazette vocabulary, so copy stays plain
 * text in the dictionaries and only these marks are interpreted:
 * `[[phrase]]` saffron highlighter, `**bold**`, `_italic_`, `^^oversize^^`
 * (marks may nest), and any mention of India carries a tricolour shimmer.
 * `entrance` decides when the marks animate: on page load for above-the-fold
 * lines, or as the line scrolls into view.
 */
export function RichText({ entrance = "scroll", text }: { entrance?: "load" | "scroll"; text: string }) {
  return <span className={entrance === "load" ? "mark-load" : "mark-scroll"}>{render(text, "r")}</span>;
}
