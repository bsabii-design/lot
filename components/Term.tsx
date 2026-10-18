"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { GlossaryEntry } from "@/lib/glossary";

/** A French word in a description: dotted underline, and its definition on hover (or on tap / keyboard focus). */
export default function Term({ entry, children, focusable }: { entry: GlossaryEntry; children: ReactNode; focusable?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const word = useRef<HTMLSpanElement>(null);
  const tip = useRef<HTMLSpanElement>(null);
  const id = useId();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keep = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setOpen(true); };
  /* a short delay lets the mouse cross the gap onto the card, so its source link can be clicked */
  const closeSoon = () => { closeTimer.current = setTimeout(() => setOpen(false), 150); };

  /* measuring the rendered tip: keep it inside the window */
  useLayoutEffect(() => {
    if (!open || !word.current || !tip.current) { setPos(null); return; }
    const r = word.current.getBoundingClientRect();
    const t = tip.current.getBoundingClientRect();
    const left = Math.max(12, Math.min(r.left + r.width / 2 - t.width / 2, window.innerWidth - t.width - 12));
    const above = r.top - t.height - 8;
    setPos({ left, top: above >= 8 ? above : r.bottom + 8 });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const away = (e: Event) => { if (!word.current?.contains(e.target as Node)) close(); };
    window.addEventListener("scroll", close, true);
    document.addEventListener("pointerdown", away);
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("scroll", close, true);
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <>
      <span
        ref={word}
        className="term"
        tabIndex={focusable ? 0 : undefined}
        aria-describedby={open ? id : undefined}
        onPointerEnter={(e) => { if (e.pointerType === "mouse") keep(); }}
        onPointerLeave={(e) => { if (e.pointerType === "mouse") closeSoon(); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          /* a tap on a phone shows the definition; inside a card it must not also open the home */
          if ((e.nativeEvent as PointerEvent).pointerType === "touch") {
            e.preventDefault();
            e.stopPropagation();
            setOpen((o) => !o);
          }
        }}
      >
        {children}
      </span>
      {open &&
        createPortal(
          <span
            ref={tip}
            id={id}
            role="tooltip"
            className="term-tip"
            style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, visibility: pos ? "visible" : "hidden" }}
            onPointerEnter={(e) => { if (e.pointerType === "mouse") keep(); }}
            onPointerLeave={(e) => { if (e.pointerType === "mouse") closeSoon(); }}
          >
            <strong>{entry.term}</strong>
            {entry.definition}
            <a className="src" href={entry.source.url} target="_blank" rel="noopener">
              {entry.source.name} · {entry.source.licence}
            </a>
          </span>,
          document.body,
        )}
    </>
  );
}
