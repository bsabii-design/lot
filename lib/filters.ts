import type { Filters, Property, Range, Tab } from "./types";
import { archived } from "./format";
import { regionLabel } from "./regions";

export const BEDROOMS: [string, string][] = [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4+"]];
export const CONDITIONS = ["Move-in ready", "Needs some work", "Renovation project"];

type Preset = [key: string, label: string, test: (v: number) => boolean];

/* quick ranges (one tap); several can be picked at once, and "Custom" takes exact numbers */
export const PRICE_PRESETS: Preset[] = [
  ["u80", "Under €80k", (v) => v < 80000],
  ["80-100", "€80–100k", (v) => v >= 80000 && v <= 100000],
  ["100-125", "€100–125k", (v) => v > 100000 && v <= 125000],
  ["125-150", "€125–150k", (v) => v > 125000],
];
export const SIZE_PRESETS: Preset[] = [
  ["u70", "Under 70 m²", (v) => v < 70],
  ["70-100", "70–100 m²", (v) => v >= 70 && v <= 100],
  ["100-150", "100–150 m²", (v) => v > 100 && v <= 150],
  ["150+", "150+ m²", (v) => v > 150],
];

export const emptyRange = (): Range => ({ presets: [], min: "", max: "" });
export const emptyFilters = (): Filters => ({
  types: [], conditions: [], settings: [], regions: [], bedrooms: [], price: emptyRange(), size: emptyRange(),
});

export const SET_KEYS = ["types", "conditions", "settings", "regions", "bedrooms"] as const;
export type SetKey = (typeof SET_KEYS)[number];

export function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function inRange(value: number, r: Range) {
  if (r.min !== "" && value < +r.min) return false;
  if (r.max !== "" && value > +r.max) return false;
  return true;
}

/* quick ranges win when picked; otherwise the typed from–to applies */
function rangeOk(value: number, r: Range, presets: Preset[]) {
  if (r.presets.length) return presets.some(([k, , test]) => r.presets.includes(k) && test(value));
  return inRange(value, r);
}

export function visible(all: Property[], tab: Tab, favs: string[], f: Filters) {
  return all.filter((p) => {
    if (tab === "favourites" && !favs.includes(p.id)) return false;
    if (tab === "archive" && !archived(p)) return false;
    if (tab === "all" && archived(p)) return false;

    if (f.types.length && !f.types.includes(p.property_type)) return false;
    if (f.conditions.length && !f.conditions.includes(p.condition)) return false;
    if (f.settings.length && !f.settings.includes(p.setting)) return false;
    if (f.regions.length && !f.regions.includes(p.region)) return false;
    if (f.bedrooms.length) {
      const b = p.bedrooms || 0;
      if (!(f.bedrooms.includes(String(b)) || (b >= 4 && f.bedrooms.includes("4")))) return false;
    }
    if (!rangeOk(p.price, f.price, PRICE_PRESETS)) return false;
    if (!rangeOk(p.size_m2 || 0, f.size, SIZE_PRESETS)) return false;
    return true;
  });
}

export interface Facet {
  name: string;
  value: string;
  /** a copy of the filters with this facet switched off */
  off: (f: Filters) => Filters;
}

/** The active facets: a name, the chosen values spelled out, and a way to switch each one off. */
export function activeFacets(f: Filters): Facet[] {
  const out: Facet[] = [];
  const money = (v: string) => "€" + (+v >= 1000 && +v % 1000 === 0 ? +v / 1000 + "k" : (+v).toLocaleString("en-US"));
  const range = (r: Range, fmt: (v: string) => string, unit: string) => {
    if (r.min !== "" && r.max !== "") return fmt(r.min) + "–" + fmt(r.max) + unit;
    if (r.max !== "") return "under " + fmt(r.max) + unit;
    return "from " + fmt(r.min) + unit;
  };
  const setFacet = (key: SetKey, name: string, show: (v: string) => string = (v) => v) => {
    if (f[key].length) out.push({ name, value: f[key].map(show).join(", "), off: (x) => ({ ...x, [key]: [] }) });
  };
  const rangeFacet = (key: "price" | "size", name: string, presets: Preset[], fmt: (v: string) => string, unit: string) => {
    const r = f[key];
    if (r.presets.length) {
      out.push({
        name,
        value: presets.filter(([k]) => r.presets.includes(k)).map(([, l]) => l).join(", "),
        off: (x) => ({ ...x, [key]: { ...x[key], presets: [] } }),
      });
    } else if (r.min !== "" || r.max !== "") {
      out.push({ name, value: range(r, fmt, unit), off: (x) => ({ ...x, [key]: { ...x[key], min: "", max: "" } }) });
    }
  };

  setFacet("types", "Type");
  setFacet("conditions", "Condition");
  if (f.bedrooms.length) {
    out.push({
      name: "Bedrooms",
      value: BEDROOMS.filter(([k]) => f.bedrooms.includes(k)).map(([, l]) => l).join(", "),
      off: (x) => ({ ...x, bedrooms: [] }),
    });
  }
  rangeFacet("price", "Price", PRICE_PRESETS, money, "");
  rangeFacet("size", "Size", SIZE_PRESETS, (v) => v, " m²");
  setFacet("regions", "Region", regionLabel);
  setFacet("settings", "Setting");
  return out;
}

export function filterOptions(all: Property[]) {
  const uniq = (pick: (p: Property) => string) => [...new Set(all.map(pick))].filter(Boolean).sort();
  return {
    types: uniq((p) => p.property_type),
    conditions: CONDITIONS,
    settings: uniq((p) => p.setting),
    regions: uniq((p) => p.region),
  };
}
