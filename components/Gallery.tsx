"use client";

import Image from "next/image";
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import Icon from "./Icon";
import { imageSrc } from "@/lib/format";
import { cn } from "@/lib/cn";

export interface GalleryHandle {
  step: (dir: number) => void;
}

interface Props {
  images: string[];
  alt: string;
  className?: string;
  sold?: boolean;
  priority?: boolean;
  /** makes the middle of the photo clickable (the detail page opens its fullscreen viewer) */
  onOpen?: () => void;
  onIndexChange?: (index: number) => void;
  /** go back to photo 1 once the gallery scrolls out of view (feed cards) */
  resetWhenOffscreen?: boolean;
  ref?: Ref<GalleryHandle>;
}

const SIZES = "(max-width: 700px) 100vw, 850px";

/** Photo strip: scroll-snap, looping arrows, a counter. Shared by the feed cards and the detail page. */
export default function Gallery({ images, alt, className, sold, priority, onOpen, onIndexChange, resetWhenOffscreen, ref }: Props) {
  const len = images.length;
  const root = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const target = useRef<number | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChange = useRef(onIndexChange);
  useEffect(() => { onChange.current = onIndexChange; });

  const update = useCallback((i: number) => {
    indexRef.current = i;
    setIndex(i);
    onChange.current?.(i);
  }, []);

  const goTo = useCallback((i: number) => {
    const el = strip.current;
    if (!el || len < 2) return;
    const next = (i + len) % len;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    target.current = next;
    update(next);
  }, [len, update]);

  const step = useCallback((dir: number) => {
    const el = strip.current;
    if (!el) return;
    const base = target.current !== null ? target.current : Math.round(el.scrollLeft / el.clientWidth);
    goTo(base + dir);
  }, [goTo]);

  useImperativeHandle(ref, () => ({ step }), [step]);

  /* the browser restores horizontal scroll on back/reload — always start at photo 1 */
  useEffect(() => {
    const el = strip.current;
    if (el && el.scrollLeft) el.scrollTo({ left: 0 });
  }, []);

  useEffect(() => {
    if (!resetWhenOffscreen || !root.current) return;
    const obs = new IntersectionObserver((entries) => {
      for (const en of entries) {
        const el = strip.current;
        if (!en.isIntersecting && el && el.scrollLeft !== 0) {
          target.current = null;
          el.scrollTo({ left: 0 });
          indexRef.current = 0;
          setIndex(0);
        }
      }
    });
    obs.observe(root.current);
    return () => obs.disconnect();
  }, [resetWhenOffscreen]);

  const onScroll = () => {
    const el = strip.current;
    if (!el) return;
    if (target.current === null) {
      const i = Math.min(Math.round(el.scrollLeft / el.clientWidth), len - 1);
      if (i !== indexRef.current) update(i);
    }
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => { target.current = null; }, 150);
  };

  const arrow = (dir: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    step(dir);
  };

  return (
    <div className={cn("gbox", sold && "sold", className)} ref={root}>
      <div className="strip" ref={strip} onScroll={onScroll}>
        {images.map((src, i) => (
          <div className="slide" key={src}>
            <Image
              src={imageSrc(src)}
              alt={i ? `${alt} ${i + 1}` : alt}
              fill
              sizes={SIZES}
              priority={priority && i === 0}
              draggable={false}
            />
          </div>
        ))}
      </div>
      {len > 1 && (
        <>
          <span className="cnav prev" onClick={arrow(-1)}><i className="cbtn"><Icon name="chevron-left" /></i></span>
          <span className="cnav next" onClick={arrow(1)}><i className="cbtn"><Icon name="chevron-right" /></i></span>
          <span className="ccount">{index + 1} / {len}</span>
        </>
      )}
      {onOpen && (
        <div className="gopen" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpen(); }} />
      )}
    </div>
  );
}
