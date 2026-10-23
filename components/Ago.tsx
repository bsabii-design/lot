"use client";

import { useSyncExternalStore } from "react";
import { ago } from "@/lib/format";

const never = () => () => {};

/** "1 month ago", computed in the browser so a statically built page never shows a stale age. */
export default function Ago({ date, prefix = "" }: { date: string; prefix?: string }) {
  const text = useSyncExternalStore(never, () => ago(date), () => "");
  return <span className="posted">{text && prefix + text}</span>;
}
