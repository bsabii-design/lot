"use client";

import { usePanel } from "./OverlayShell";

/** "(Close)": back to the feed exactly as it was. The brackets are plain text. */
export function CloseLink({ children }: { children: string }) {
  const { close } = usePanel();
  return <>(<a href="#" rel="close-overlay" onClick={(e) => { e.preventDefault(); close(); }}>{children}</a>)</>;
}
