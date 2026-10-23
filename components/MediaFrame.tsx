"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/** A picture that blurs in as it arrives on screen (Cargo's media-item). */
export default function MediaFrame({ src, alt, sizes, priority }: { src: string; alt: string; sizes: string; priority?: boolean }) {
  const el = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!el.current) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setSeen(true); obs.disconnect(); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
    obs.observe(el.current);
    return () => obs.disconnect();
  }, []);
  return (
    <figure className={cn("media-item", seen && "in-view")} ref={el}>
      <span className="mi-frame">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
      </span>
    </figure>
  );
}
