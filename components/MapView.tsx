"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { STYLE_URL, clusterPoints, tuneStyle } from "@/lib/map";
import { imageSrc, placeLine, price, priceShort } from "@/lib/format";
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

  /* the whole card is the link into the home */
  const preview = useCallback((p: Property) => {
    const wrap = document.createElement("a");
    wrap.className = "map-preview";
    wrap.href = `/homes/${p.slug}`;
    wrap.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      try { sessionStorage.setItem(RETURN_KEY, "1"); } catch {}
      router.push(wrap.getAttribute("href")!);
    });
    const img = document.createElement("img");
    img.src = imageSrc(p.images[0]);
    img.alt = "";
    /* as on the feed: the price block and the place on one line, in the text colour; nothing else */
    const text = document.createElement("div");
    text.innerHTML = '<span class="pr price"></span> <span class="where"></span>';
    text.querySelector(".price")!.textContent = price(p.price);
    text.querySelector(".where")!.textContent = placeLine(p);
    /* the few facts that decide whether to look further, as rows of the details list (only what the record states; a plot that is not stated is left out) */
    const rows: [string, string][] = [];
    if (p.size_m2) rows.push(["Size", p.size_m2 + " m²"]);
    if (p.bedrooms != null) rows.push(["Bedrooms", String(p.bedrooms)]);
    if (p.land_size_m2) rows.push(["Plot", p.land_size_m2.toLocaleString("en-US") + " m²"]);
    if (p.status === "under_offer") rows.push(["Status", "Under offer"]);
    const list = document.createElement("dl");
    list.className = "datalist";
    for (const [k, v] of rows) {
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      dt.textContent = k;
      const dd = document.createElement("dd");
      dd.textContent = v;
      row.append(dt, dd);
      list.appendChild(row);
    }
    if (rows.length) text.appendChild(list);
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
