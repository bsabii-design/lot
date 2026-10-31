"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/** The map's credits, which the licences of the map data require: a quiet "(Credits)" in the site's own style that opens the line, and "(Close)" that folds it again. */
export default function MapCredits({ regions, className }: { regions?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("map-credits", className)}>
      {open && (
        <span className="credit-line">
          {regions && <>Régions: IGN / Etalab &middot; </>}
          <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a>{" "}
          <a href="https://openmaptiles.org" target="_blank" rel="noopener">&copy; OpenMapTiles</a>{" "}
          Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>
        </span>
      )}
      <button className="bk" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? "Close" : "Credits"}</button>
    </div>
  );
}
