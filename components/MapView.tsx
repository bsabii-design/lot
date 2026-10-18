"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { STYLE_URL, clusterPoints, tuneStyle } from "@/lib/map";
import { imageSrc, metaLine, price, priceShort } from "@/lib/format";
import { RETURN_KEY } from "@/lib/cn";
import regionsData from "@/data/regions.json";
import type { Property } from "@/lib/types";

function bubble(text: string, count = false) {
  const el = document.createElement("div");
  el.className = "bubble" + (count ? " count" : "");
  el.textContent = text;
  return el;
}

/** The overview map: one black bubble per home (its price); homes that would overlap at this zoom merge
    into a round bubble with their count, which zooms in on click. */
type Ring = number[][];
const REGIONS = regionsData as unknown as GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, { nom: string }>;

/** Bounds of the named regions together (so the whole region is on screen). */
function regionBounds(names: string[]) {
  const b = new maplibregl.LngLatBounds();
  for (const f of REGIONS.features) {
    if (!names.includes(f.properties.nom)) continue;
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    for (const poly of polys) for (const ring of poly as Ring[]) for (const [lng, lat] of ring) b.extend([lng, lat]);
  }
  return b;
}

export default function MapView({ homes, regions, windowOpen }: { homes: Property[]; regions: string[]; windowOpen: boolean }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const popup = useRef<maplibregl.Popup | null>(null);
  const homesRef = useRef(homes);
  const regionsRef = useRef(regions);
  const windowOpenRef = useRef(windowOpen);

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
    if (regionsRef.current.length) {
      /* a chosen region is shown whole, so the visitor sees where it is */
      /* with the filter window open, frame the region in the free space to the right of it (if there is room) */
      let padding: maplibregl.PaddingOptions | number = 80;
      const win = windowOpenRef.current ? document.getElementById("filter-window")?.getBoundingClientRect() : null;
      if (win) {
        const left = win.right + 32;
        if (window.innerWidth - left - 32 >= 220) padding = { top: 80, bottom: 80, left, right: 32 };
      }
      map.fitBounds(regionBounds(regionsRef.current), { padding, animate: false });
    } else if (pts.length) {
      const b = new maplibregl.LngLatBounds();
      pts.forEach((p) => b.extend([p.lng as number, p.lat as number]));
      map.fitBounds(b, { padding: 80, maxZoom: 9, animate: false });
    } else map.jumpTo({ center: [2.4, 46.6], zoom: 6 });
    draw();
  }, [draw]);

  /* the chosen regions: an outline and a faint tint, so the visitor sees where Normandy or Brittany is */
  const showRegions = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("regions")) return;
    const filter = ["in", ["get", "nom"], ["literal", regionsRef.current]] as maplibregl.FilterSpecification;
    map.setFilter("region-fill", filter);
    map.setFilter("region-line", filter);
  }, []);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: box.current!,
      style: STYLE_URL,
      attributionControl: { compact: false, customAttribution: "Régions: IGN / Etalab" },
      dragRotate: false,
      pitchWithRotate: false,
      center: [2.4, 46.6],
      zoom: 5,
    });
    map.touchZoomRotate.disableRotation();
    tuneStyle(map);
    map.on("zoomend", draw);
    map.on("load", () => {
      const firstLabel = map.getStyle().layers.find((l) => l.type === "symbol")?.id;
      map.addSource("regions", { type: "geojson", data: REGIONS });
      map.addLayer({ id: "region-fill", type: "fill", source: "regions", paint: { "fill-color": "#0a0a0a", "fill-opacity": 0.05 } }, firstLabel);
      map.addLayer({
        id: "region-line", type: "line", source: "regions",
        layout: { "line-join": "round" },
        paint: { "line-color": "#0a0a0a", "line-opacity": 0.7, "line-width": 1.5 },
      }, firstLabel);
      showRegions();
    });
    mapRef.current = map;
    fit();
    return () => {
      markers.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [draw, fit, showRegions]);

  useEffect(() => {
    homesRef.current = homes;
    regionsRef.current = regions;
    windowOpenRef.current = windowOpen;
    showRegions();
    fit();
  }, [homes, regions, windowOpen, fit, showRegions]);

  return <div className="map" ref={box} />;
}
