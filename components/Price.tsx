"use client";

import { price } from "@/lib/format";
import { useFavs } from "@/lib/favs";
import { cn } from "@/lib/cn";
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

/** The price block. For a saved home it is blue: the colour means "yours". */
export default function Price({ value, id }: { value: number; id?: string }) {
  const text = price(value);
  const saved = useFavs().includes(id ?? "");
  return (
    <span className={cn("pr", saved && "saved-pr")} aria-label={saved ? `${text}, saved` : text}>
      {text}
    </span>
  );
}
