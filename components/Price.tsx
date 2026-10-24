"use client";

import { price } from "@/lib/format";
import { useFavs } from "@/lib/favs";
import { cn } from "@/lib/cn";
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

/** The price block. For a saved home it is blue: the colour means "yours". */
export default function Price({ value, id }: { value: number; id?: string }) {
  const text = price(value);
  const saved = useFavs().includes(id ?? "");
  return (
    <span className={cn("pr", saved && "saved-pr")} aria-label={saved ? `${text}, saved` : text}>
      <Cells text={text} />
    </span>
  );
}
