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
const { archived, newestFirst } = await import("../lib/format.ts");
/* the filters see only the homes that are still listed (sold / no longer available ones are off the feed), so the checks run on those */
const homes = raw.filter((p) => !archived(p)).map((p) => ({ ...p, facts: cls[p.id] }));

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
check("32 records", raw.length, 32);
check("id equals slug for all", raw.every((p) => p.id === p.slug), true);
const baseline = "205c77627f210a7d92836c22afffc7944f03591f";
check("properties.json is byte-identical to the published version", execSync("git hash-object data/properties.json").toString().trim(), baseline);

/* --- the order of the feed: newest additions first, the same day keeps the file order --- */
{
  const sample = [{ id: "a", date_added: "2026-08-25" }, { id: "b", date_added: "2026-10-28" }, { id: "c", date_added: "2026-08-25" }, { id: "d", date_added: "2026-10-28" }];
  check("newest additions first, same day in file order", newestFirst(sample).map((p) => p.id), ["b", "d", "a", "c"]);
  check("sorting does not touch the original list", sample.map((p) => p.id), ["a", "b", "c", "d"]);
}

/* --- numbers --- */
check("no filter shows every home that is still listed", run({}).length, homes.length);
check("the listed homes are the records that are not archived", homes.length, raw.filter((p) => !archived(p)).length);
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
check("landscape OR (mountains, countryside)", run({ landscapes: ["mountains", "countryside"] }), brute((p) => (cls[p.id]?.landscape?.value ?? []).some((l) => ["mountains", "countryside"].includes(l))));
check("settlement town", run({ settlements: ["town"] }), brute((p) => p.setting === "Town"));
check("settlement village: only the homes whose listing says so (stated)", run({ settlements: ["village"] }), ["jumilhac-village-house-bvi85468", "ladapeyre-modernised-house-a36890", "saint-laurent-de-ceris-farmhouse-bvi84419", "siran-village-house-a42822"]);
check("condition: only the homes with a stated habitability and renovation level (never the old label)", run({ conditions: ["move_in"] }), ["jumilhac-village-house-bvi85468", "ladapeyre-modernised-house-a36890", "millac-hamlet-house-bvi87682", "saint-laurent-de-ceris-farmhouse-bvi84419", "siran-village-house-a42822"]);
check("features need ALL (garden + stone)", run({ features: ["garden", "stone"] }), brute((p) => p.features.includes("garden") && p.features.includes("stone")));
check("features single (pool)", run({ features: ["pool"] }), brute((p) => p.features.includes("pool")));
check("features: detached only where the listing says so", run({ features: ["detached"] }), ["avene-stone-house-a36741", "saint-laurent-de-ceris-farmhouse-bvi84419"]);
check("features: garden + courtyard returns none", run({ features: ["garden", "courtyard"] }), []);
check("features unknown is not false: nothing excluded without the filter", run({}).length, homes.length);
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
check("wrong-way range is ignored in live counts", visible(homes, "all", [], withoutInvalid(bad)).length, homes.length);
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
check("conditions with homes", [...av.conditions], ["move_in"]);
check("types with homes", [...av.types].sort(), ["cottage", "farmhouse", "house"]);
check("landscapes with homes", [...av.landscapes].sort(), ["countryside", "mountains"]);
check("settlements with homes", [...av.settlements].sort(), ["hamlet", "town", "village"]);
check("features with homes", [...av.features].sort(), ["detached", "fireplace", "garage", "garden", "historic", "original_features", "outbuildings", "pool", "stone", "terrace", "views"]);

console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exit(failed ? 1 : 0);
