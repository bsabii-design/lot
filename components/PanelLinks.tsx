"use client";

import { usePanel } from "./OverlayShell";

/** "(Close)" / "(Return to homes)": back to the feed exactly as it was. */
export function CloseLink({ children }: { children: string }) {
  const { close } = usePanel();
  return (
    <button className="bk content on" onClick={close}>{children}</button>
  );
}

/** #tags on a home: close the panel and ask the feed to filter by it (on a direct visit the feed reads it from the URL). */
export function TagLink({ kind, value }: { kind: "type" | "condition"; value: string }) {
  const { close, modal } = usePanel();
  const text = "#" + value.toLowerCase();
  return (
    <a
      className="tag"
      href={`/?${kind === "type" ? "t" : "c"}=${encodeURIComponent(value)}`}
      onClick={(e) => {
        if (!modal) return;
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("lot:tag", { detail: { kind, value } }));
        close();
      }}
    >
      <span className="lab" data-t={text}>{text}</span>
    </a>
  );
}
