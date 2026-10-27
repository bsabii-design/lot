"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import MediaFrame from "./MediaFrame";
import Slideshow from "./Slideshow";
import { imageSrc } from "@/lib/format";

/** The photos of an open home, one under another (a slider on a phone); a click on one opens it on the full screen. What follows them
    (the map, a note) is passed as children and scrolls with them. */
export default function PhotoColumn({ images, title, children }: { images: string[]; title: string; children?: ReactNode }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="cg-grid cg-photos">
      {/* on a phone the photos are one slider (the CSS hides the stack there, and the slider on a wide screen), not a page eight photos long */}
      <div className="cg-slider"><Slideshow images={images} alt={title} onOpen={(i) => setOpen(i)} /></div>
      {images.map((src, i) => (
        <MediaFrame key={src} src={imageSrc(src)} alt={i ? `${title} ${i + 1}` : title} sizes="(max-aspect-ratio: 4/5) 100vw, 38vw" priority={i === 0} onOpen={() => setOpen(i)} />
      ))}
      {children}
      {open !== null && <Lightbox images={images} title={title} start={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

/** Full screen, on black. ← → and the left / right third of the screen turn the page, Esc or (Close) goes back to the home. */
function Lightbox({ images, title, start, onClose }: { images: string[]; title: string; start: number; onClose: () => void }) {
  const n = images.length;
  const [i, setI] = useState(start);
  const step = useCallback((d: number) => setI((c) => (c + d + n) % n), [n]);

  useEffect(() => {
    /* capture on window: Esc closes only the viewer, not the panel under it */
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopImmediatePropagation(); onClose(); }
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose, step]);

  return createPortal(
    <div
      className="cg-lb"
      role="dialog"
      aria-label={`${title}, photo ${i + 1} of ${n}`}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => { if (e.target === e.currentTarget || (e.target as Element).tagName === "IMG") onClose(); }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSrc(images[i])} alt={i ? `${title} ${i + 1}` : title} draggable={false} />
      {n > 1 && (
        <>
          <div className="zl" onClick={() => step(-1)} />
          <div className="zr" onClick={() => step(1)} />
          <button className="lb-btn prev" aria-label="Previous photo" onClick={() => step(-1)}>
            <svg viewBox="0 0 30 30" aria-hidden="true"><path d="M17.5 9.5 12 15l5.5 5.5" /></svg>
          </button>
          <button className="lb-btn next" aria-label="Next photo" onClick={() => step(1)}>
            <svg viewBox="0 0 30 30" aria-hidden="true"><path d="M12.5 9.5 18 15l-5.5 5.5" /></svg>
          </button>
        </>
      )}
      <button className="lb-close" onClick={onClose}>(Close)</button>
      <span className="lb-count">{String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
    </div>,
    document.body,
  );
}
