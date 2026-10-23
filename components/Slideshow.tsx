"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { imageSrc } from "@/lib/format";
import { cn } from "@/lib/cn";

const SIZES = "(max-aspect-ratio: 4/5) 100vw, 50vw";
const SPEED = 0.5;

/** Distance of slide k from the current one, the short way round (the strip loops). */
function offset(n: number, k: number, i: number) {
  let d = (((k - i) % n) + n) % n;
  if (d > n / 2) d -= n;
  return d;
}

/** The feed's photos, the way the Cargo layout does it: slides travel sideways and loop, the left / right half of the
    photo goes back / forward (cursor arrows), round arrow buttons on touch screens (and on hover), swipe, ← →,
    and a "01 / 08" caption under the photo that stays put. */
export default function Slideshow({ images, alt, priority, href }: { images: string[]; alt: string; priority?: boolean; href?: string }) {
  const n = images.length;
  const [cur, setCur] = useState(0);
  const [warm, setWarm] = useState(false);
  const slides = useRef<(HTMLDivElement | null)[]>([]);
  const state = useRef({ cur: 0, busy: false });
  const prev = useRef<number[] | null>(null);

  /* imperative like the original: the transform of every slide is set directly, wrapping slides jump instead of sliding */
  const place = (i: number, animate: boolean) => {
    const last = prev.current ?? [];
    const next: number[] = [];
    slides.current.forEach((s, k) => {
      if (!s) return;
      const d = offset(n, k, i);
      const wraps = last[k] !== undefined && Math.abs(d - last[k]) > 1;
      s.style.transition = !animate || wraps ? "none" : "";
      s.style.transform = `translate3d(${d * 100}%,0,0)`;
      s.style.visibility = Math.abs(d) > 1 ? "hidden" : "visible";
      s.setAttribute("aria-hidden", d === 0 ? "false" : "true");
      next[k] = d;
    });
    prev.current = next;
    if (animate) {
      void slides.current[0]?.offsetWidth;
      slides.current.forEach((s) => { if (s) s.style.transition = ""; });
    }
  };

  const reduce = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const go = (delta: number) => {
    if (n < 2 || state.current.busy) return;
    setWarm(true);
    state.current.busy = true;
    state.current.cur = (((state.current.cur + delta) % n) + n) % n;
    place(state.current.cur, !reduce());
    setCur(state.current.cur);
    setTimeout(() => { state.current.busy = false; }, reduce() ? 0 : SPEED * 1000 * 0.6);
  };
  const touch = () => document.documentElement.classList.contains("mobile");

  /* back to photo 1 once the card scrolls out of view */
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current) return;
    const obs = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (!en.isIntersecting && state.current.cur !== 0) {
          state.current.cur = 0;
          place(0, false);
          setCur(0);
        }
      }
    });
    obs.observe(root.current);
    return () => obs.disconnect();
    // place only reads refs and n
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* the first picture blurs in when it arrives on screen */
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!root.current) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setSeen(true); obs.disconnect(); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    obs.observe(root.current);
    return () => obs.disconnect();
  }, []);

  const swipe = useRef<{ x: number; y: number } | null>(null);

  return (
    <div className={cn("ss", n < 2 && "single", href && "has-open")} ref={root} onPointerEnter={() => setWarm(true)}>
      <div
        className="ss-view"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={alt}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
          if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
        }}
        onPointerDown={(e) => { if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={(e) => {
          const s = swipe.current;
          swipe.current = null;
          if (!s) return;
          const dx = e.clientX - s.x, dy = e.clientY - s.y;
          if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => { swipe.current = null; }}
      >
        {images.map((src, k) => {
          const d = offset(n, k, 0);
          return (
            <div
              className="ss-slide"
              key={src}
              ref={(el) => { slides.current[k] = el; }}
              style={{ transform: `translate3d(${d * 100}%,0,0)`, visibility: Math.abs(d) > 1 ? "hidden" : "visible" }}
              aria-hidden={k !== 0}
            >
              <figure className={cn("ss-item media-item", k === 0 && seen && "in-view")}>
                <span className="mi-frame">
                  <Image
                    src={imageSrc(src)}
                    alt={k ? `${alt} ${k + 1}` : alt}
                    fill
                    sizes={SIZES}
                    priority={priority && k === 0}
                    loading={k === 0 || warm ? "eager" : "lazy"}
                    draggable={false}
                  />
                </span>
              </figure>
            </div>
          );
        })}
        {href && <Link className="ss-open" href={href} scroll={false} aria-label={`Open ${alt}`} />}
        {n > 1 && (
          <>
            <div className="ss-zone-l" onClick={() => { if (!touch()) go(-1); }} />
            <div className="ss-zone-r" onClick={() => { if (!touch()) go(1); }} />
            <button className="ss-btn prev" aria-label="Previous photo" onClick={() => go(-1)}>
              <svg viewBox="0 0 30 30" aria-hidden="true"><path d="M17.5 9.5 12 15l5.5 5.5" /></svg>
            </button>
            <button className="ss-btn next" aria-label="Next photo" onClick={() => go(1)}>
              <svg viewBox="0 0 30 30" aria-hidden="true"><path d="M12.5 9.5 18 15l-5.5 5.5" /></svg>
            </button>
          </>
        )}
      </div>
      <span className="ss-cap ui" aria-live="polite">{n > 1 ? `${String(cur + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}` : ""}</span>
    </div>
  );
}
