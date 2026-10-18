import type { Map as MapLibreMap, ExpressionSpecification } from "maplibre-gl";

/* Free vector basemap: OpenFreeMap (no key, no limits, commercial use allowed; attribution required). */
export const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/* The look of the reference map Sabina picked: very light and low-contrast, land #f0f0f0, buildings #e7e7e7,
   water/ponds #e1e5e6, roads plain white without casings. The stock style is tinted blue-grey, so every colour
   first loses its tint (greyMap), then the reference colours are set per layer (paintMap). */

const LABEL_GREY: Record<string, string> = {
  label_country_1: "#999999", label_country_2: "#999999", label_country_3: "#999999",
  label_state: "#8a8a8a", label_other: "#777777",
  label_city: "#3d3d3d", label_city_capital: "#3d3d3d", label_town: "#4f4f4f", label_village: "#616161",
};

const zoomRamp = (...stops: number[]): ExpressionSpecification =>
  ["interpolate", ["linear"], ["zoom"], ...stops] as ExpressionSpecification;

/* regular-weight sizes by zoom: quiet, closer to the site's text than to a map UI */
const LABEL_SIZE: Record<string, ExpressionSpecification> = {
  label_country_1: zoomRamp(2, 12, 6, 16), label_country_2: zoomRamp(2, 12, 6, 15), label_country_3: zoomRamp(2, 11, 6, 14),
  label_state: zoomRamp(4, 11, 8, 13),
  label_city_capital: zoomRamp(4, 12, 12, 17), label_city: zoomRamp(4, 12, 12, 17),
  label_town: zoomRamp(6, 12, 13, 15), label_village: zoomRamp(8, 11.5, 14, 14), label_other: zoomRamp(8, 11.5, 14, 13),
};

function greyMap(map: MapLibreMap) {
  const ctx = document.createElement("canvas").getContext("2d")!;
  const grey = (str: string) => {
    ctx.fillStyle = "#000";
    ctx.fillStyle = str;
    const c = ctx.fillStyle as string;
    let r: number, g: number, b: number, a = 1;
    if (c[0] === "#") {
      r = parseInt(c.slice(1, 3), 16); g = parseInt(c.slice(3, 5), 16); b = parseInt(c.slice(5, 7), 16);
    } else {
      const m = (c.match(/[\d.]+/g) || []).map(Number);
      [r, g, b] = m;
      if (m.length > 3) a = m[3];
    }
    const y = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    return `rgba(${y},${y},${y},${a})`;
  };
  const walk = (v: unknown): unknown =>
    typeof v === "string" ? (/^(#|rgb|hsl)/i.test(v) ? grey(v) : v) : Array.isArray(v) ? v.map(walk) : v;
  for (const layer of map.getStyle().layers) {
    for (const prop of Object.keys((layer as { paint?: object }).paint || {})) {
      if (/color$/.test(prop)) map.setPaintProperty(layer.id, prop, walk(map.getPaintProperty(layer.id, prop)));
    }
  }
}

function paintMap(map: MapLibreMap) {
  const LAND = "#f0f0f0", WHITE = "#ffffff", CASING = "#e7e7e7";
  const set = (id: string, prop: string, v: unknown) => { if (map.getLayer(id)) map.setPaintProperty(id, prop, v); };
  set("background", "background-color", LAND);
  set("water", "fill-color", "#e1e5e6");
  set("waterway", "line-color", "#d6dbdc");
  set("park", "fill-color", "#e7e8e7");
  set("landcover_wood", "fill-color", "#e6e7e6");
  set("landuse_residential", "fill-color", "#ececec");
  set("building", "fill-color", "#e7e7e7");
  set("building", "fill-outline-color", "#e0e0e0");
  set("road_area_pier", "fill-color", LAND);
  set("road_pier", "line-color", LAND);
  for (const id of ["highway_minor", "highway_major_inner", "highway_motorway_inner", "highway_motorway_bridge_inner", "tunnel_motorway_inner", "aeroway-runway", "aeroway-area"])
    set(id, id === "aeroway-area" ? "fill-color" : "line-color", WHITE);
  set("highway_path", "line-color", "#fafafa");
  for (const id of ["highway_major_casing", "highway_motorway_casing", "highway_motorway_bridge_casing", "tunnel_motorway_casing", "aeroway-taxiway", "aeroway-runway-casing"])
    set(id, "line-color", CASING);
  for (const id of ["highway_major_subtle", "highway_motorway_subtle"]) set(id, "line-color", "rgba(255,255,255,0.55)");
  for (const id of ["railway", "railway_service", "railway_transit"]) set(id, "line-color", "#e2e2e2");
  for (const id of ["railway_dashline", "railway_service_dashline", "railway_transit_dashline"]) set(id, "line-color", "#f6f6f6");
  for (const id of ["boundary_2", "boundary_3", "boundary_disputed"]) set(id, "line-color", "#c2c2c2");
  for (const layer of map.getStyle().layers) if (layer.type === "symbol") set(layer.id, "text-halo-color", "rgba(240,240,240,0.85)");
  for (const id of ["highway-name-path", "highway-name-minor", "highway-name-major", "airport", "waterway_line_label", "water_name_point_label", "water_name_line_label"])
    set(id, "text-color", "#777777");
}

/** Make the stock Positron style look like LOT: Times-like labels (self-hosted Tinos), quiet greys. */
export function tuneStyle(map: MapLibreMap) {
  const apply = () => {
    /* the glyph server only has Noto Sans: serve our own Tinos (Times-compatible) so labels match the site */
    map.setGlyphs(location.origin + "/fonts/{fontstack}/{range}.pbf");
    for (const layer of map.getStyle().layers) {
      if (layer.type !== "symbol" || !map.getLayoutProperty(layer.id, "text-field")) continue;
      const f = JSON.stringify(map.getLayoutProperty(layer.id, "text-font") || "");
      map.setLayoutProperty(layer.id, "text-font", [/Italic/.test(f) ? "Tinos Italic" : "Tinos Regular"]);
      if (LABEL_SIZE[layer.id]) map.setLayoutProperty(layer.id, "text-size", LABEL_SIZE[layer.id]);
    }
    /* regions: quiet italic in normal case instead of spaced capitals */
    if (map.getLayer("label_state")) {
      map.setLayoutProperty("label_state", "text-font", ["Tinos Italic"]);
      map.setLayoutProperty("label_state", "text-transform", "none");
      map.setLayoutProperty("label_state", "text-letter-spacing", 0);
    }
    for (const [id, c] of Object.entries(LABEL_GREY)) if (map.getLayer(id)) map.setPaintProperty(id, "text-color", c);
    greyMap(map);
    paintMap(map);
  };
  if (map.isStyleLoaded()) apply();
  else map.once("style.load", apply);
}

/** A circle of `radius` metres as a GeoJSON polygon (for the "approximate location" area). */
export function circlePolygon(lng: number, lat: number, radius: number, steps = 64): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const dLat = radius / 111320;
  const dLng = radius / (111320 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    coords.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [coords] } };
}

/** Group points whose bubbles would overlap at the current zoom (pixel boxes ~64x30px at design size). */
export function clusterPoints<T extends { lng: number; lat: number }>(map: MapLibreMap, points: T[]) {
  const k = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1;
  const z = map.getZoom();
  const groups: { x: number; y: number; items: T[] }[] = [];
  for (const p of points) {
    const pt = map.project([p.lng, p.lat]);
    const g = z < 13 && groups.find((q) => Math.abs(q.x - pt.x) < 64 * k && Math.abs(q.y - pt.y) < 30 * k);
    if (g) {
      g.items.push(p);
      const n = g.items.length;
      g.x += (pt.x - g.x) / n;
      g.y += (pt.y - g.y) / n;
    } else groups.push({ x: pt.x, y: pt.y, items: [p] });
  }
  return groups;
}
