import type { Property } from "./types";
import { conditionOf } from "./taxonomy";

/** One scannable fact: the value and, when it needs one, a quiet word after it ("3" "bedrooms"). */
export type Fact = [value: string, word?: string];

const CONDITION: Record<string, string> = { move_in: "Move-in ready", needs_work: "Liveable, needs work", project: "Renovation project" };
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
  return out;
}
