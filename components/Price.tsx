import { price } from "@/lib/format";
import type { ReactNode } from "react";

/** Text in a solid block, one cell per character like the █ redaction bars of the reference: every cell is 0.6em wide,
    so the block is as wide as that many bars. The price and "View listing" are the same material. */
export function Cells({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <>
      {[...text].map((c, i) => <span className="pc" key={i} aria-hidden="true">{c}</span>)}
      {children}
    </>
  );
}

export default function Price({ value }: { value: number }) {
  const text = price(value);
  return (
    <span className="pr" aria-label={text}>
      <Cells text={text} />
    </span>
  );
}
