"use client";

import { usePanel } from "./OverlayShell";

/** "(Close)" / "(Return to homes)": back to the feed exactly as it was. The brackets are plain text. */
export function CloseLink({ children, underline }: { children: string; underline?: boolean }) {
  const { close } = usePanel();
  return <>(<a className={underline ? "ul" : undefined} href="#" rel="close-overlay" onClick={(e) => { e.preventDefault(); close(); }}>{children}</a>)</>;
}
