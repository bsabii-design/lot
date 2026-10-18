"use client";

import dynamic from "next/dynamic";
import type { Property } from "@/lib/types";

/* WebGL map: client-only, loaded on demand */
const MiniMap = dynamic(() => import("./MiniMap"), { ssr: false, loading: () => <div className="minimap" /> });

export default function MiniMapLazy({ p }: { p: Property }) {
  return <MiniMap p={p} />;
}
