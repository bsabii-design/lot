import type { Facts } from "./types";

/* The approved filter vocabulary. Keys are stable (stored in data/classification.json); labels are what the visitor reads. */

export type Option = [key: string, label: string];

/** The 13 metropolitan regions (official French names are the data keys; lib/regions.ts gives the English display name). */
export const REGIONS = [
  "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Bretagne", "Centre-Val de Loire", "Corse", "Grand Est",
  "Hauts-de-France", "Île-de-France", "Normandie", "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
];

/** upper limits, one at a time */
export const PRICE_PRESETS: Option[] = [
  ["50000", "Up to €50k"], ["75000", "Up to €75k"], ["100000", "Up to €100k"], ["125000", "Up to €125k"], ["150000", "Up to €150k"],
];
/** minimum living area, one at a time; "" = any */
export const AREA_PRESETS: Option[] = [
  ["", "Any size"], ["50", "50+ m²"], ["75", "75+ m²"], ["100", "100+ m²"], ["150", "150+ m²"],
];
/** minimum bedrooms, one at a time; "" = any */
export const BEDROOM_PRESETS: Option[] = [["", "Any"], ["1", "1+"], ["2", "2+"], ["3", "3+"], ["4", "4+"]];

export const CONDITIONS: Option[] = [["move_in", "Move-in ready"], ["needs_work", "Liveable, needs work"], ["project", "Renovation project"]];

export const OUTDOOR: Option[] = [["garden", "Garden"], ["courtyard", "Courtyard"]];
export const SETTLEMENTS: Option[] = [["village", "Village"], ["hamlet", "Hamlet"], ["town", "Town"], ["isolated", "Isolated"]];
export const LANDSCAPES: Option[] = [["countryside", "Countryside"], ["mountains", "Mountains"], ["coastal", "Coastal"], ["riverside", "Riverside"]];
export const TYPES: Option[] = [
  ["house", "House"], ["cottage", "Cottage"], ["farmhouse", "Farmhouse"], ["townhouse", "Townhouse"], ["mill", "Mill"],
  ["converted_barn", "Converted barn"], ["other", "Other"],
];
export const FEATURES: Option[] = [
  ["stone", "Stone"], ["historic", "Historic"], ["original_features", "Original features"], ["outbuildings", "Outbuildings"],
  ["garage", "Garage"], ["terrace", "Terrace"], ["fireplace", "Fireplace"], ["views", "Views"], ["pool", "Pool"],
  ["detached", "Detached"], ["single_storey", "Single-storey"],
];

/* Habitability and renovation level are two separate attributes. Nothing fills them from the old `condition` label or from
   photos; they stay unknown until a reviewer records them against the listing. */
export const HABITABILITY = ["habitable", "habitable_after_light_works", "partly_habitable", "not_habitable"];
export const RENOVATION_LEVEL = ["recently_renovated", "good_order", "needs_refreshing", "needs_renovation", "restoration_project"];

/** The visitor-facing condition, from the two attributes. Both must be known, otherwise it is unknown (null). */
export function conditionOf(f: Facts | undefined): string | null {
  const h = f?.habitability?.value;
  const r = f?.renovation_level?.value;
  if (!h || !r) return null;
  if (h === "not_habitable" || h === "partly_habitable" || r === "restoration_project") return "project";
  if (h === "habitable_after_light_works" || r === "needs_refreshing" || r === "needs_renovation") return "needs_work";
  if (h === "habitable" && (r === "recently_renovated" || r === "good_order")) return "move_in";
  return null;
}
