import type { Filters, NumRange, Property } from "./types";
import { regionLabel } from "./regions";
import {
  AREA_PRESETS, BEDROOM_PRESETS, CONDITIONS, FEATURES, OUTDOOR, PRICE_PRESETS, SETTLEMENTS,
  conditionOf, type Option,
} from "./taxonomy";

export const emptyRange = (): NumRange => ({ preset: "", min: "", max: "" });
export const emptyFilters = (): Filters => ({
  price: emptyRange(), regions: [], conditions: [], area: emptyRange(), bedrooms: "", settlements: [], features: [],
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
    price: num(r.price), area: num(r.area),
    bedrooms: typeof r.bedrooms === "string" ? r.bedrooms : "",
    regions: set(r.regions), conditions: set(r.conditions), settlements: set(r.settlements), features: set(r.features),
  };
}

/** What a number box may hold: digits only. */
export const digits = (v: unknown) => (typeof v === "string" ? v.replace(/\D/g, "").slice(0, 8) : "");

/** Typed from–to the wrong way round. */
export const rangeInvalid = (r: NumRange) => r.min !== "" && r.max !== "" && +r.min > +r.max;
export const hasInvalidRange = (f: Filters) => rangeInvalid(f.price) || rangeInvalid(f.area);

/** For live counts while a range is being typed: a wrong-way range is ignored instead of emptying the list. */
export function withoutInvalid(f: Filters): Filters {
  const ok = (r: NumRange) => (rangeInvalid(r) ? emptyRange() : r);
  return { ...f, price: ok(f.price), area: ok(f.area) };
}

/** A number the home does not state (null) never passes an active numeric filter; 0 is a real value. */
const numOk = (value: number | null | undefined, active: boolean, pass: (v: number) => boolean) =>
  !active || (value != null && pass(value));

const rangeActive = (r: NumRange) => r.preset !== "" || r.min !== "" || r.max !== "";
const inTyped = (v: number, r: NumRange) => (r.min === "" || v >= +r.min) && (r.max === "" || v <= +r.max) && !rangeInvalid(r);

/** The homes still listed (sold and no-longer-available ones are off the feed) that pass the filters. */
export function visible(all: Property[], f: Filters) {
  return all.filter((p) => p.status !== "sold" && p.status !== "unavailable" && matches(p, f));
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

  if (f.settlements.length) {
    const s = facts?.settlement?.value;
    if (!s || !f.settlements.includes(s)) return false;
  }
  if (f.features.length) {
    const have = facts?.features?.value ?? [];
    if (!f.features.every((k) => have.includes(k))) return false;
  }
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
  if (f.settlements.length) out.push({ name: "Settlement", value: labels(SETTLEMENTS, f.settlements), off: (x) => ({ ...x, settlements: [] }) });
  if (f.features.length) out.push({ name: "Features", value: labels([...OUTDOOR, ...FEATURES], f.features), off: (x) => ({ ...x, features: [] }) });
  return out;
}

/** Which choices have at least one home behind them. An attribute nobody has classified yet has none, and its choices
    are shown dimmed and cannot be picked (a filter that can only return an empty list would mislead). */
export function available(all: Property[]) {
  const sets = { conditions: new Set<string>(), settlements: new Set<string>(), features: new Set<string>() };
  for (const p of all) {
    const c = conditionOf(p.facts);
    if (c) sets.conditions.add(c);
    if (p.facts?.settlement) sets.settlements.add(p.facts.settlement.value);
    p.facts?.features?.value.forEach((v) => sets.features.add(v));
  }
  return sets;
}
export type Availability = ReturnType<typeof available>;
