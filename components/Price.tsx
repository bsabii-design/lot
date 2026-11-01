"use client";

import { price } from "@/lib/format";
import type { ReactNode } from "react";

/** The text of a black block: plain type, the site's own (the price, "View listing" and "Show N homes" are the same material). */
export function Cells({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <>
      {text}
      {children}
    </>
  );
}

/** The price block. `muted`: the home is under offer, so the block is a faded grey instead of the black one. (`id` is kept for the callers.) */
export default function Price({ value, muted }: { value: number; id?: string; muted?: boolean }) {
  return <span className={muted ? "pr muted" : "pr"}>{price(value)}</span>;
}
