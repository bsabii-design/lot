"use client";

import { useEffect, useRef, useState } from "react";
import Gallery, { type GalleryHandle } from "./Gallery";
import Icon from "./Icon";
import { imageSrc } from "@/lib/format";

/** The home's photos, plus the fullscreen viewer that opens from the middle of the photo. */
export default function DetailGallery({ images, title, sold }: { images: string[]; title: string; sold: boolean }) {
  const gallery = useRef<GalleryHandle>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") gallery.current?.step(-1);
      if (e.key === "ArrowRight") gallery.current?.step(1);
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <Gallery ref={gallery} images={images} alt={title} sold={sold} priority onOpen={() => setOpen(true)} onIndexChange={setIndex} />
      {open && (
        <div className="lightbox">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageSrc(images[index])} alt={title} />
          <div className="lnav prev" onClick={() => gallery.current?.step(-1)}><i className="cbtn"><Icon name="chevron-left" /></i></div>
          <div className="lnav next" onClick={() => gallery.current?.step(1)}><i className="cbtn"><Icon name="chevron-right" /></i></div>
          <button className="lclose bk" onClick={() => setOpen(false)}>Close</button>
          <span className="lcount">{index + 1} / {images.length}</span>
        </div>
      )}
    </>
  );
}
