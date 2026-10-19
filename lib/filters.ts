import type { Filters, NumRange, Property, Tab } from "./types";
import { archived } from "./format";
import { regionLabel } from "./regions";
import {
  AREA_PRESETS, BEDROOM_PRESETS, CONDITIONS, FEATURES, LANDSCAPES, OUTDOOR, PRICE_PRESETS, SETTLEMENTS, TYPES,
  conditionOf, type Option,
} from "./taxonomy";

export const emptyRange = (): NumRange => ({ preset: "", min: "", max: "" });
export const emptyFilters = (): Filters => ({
  price: emptyRange(), regions: [], conditions: [], area: emptyRange(), bedrooms: "", plot: emptyRange(),
  settlements: [], landscapes: [], types: [], features: [], tagTypes: [], tagConditions: [],
});

export function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Filters kept from an earlier visit (sessionStorage) may have an older shape: keep what is valid, drop the rest. */
export function normalizeFilters(raw: unknown): Filters {
  const base = emptyFilters();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Record<string, unknown>;
  const set = (k: unknown) => (Array.isArray(k) ? k.filter((v): v is string => typeof v === "string") : []);
  const num = (k: unknown): NumRange => {
    const o = (k && typeof k === "object" ? k : {}) as Record<string, unknown>;
    return { preset: typeof o.preset === "string" ? o.preset : "", min: digits(o.min), max: digits(o.max) };
  };
  return {
    ...base,
    price: num(r.price), area: num(r.area), plot: num(r.plot),
    bedrooms: typeof r.bedrooms === "string" ? r.bedrooms : "",
    regions: set(r.regions), conditions: set(r.conditions), settlements: set(r.settlements),
    landscapes: set(r.landscapes), types: set(r.types), features: set(r.features),
    tagTypes: set(r.tagTypes), tagConditions: set(r.tagConditions),
  };
}

/** What a number box may hold: digits only. */
export const digits = (v: unknown) => (typeof v === "string" ? v.replace(/\D/g, "").slice(0, 8) : "");

/** Typed from–to the wrong way round. */
export const rangeInvalid = (r: NumRange) => r.min !== "" && r.max !== "" && +r.min > +r.max;
export const hasInvalidRange = (f: Filters) => rangeInvalid(f.price) || rangeInvalid(f.area) || rangeInvalid(f.plot);

/** For live counts while a range is being typed: a wrong-way range is ignored instead of emptying the list. */
export function withoutInvalid(f: Filters): Filters {
  const ok = (r: NumRange) => (rangeInvalid(r) ? emptyRange() : r);
  return { ...f, price: ok(f.price), area: ok(f.area), plot: ok(f.plot) };
}

/** A number the home does not state (null) never passes an active numeric filter; 0 is a real value. */
const numOk = (value: number | null | undefined, active: boolean, pass: (v: number) => boolean) =>
  !active || (value != null && pass(value));

const rangeActive = (r: NumRange) => r.preset !== "" || r.min !== "" || r.max !== "";
const inTyped = (v: number, r: NumRange) => (r.min === "" || v >= +r.min) && (r.max === "" || v <= +r.max) && !rangeInvalid(r);

export function visible(all: Property[], tab: Tab, favs: string[], f: Filters) {
  return all.filter((p) => {
    if (tab === "favourites" && !favs.includes(p.id)) return false;
    if (tab === "archive" && !archived(p)) return false;
    if (tab === "all" && archived(p)) return false;
    return matches(p, f);
  });
}

/** One home against the filters. Between facets AND, inside a facet OR; unknown never matches an active facet. */
export function matches(p: Property, f: Filters) {
  const facts = p.facts;

  /* price presets are upper limits (≤); a typed range replaces the preset */
  if (!numOk(p.price, rangeActive(f.price), (v) => (f.price.preset ? v <= +f.price.preset : inTyped(v, f.price)))) return false;
  if (f.regions.length && !f.regions.includes(p.region)) return false;
  if (f.conditions.length) {
    const c = conditionOf(facts);
    if (!c || !f.conditions.includes(c)) return false;
  }
  /* living area presets are minimums (≥) */
  if (!numOk(p.size_m2, rangeActive(f.area), (v) => (f.area.preset ? v >= +f.area.preset : inTyped(v, f.area)))) return false;
  if (!numOk(p.bedrooms, f.bedrooms !== "", (v) => v >= +f.bedrooms)) return false;
  if (!numOk(p.land_size_m2, rangeActive(f.plot), (v) => inTyped(v, f.plot))) return false;

  if (f.settlements.length) {
    const s = facts?.settlement?.value;
    if (!s || !f.settlements.includes(s)) return false;
  }
  if (f.landscapes.length) {
    const l = facts?.landscape?.value;
    if (!l || !l.some((v) => f.landscapes.includes(v))) return false;
  }
  if (f.types.length) {
    const t = facts?.property_type?.value;
    if (!t || !f.types.includes(t)) return false;
  }
  if (f.features.length) {
    const have = facts?.features?.value ?? [];
    if (!f.features.every((k) => have.includes(k))) return false;
  }

  if (f.tagTypes.length && !f.tagTypes.includes(p.property_type)) return false;
  if (f.tagConditions.length && !f.tagConditions.includes(p.condition)) return false;
  return true;
}

export interface Facet {
  name: string;
  value: string;
  /** a copy of the filters with this facet switched off */
  off: (f: Filters) => Filters;
}

const labels = (opts: Option[], keys: string[]) => opts.filter(([k]) => keys.includes(k)).map(([, l]) => l).join(", ");
const money = (v: string) => "€" + (+v >= 1000 && +v % 1000 === 0 ? +v / 1000 + "k" : (+v).toLocaleString("en-US"));
const typed = (r: NumRange, fmt: (v: string) => string, unit: string) => {
  if (r.min !== "" && r.max !== "") return fmt(r.min) + "–" + fmt(r.max) + unit;
  if (r.max !== "") return "up to " + fmt(r.max) + unit;
  return "from " + fmt(r.min) + unit;
};

/** The active facets: a name, the chosen values spelled out, and a way to switch each one off. */
export function activeFacets(f: Filters): Facet[] {
  const out: Facet[] = [];
  if (f.price.preset) out.push({ name: "Price", value: labels(PRICE_PRESETS, [f.price.preset]), off: (x) => ({ ...x, price: emptyRange() }) });
  else if (f.price.min !== "" || f.price.max !== "") out.push({ name: "Price", value: typed(f.price, money, ""), off: (x) => ({ ...x, price: emptyRange() }) });
  if (f.regions.length) out.push({ name: "Location", value: f.regions.map(regionLabel).join(", "), off: (x) => ({ ...x, regions: [] }) });
  if (f.conditions.length) out.push({ name: "Condition", value: labels(CONDITIONS, f.conditions), off: (x) => ({ ...x, conditions: [] }) });
  if (f.area.preset) out.push({ name: "Living area", value: labels(AREA_PRESETS, [f.area.preset]), off: (x) => ({ ...x, area: emptyRange() }) });
  else if (f.area.min !== "" || f.area.max !== "") out.push({ name: "Living area", value: typed(f.area, (v) => v, " m²"), off: (x) => ({ ...x, area: emptyRange() }) });
  if (f.bedrooms) out.push({ name: "Bedrooms", value: labels(BEDROOM_PRESETS, [f.bedrooms]), off: (x) => ({ ...x, bedrooms: "" }) });
  if (f.plot.min !== "" || f.plot.max !== "") out.push({ name: "Plot", value: typed(f.plot, (v) => (+v).toLocaleString("en-US"), " m²"), off: (x) => ({ ...x, plot: emptyRange() }) });
  if (f.features.length) out.push({ name: "Features", value: labels([...OUTDOOR, ...FEATURES], f.features), off: (x) => ({ ...x, features: [] }) });
  if (f.settlements.length) out.push({ name: "Settlement", value: labels(SETTLEMENTS, f.settlements), off: (x) => ({ ...x, settlements: [] }) });
  if (f.landscapes.length) out.push({ name: "Landscape", value: labels(LANDSCAPES, f.landscapes), off: (x) => ({ ...x, landscapes: [] }) });
  if (f.types.length) out.push({ name: "Property type", value: labels(TYPES, f.types), off: (x) => ({ ...x, types: [] }) });
  if (f.tagTypes.length || f.tagConditions.length) {
    out.push({
      name: "Tag",
      value: [...f.tagTypes, ...f.tagConditions].map((v) => v.toLowerCase()).join(", "),
      off: (x) => ({ ...x, tagTypes: [], tagConditions: [] }),
    });
  }
  return out;
}

/** The facets of the More filters section that are switched on (for the count next to its title). */
export const moreCount = (f: Filters) =>
  (f.plot.min !== "" || f.plot.max !== "" ? 1 : 0) + (f.settlements.length ? 1 : 0) + (f.landscapes.length ? 1 : 0) +
  (f.types.length ? 1 : 0) + (f.features.length ? 1 : 0);

/** Which choices have at least one home behind them. An attribute nobody has classified yet has none, and its choices
    are shown dimmed and cannot be picked (a filter that can only return an empty list would mislead). */
export function available(all: Property[]) {
  const sets = { conditions: new Set<string>(), types: new Set<string>(), settlements: new Set<string>(), landscapes: new Set<string>(), features: new Set<string>() };
  for (const p of all) {
    const c = conditionOf(p.facts);
    if (c) sets.conditions.add(c);
    if (p.facts?.property_type) sets.types.add(p.facts.property_type.value);
    if (p.facts?.settlement) sets.settlements.add(p.facts.settlement.value);
    p.facts?.landscape?.value.forEach((v) => sets.landscapes.add(v));
    p.facts?.features?.value.forEach((v) => sets.features.add(v));
  }
  return sets;
}
export type Availability = ReturnType<typeof available>;
