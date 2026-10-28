/* Checks the filter logic against the real catalogue, comparing lib/filters.ts with plain loops written here.
   Run: node scripts/test-filters.mjs */
import { register } from "node:module";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
register("./ts-hooks.mjs", import.meta.url);

const { visible, emptyFilters, activeFacets, withoutInvalid, hasInvalidRange, normalizeFilters, available, moreCount } =
  await import("../lib/filters.ts");
const read = (f) => JSON.parse(readFileSync(new URL("../" + f, import.meta.url)));
const raw = read("data/properties.json").properties;
const cls = read("data/classification.json").properties;
const homes = raw.map((p) => ({ ...p, facts: cls[p.id] }));

let failed = 0;
const check = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failed++;
  console.log((ok ? "ok   " : "FAIL ") + name + (ok ? "" : `  got ${JSON.stringify(got)} want ${JSON.stringify(want)}`));
};
const ids = (list) => list.map((p) => p.id).sort();
const run = (patch, list = homes) => ids(visible(list, "all", [], { ...emptyFilters(), ...patch }));
const brute = (test, list = homes) => ids(list.filter(test));

/* --- the catalogue itself is untouched --- */
check("26 records", raw.length, 26);
check("id equals slug for all", raw.every((p) => p.id === p.slug), true);
const baseline = "f3f08a4eecaae7055857bc2dd1b0b444d07af31a";
check("properties.json is byte-identical to the published version", execSync("git hash-object data/properties.json").toString().trim(), baseline);

/* --- numbers --- */
check("no filter shows all 26", run({}).length, 26);
check("price preset is an upper limit (<= 100k)", run({ price: { preset: "100000", min: "", max: "" } }), brute((p) => p.price <= 100000));
check("price preset 50k", run({ price: { preset: "50000", min: "", max: "" } }).length, raw.filter((p) => p.price <= 50000).length);
check("price typed 60,000-100,000 inclusive", run({ price: { preset: "", min: "60000", max: "100000" } }), brute((p) => p.price >= 60000 && p.price <= 100000));
check("price min only", run({ price: { preset: "", min: "125000", max: "" } }), brute((p) => p.price >= 125000));
check("area preset is a minimum (>= 100)", run({ area: { preset: "100", min: "", max: "" } }), brute((p) => p.size_m2 >= 100));
check("area typed 80-100", run({ area: { preset: "", min: "80", max: "100" } }), brute((p) => p.size_m2 >= 80 && p.size_m2 <= 100));
check("bedrooms is a minimum (3+)", run({ bedrooms: "3" }), brute((p) => p.bedrooms >= 3));
check("bedrooms 4+ includes the 5-bed home", run({ bedrooms: "4" }), brute((p) => p.bedrooms >= 4));

/* --- unknown and zero --- */
const synth = [
  { ...homes[0], id: "z-unknown", land_size_m2: null, size_m2: null, bedrooms: null },
  { ...homes[0], id: "z-zero", land_size_m2: 0, size_m2: 60, bedrooms: 2 },
  { ...homes[0], id: "z-big", land_size_m2: 5000, size_m2: 120, bedrooms: 3 },
];
check("plot: unknown never matches an active plot filter", run({ plot: { preset: "", min: "0", max: "100" } }, synth), ["z-zero"]);
check("plot: zero is a real value (0-0)", run({ plot: { preset: "", min: "0", max: "0" } }, synth), ["z-zero"]);
check("plot: min 1000 excludes zero and unknown", run({ plot: { preset: "", min: "1000", max: "" } }, synth), ["z-big"]);
check("plot: no filter keeps unknown", run({}, synth).length, 3);
check("area: unknown never matches (preset)", run({ area: { preset: "50", min: "", max: "" } }, synth), ["z-big", "z-zero"]);
check("bedrooms: unknown never matches", run({ bedrooms: "1" }, synth), ["z-big", "z-zero"]);
check("price: unknown never applies (all known)", run({ price: { preset: "150000", min: "", max: "" } }, synth).length, 3);

/* --- sets: OR inside, AND between --- */
check("regions OR", run({ regions: ["Bretagne", "Normandie"] }), brute((p) => ["Bretagne", "Normandie"].includes(p.region)));
check("a region without homes returns none", run({ regions: ["Corse"] }), []);
check("types OR (cottage, farmhouse)", run({ types: ["cottage", "farmhouse"] }), brute((p) => ["Cottage", "Farmhouse"].includes(p.property_type)));
check("types: a type nobody has classified returns none", run({ types: ["mill"] }), []);
check("landscape OR (mountains, countryside)", run({ landscapes: ["mountains", "countryside"] }), brute((p) => ["Mountains", "Countryside"].includes(p.setting)));
check("settlement town", run({ settlements: ["town"] }), brute((p) => p.setting === "Town"));
check("settlement village is unknown for all", run({ settlements: ["village"] }), []);
check("condition is unknown for all (never inferred from the old label)", run({ conditions: ["move_in"] }), []);
check("features need ALL (garden + stone)", run({ features: ["garden", "stone"] }), brute((p) => p.features.includes("garden") && p.features.includes("stone")));
check("features single (pool)", run({ features: ["pool"] }), brute((p) => p.features.includes("pool")));
check("features with no data (detached) return none", run({ features: ["detached"] }), []);
check("features: garden + courtyard returns none", run({ features: ["garden", "courtyard"] }), []);
check("features unknown is not false: nothing excluded without the filter", run({}).length, 26);
check("AND across groups (Occitanie + garden + 3+ bedrooms)", run({ regions: ["Occitanie"], features: ["garden"], bedrooms: "3" }),
  brute((p) => p.region === "Occitanie" && p.features.includes("garden") && p.bedrooms >= 3));
check("AND across groups (price<=100k + area>=75 + Nouvelle-Aquitaine)", run({ price: { preset: "100000", min: "", max: "" }, area: { preset: "75", min: "", max: "" }, regions: ["Nouvelle-Aquitaine"] }),
  brute((p) => p.price <= 100000 && p.size_m2 >= 75 && p.region === "Nouvelle-Aquitaine"));

/* --- tags keep their old behaviour --- */
check("#tag on the old type label", run({ tagTypes: ["Village house"] }), brute((p) => p.property_type === "Village house"));
check("#tag on the old condition label", run({ tagConditions: ["Needs some work"] }), brute((p) => p.condition === "Needs some work"));

/* --- ranges --- */
const bad = { ...emptyFilters(), price: { preset: "", min: "200", max: "100" } };
check("wrong-way range is detected", hasInvalidRange(bad), true);
check("wrong-way range is ignored in live counts", visible(homes, "all", [], withoutInvalid(bad)).length, 26);
check("wrong-way range matches nothing if it ever reaches visible()", visible(homes, "all", [], bad).length, 0);

/* --- facets list and clearing --- */
const all = {
  ...emptyFilters(), price: { preset: "100000", min: "", max: "" }, regions: ["Bretagne"], conditions: ["move_in"],
  area: { preset: "", min: "60", max: "90" }, bedrooms: "2", plot: { preset: "", min: "500", max: "" }, settlements: ["town"],
  landscapes: ["mountains"], types: ["cottage"], features: ["garden", "stone"], tagTypes: ["Cottage"],
};
const facets = activeFacets(all);
check("one facet per active group", facets.map((f) => f.name),
  ["Price", "Location", "Condition", "Living area", "Bedrooms", "Plot", "Features", "Settlement", "Landscape", "Property type", "Tag"]);
check("More filters count", moreCount(all), 5);
check("switching every facet off resets everything", JSON.stringify(facets.reduce((f, x) => x.off(f), all)), JSON.stringify(emptyFilters()));
check("old saved filter shapes are made safe", JSON.stringify(normalizeFilters({ types: ["Village house"], price: { presets: ["u80"], min: "5a", max: "" }, bedrooms: ["2"] })),
  JSON.stringify({ ...emptyFilters(), types: ["Village house"], price: { preset: "", min: "5", max: "" } }));

/* --- what is dimmed in the panel --- */
const av = available(homes);
check("conditions: nothing classified, all dimmed", [...av.conditions], []);
check("types with homes", [...av.types].sort(), ["cottage", "farmhouse"]);
check("landscapes with homes", [...av.landscapes].sort(), ["countryside", "mountains"]);
check("settlements with homes", [...av.settlements], ["town"]);
check("features with homes", [...av.features].sort(), ["fireplace", "garage", "garden", "historic", "original_features", "outbuildings", "pool", "stone", "terrace", "views"]);

console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exit(failed ? 1 : 0);
