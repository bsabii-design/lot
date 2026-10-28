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

/** The price block. (`id` is kept for the callers; nothing marks a price any more now that homes cannot be saved.) */
export default function Price({ value }: { value: number; id?: string }) {
  return <span className="pr">{price(value)}</span>;
}
