"use client";

import { toggleFav, useFavs } from "@/lib/favs";
import { cn } from "@/lib/cn";

/** "(Save)" / "(Saved)": the word is the link, the brackets are plain text (as in the Cargo layout). */
export default function SaveButton({ id }: { id: string }) {
  const on = useFavs().includes(id);
  return (
    <>
      (<button
        className={cn("lk ul", on && "saved")}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleFav(id);
        }}
      >
        {on ? "Saved" : "Save"}
      </button>)
    </>
  );
}
