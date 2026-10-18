"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { STYLE_URL, circlePolygon, tuneStyle } from "@/lib/map";
import type { Property } from "@/lib/types";

/** The small map on a home's page: one black dot, plus a 3 km circle when the location is only approximate. */
export default function MiniMap({ p }: { p: Property }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (p.lat == null || p.lng == null) return;
    const map = new maplibregl.Map({
      container: box.current!,
      style: STYLE_URL,
      center: [p.lng, p.lat],
      zoom: 10,
      attributionControl: { compact: false },
      dragRotate: false,
      pitchWithRotate: false,
      scrollZoom: false,
    });
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    tuneStyle(map);

    /* trackpad pinch (wheel + ctrl) zooms; a plain two-finger scroll keeps scrolling the page */
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        map.zoomTo(map.getZoom() + (e.deltaY < 0 ? 1 : -1));
      }
    };
    map.getContainer().addEventListener("wheel", onWheel, { passive: false });

    const el = document.createElement("div");
    el.className = "bubble dot";
    el.style.pointerEvents = "none";
    new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);

    if (p.approximate_location) {
      /* the 3 km circle only reads from zoom 10 on — hidden further out */
      map.on("load", () => {
        map.addSource("area", { type: "geojson", data: circlePolygon(p.lng as number, p.lat as number, 3000) });
        map.addLayer({ id: "area-fill", type: "fill", source: "area", minzoom: 10, paint: { "fill-color": "#0a0a0a", "fill-opacity": 0.08 } });
        map.addLayer({ id: "area-line", type: "line", source: "area", minzoom: 10, paint: { "line-color": "#0a0a0a", "line-opacity": 0.5, "line-width": 1 } });
      });
    }
    return () => map.remove();
  }, [p]);

  return (
    <div className="minimap">
      <div ref={box} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
