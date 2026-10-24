import type { Property } from "./types";
import { conditionOf } from "./taxonomy";

/** Up to this distance the sea is worth a fact on a card (about an hour's drive); a full list inside a home states it for every home. */
const SEA_NEAR = 60;

/** The distance to the coast, rounded to 5 km (to 10 beyond 100): finer than that the coordinates (a commune's centre) cannot say. */
export function seaKm(p: Property): number | null {
  const d = p.geo?.sea_km;
  if (d == null) return null;
  const step = d > 100 ? 10 : 5;
  return Math.max(step, Math.round(d / step) * step);
}

/** One scannable fact: the value and, when it needs one, a quiet word after it ("3" "bedrooms"). */
export type Fact = [value: string, word?: string];

const CONDITION: Record<string, string> = { move_in: "Move-in ready", light_works: "Light works", needs_renovation: "Needs renovation", restoration: "Restoration project" };
const SETTLEMENT: Record<string, string> = { village: "Village", hamlet: "Hamlet", town: "Town", isolated: "Isolated" };

/** The few things that decide whether to look further, for a card or a map popup — and only what is known:
    the state, the settlement, living area, bedrooms, plot. A value nobody has checked (the state of a home, the settlement) is simply not shown;
    it appears by itself once data/classification.json holds it with evidence (basis "stated" or "derived"). */
export function facts(p: Property): Fact[] {
  const out: Fact[] = [];
  const c = conditionOf(p.facts);
  if (c) out.push([CONDITION[c]]);
  const s = p.facts?.settlement;
  if (s && s.basis !== "legacy") out.push([SETTLEMENT[s.value] ?? s.value]);
  if (p.size_m2) out.push([p.size_m2 + " m²"]);
  if (p.bedrooms != null) out.push([String(p.bedrooms), p.bedrooms === 1 ? "bedroom" : "bedrooms"]);
  if (p.land_size_m2) out.push([p.land_size_m2.toLocaleString("en-US") + " m²", "plot"]);
  const sea = seaKm(p);
  if (sea !== null && sea <= SEA_NEAR) out.push(["~" + sea + " km", "to the sea"]);
  return out;
}
