"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { STYLE_URL, clusterPoints, tuneStyle } from "@/lib/map";
import { imageSrc, metaLine, price, priceShort } from "@/lib/format";
import { RETURN_KEY } from "@/lib/cn";
import type { Property } from "@/lib/types";

function bubble(text: string, count = false) {
  const el = document.createElement("div");
  el.className = "bubble" + (count ? " count" : "");
  el.textContent = text;
  return el;
}

/** The overview map: one black bubble per home (its price); homes that would overlap at this zoom merge
    into a round bubble with their count, which zooms in on click. */
export default function MapView({ homes }: { homes: Property[] }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const popup = useRef<maplibregl.Popup | null>(null);
  const homesRef = useRef(homes);

  const preview = useCallback((p: Property) => {
    const wrap = document.createElement("div");
    wrap.className = "map-preview";
    const img = document.createElement("img");
    img.src = imageSrc(p.images[0]);
    img.alt = "";
    const text = document.createElement("div");
    const sub = [p.town + ", " + p.country + (p.approximate_location ? " · approximate" : ""), metaLine(p)].filter(Boolean);
    text.innerHTML = '<span class="price"></span><br><span class="sub"></span><br>';
    text.querySelector(".price")!.textContent = price(p.price);
    text.querySelector(".sub")!.innerHTML = sub.map((s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;")).join("<br>");
    const open = document.createElement("a");
    open.className = "open";
    open.href = `/homes/${p.slug}`;
    open.textContent = "Open →";
    open.addEventListener("click", (e) => {
      e.preventDefault();
      try { sessionStorage.setItem(RETURN_KEY, "1"); } catch {}
      router.push(open.getAttribute("href")!);
    });
    text.appendChild(open);
    wrap.append(img, text);
    return wrap;
  }, [router]);

  const draw = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    markers.current.forEach((m) => m.remove());
    markers.current = [];
    popup.current?.remove();
    const k = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;
    const pts = homesRef.current
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => ({ p, lat: p.lat as number, lng: p.lng as number }));

    for (const g of clusterPoints(map, pts)) {
      if (g.items.length > 1) {
        const el = bubble(String(g.items.length), true);
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const b = new maplibregl.LngLatBounds();
          g.items.forEach((i) => b.extend([i.lng, i.lat]));
          map.fitBounds(b, { padding: 100, maxZoom: 13 });
        });
        markers.current.push(new maplibregl.Marker({ element: el }).setLngLat(map.unproject([g.x, g.y])).addTo(map));
        continue;
      }
      const { p, lng, lat } = g.items[0];
      const el = bubble(priceShort(p.price));
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        popup.current?.remove();
        const pop = new maplibregl.Popup({ closeButton: false, className: "lot-popup", offset: 16 * k, maxWidth: "none" })
          .setLngLat([lng, lat])
          .setDOMContent(preview(p))
          .addTo(map);
        el.classList.add("on");
        pop.on("close", () => el.classList.remove("on"));
        popup.current = pop;
      });
      markers.current.push(new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map));
    }
  }, [preview]);

  const fit = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const pts = homesRef.current.filter((p) => p.lat != null && p.lng != null);
    if (pts.length) {
      const b = new maplibregl.LngLatBounds();
      pts.forEach((p) => b.extend([p.lng as number, p.lat as number]));
      map.fitBounds(b, { padding: 80, maxZoom: 9, animate: false });
    } else map.jumpTo({ center: [2.4, 46.6], zoom: 6 });
    draw();
  }, [draw]);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: box.current!,
      style: STYLE_URL,
      attributionControl: { compact: false },
      dragRotate: false,
      pitchWithRotate: false,
      center: [2.4, 46.6],
      zoom: 5,
    });
    map.touchZoomRotate.disableRotation();
    tuneStyle(map);
    map.on("zoomend", draw);
    mapRef.current = map;
    fit();
    return () => {
      markers.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [draw, fit]);

  useEffect(() => {
    homesRef.current = homes;
    fit();
  }, [homes, fit]);

  return <div className="map" ref={box} />;
}
