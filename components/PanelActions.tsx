"use client";

import { useEffect, useRef, useState } from "react";
import SaveButton from "./SaveButton";
import { CloseLink } from "./PanelLinks";

/** The two buttons of a home's header. On a wide screen: "(Save)  (Close)" in the line. On a phone there is no room beside the price and the place,
    so they go (with "(Share)") behind one "…" button that opens a small list under it (Esc, a tap outside or "(Close)" shuts it). The page picks which of the two
    is shown (`.mobile` in the CSS), so the markup is the same on the server and in the browser. */
export default function PanelActions({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: Event) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  /* the phone's own share sheet; where there is none, the link goes to the clipboard */
  const share = async () => {
    const url = location.origin + location.pathname;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <>
      <div className="ui cg-actions-inline"><SaveButton id={id} /> &nbsp;<CloseLink>Close</CloseLink></div>
      <div className="ui cg-actions-menu" ref={box}>
        <button className="cg-more" aria-label="More" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.9" /><circle cx="12" cy="12" r="1.9" /><circle cx="19" cy="12" r="1.9" /></svg>
        </button>
        {open && (
          <div className="cg-menu" role="group">
            <div><SaveButton id={id} /></div>
            <div>(<button className="lk ul" onClick={share}>{copied ? "Link copied" : "Share"}</button>)</div>
            <div><CloseLink>Close</CloseLink></div>
          </div>
        )}
      </div>
    </>
  );
}
