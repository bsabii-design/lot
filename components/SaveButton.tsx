"use client";

import { toggleFav, useFavs } from "@/lib/favs";
import { cn } from "@/lib/cn";

export default function SaveButton({ id }: { id: string }) {
  const on = useFavs().includes(id);
  return (
    <button
      className={cn("btn fav", on && "on")}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFav(id);
      }}
    >
      {on ? "Saved" : "Save"}
    </button>
  );
}
