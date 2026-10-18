# LOT property catalogue audit

*Status: audit and recommendations only. Nothing in the website, `data/properties.json` or the UI was changed.*
*Snapshot: 26 properties, all last checked 2026-08-25. Audit written 2026-10-18.*

Every value quoted below comes from `data/properties.json` as it is today. Where the file does not say something, this document says "not stated" and does **not** fill the gap. No new category is assigned to any property; the model in section 6 is a proposal for how such assignments should be recorded **after** someone has checked the source listing.

---

## 1. What was read

| File | What it tells us |
|---|---|
| `data/properties.json` | the 26 records (all fields below) |
| `data/schema.md` | the documented schema; it differs from the real data in a few places (section 5.7) |
| `lib/types.ts` | the TypeScript `Property`, `Status` and `Filters` types the app actually uses |
| `lib/filters.ts` | which fields drive filtering today: `property_type`, `condition`, `setting`, `region`, `bedrooms`, `price`, `size_m2` |
| `components/FilterWindow.tsx` | the filter UI: Type, Condition, Bedrooms, Price, Size, Region, Setting (all multi-select, ranges for price and size) |
| `components/Card.tsx` | a feed card shows price, place, description, and two hashtags (`#type`, `#condition`) |
| `components/HomeDetail.tsx` | a home page shows status, type, condition, setting, size, land, bedrooms, bathrooms, features, a map, tags and the "posted" age |

### Which fields reach the visitor today

| Field | Card | Detail page | Filter | Map preview |
|---|---|---|---|---|
| price | yes | yes | yes (presets + range) | yes (bubble, preview) |
| town, region, country | yes (place line) | yes | region only | town + country |
| property_type | hashtag | row + hashtag | yes | no |
| condition | hashtag | row + hashtag | yes | no |
| setting | no | row | yes | no |
| size_m2 | no | row | yes | preview line |
| bedrooms | no | row | yes | preview line |
| bathrooms | no | row | no | no |
| land_size_m2 | no | row | no | no |
| features | no | one comma-joined row | no | no |
| highlights | no | **never shown** | no | first item in the preview line |
| short_description | yes (4-line clamp) | yes | no | no |
| status | "under offer" note / archive tab | row | tab only | no |
| date_added | no | "posted … ago" | no | no |
| last_checked | no | no | no | no |
| source_name, source_reference | no | no | no | no |
| source_url | no | "View listing" | no | no |
| original_listing_price | archived homes only | archived homes only | no | no |
| approximate_location | no | note under the map | no | "approximate" |

---

## 2. The catalogue (all 26 properties)

| # | ID (= slug) | Title | Price | Region | Type | Condition | Setting | Status | Source URL | Last checked |
|---|---|---|---:|---|---|---|---|---|---|---|
| 1 | `pepieux-stone-house-1962` | Stone house in Pépieux | €117,000 | Occitanie | Village house | Move-in ready | Village | available | <https://www.french-property.com/sale-property/3397-1962> | 2026-08-25 |
| 2 | `le-vigeant-village-house-a37509` | Village house in Le Vigeant | €89,100 | Nouvelle-Aquitaine | Village house | Move-in ready | Village | available | <https://www.frenchestateagents.com/french-property-for-sale/view/A37509LW86/house-for-sale-in-le%20vigeant-vienne-poitou-charentes-france> | 2026-08-25 |
| 3 | `merdrignac-stone-cottage-newton` | Stone cottage near Merdrignac | €126,500 | Bretagne | Cottage | Move-in ready | Countryside | available | <https://www.agencenewton.com/vente/cotes-darmor-maison-de-caractere-en-pierre-de-3-chambres-avec-style-terrasse-et-parking> | 2026-08-25 |
| 4 | `lacaze-timbered-house-60636342` | Timber-framed house in Lacaze | €79,500 | Occitanie | Historic house | Needs some work | Village | available | <https://www.selectionocean.com/fiches/4-40-26_60636342/maison-de-village-lacaze-6-piece-s-120-m2.html> | 2026-08-25 |
| 5 | `champgeneteux-renovation-a44098` | Stone cottage project in Champgenéteux | €59,600 | Pays de la Loire | Stone house | Renovation project | Countryside | available | <https://www.frenchestateagents.com/french-property-for-sale/view/A44098SVM53/house-for-sale-champgen%C3%A9teux-mayenne-pays-de-la-loire-france> | 2026-08-25 |
| 6 | `pressignac-stone-cottage-a41100` | Stone cottage in Pressignac | €69,000 | Nouvelle-Aquitaine | Cottage | Move-in ready | Countryside | available | <https://www.leggett-immo.com/acheter-vendre-une-maison/view/A41100SVA16/maison-a-vendre-a-pressignac-charente--france> | 2026-08-25 |
| 7 | `la-chapelle-montbrandeix-stone-house-a29584` | Stone house in La Chapelle-Montbrandeix | €90,000 | Nouvelle-Aquitaine | Stone house | Move-in ready | Village | available | <https://www.leggett-immo.com/acheter-vendre-une-maison/view/A29584ARO87/maison-a-vendre-a-la-chapelle-montbrandeix-haute-vienne-limousin-france> | 2026-08-25 |
| 8 | `thollet-farmhouse-bvi72280` | Farmhouse in Thollet | €97,900 | Nouvelle-Aquitaine | Farmhouse | Move-in ready | Countryside | available | <https://beauxvillages.com/en/properties-for-sale-in-jarnac/property/332400-BVI72280> | 2026-08-25 |
| 9 | `saint-sebastien-cottage-a45393` | Cottage in Saint-Sébastien | €99,000 | Nouvelle-Aquitaine | Cottage | Move-in ready | Village | under_offer | <https://www.leggett-immo.com/acheter-vendre-une-maison/view/A45393CHH23/maison-a-vendre-a-saint-s%C3%A9bastien-creuse-limousin-france> | 2026-08-25 |
| 10 | `locarn-country-house-a45191` | Country house in Locarn | €119,600 | Bretagne | Country house | Move-in ready | Countryside | under_offer | <https://www.leggett-immo.com/acheter-vendre-une-maison/view/A45191GCA22/maison-a-vendre-a-locarn-c%C3%B4tes-d%27armor-bretagne-france> | 2026-08-25 |
| 11 | `saint-ouen-la-thene-house-a39000` | House in Saint-Ouen-la-Thène | €134,900 | Nouvelle-Aquitaine | Country house | Move-in ready | Countryside | available | <https://www.leggett-immo.com/acheter-vendre-une-maison/view/A39000JHI17/maison-a-vendre-a-saint-ouen-la-th%C3%A8ne-charente-maritime-poitou-charentes-france> | 2026-08-25 |
| 12 | `saint-germain-de-confolens-house-a44033` | Stone house in Saint-Germain-de-Confolens | €75,000 | Nouvelle-Aquitaine | Stone house | Move-in ready | Village | available | <https://www.frenchestateagents.com/french-property-for-sale/view/A44033TEL16/house-for-sale-confolens-charente-poitou-charentes-france> | 2026-08-25 |
| 13 | `exideuil-village-house-a44580` | Village house in Exideuil-sur-Vienne | €115,000 | Nouvelle-Aquitaine | Village house | Move-in ready | Village | available | <https://www.leggett-immo.com/acheter-vendre-une-maison/view/A44580TSM16/maison-a-vendre-a-exideuil-sur-vienne-charente--france> | 2026-08-25 |
| 14 | `azillanet-stone-house-a44962` | Stone house in Azillanet | €99,000 | Occitanie | Stone house | Move-in ready | Village | under_offer | <https://www.frenchestateagents.com/french-property-for-sale/view/A44962LHS34/> | 2026-08-25 |
| 15 | `gourdon-stone-house-a43147` | Stone house near Gourdon | €149,900 | Occitanie | Stone house | Move-in ready | Village | available | <https://www.frenchestateagents.com/french-property-for-sale/view/A43147NB46/house-for-sale-gourdon-lot-midi-pyrenees-france> | 2026-08-25 |
| 16 | `gace-colombage-house-a39921` | Colombage house in Gacé | €148,000 | Normandie | Historic house | Move-in ready | Town | available | <https://www.frenchestateagents.com/french-property-for-sale/view/A39921NOE61/house-for-sale-gac%C3%A9-orne-normandy-france> | 2026-08-25 |
| 17 | `la-roque-sur-ceze-village-house-a44763` | Village house in La Roque-sur-Cèze | €149,000 | Occitanie | Village house | Move-in ready | Village | available | <https://www.frenchestateagents.com/french-property-for-sale/view/A44763RSI30/house-for-sale-la-roque-sur-c%C3%A8ze-gard-languedoc-roussillon-france> | 2026-08-25 |
| 18 | `riberac-stone-house-bvi77914` | Stone house near Ribérac | €140,400 | Nouvelle-Aquitaine | Stone house | Move-in ready | Countryside | available | <https://beauxvillages.com/en/buy/properties-for-sale/bvi77914> | 2026-08-25 |
| 19 | `saint-sulpice-house-bvi80970` | House in Saint-Sulpice-les-Feuilles | €125,350 | Nouvelle-Aquitaine | Village house | Move-in ready | Village | available | <https://beauxvillages.com/en/buy/properties-for-sale/bvi80970> | 2026-08-25 |
| 20 | `chalais-stone-cottage-bvi86937` | Stone cottage near Chalais | €130,800 | Nouvelle-Aquitaine | Cottage | Move-in ready | Countryside | available | <https://beauxvillages.com/en/buy/properties-for-sale/bvi86937> | 2026-08-25 |
| 21 | `la-trimouille-house-bvi85550` | House in La Trimouille | €100,000 | Nouvelle-Aquitaine | Village house | Move-in ready | Village | available | <https://beauxvillages.com/en/buy/properties-for-sale/bvi85550> | 2026-08-25 |
| 22 | `chateauponsac-stone-house-am5270` | Stone house near Châteauponsac | €122,475 | Nouvelle-Aquitaine | Stone house | Move-in ready | Countryside | available | <https://www.agencenewton.com/vente/haute-vienne-superbe-maison-en-pierre-entierement-renovee-avec-jardin-de-2-917-m2-et-grande> | 2026-08-25 |
| 23 | `chamberet-stone-house-cc4941` | Stone house in Chamberet | €137,500 | Nouvelle-Aquitaine | Stone house | Move-in ready | Village | available | <https://www.agencenewton.com/vente/correze-chamberet-jolie-maison-en-pierre-de-3-chambres-grand-garage-et-jardin-de-1835-m2> | 2026-08-25 |
| 24 | `valzergues-farmhouse-28262` | Farmhouse in Valzergues | €114,900 | Occitanie | Farmhouse | Needs some work | Village | available | <https://www.french-property.com/sale-property/3397-12008-DeE-28262MI> | 2026-08-25 |
| 25 | `lacourt-hamlet-house-32848` | House in a Pyrenean hamlet, Lacourt | €125,000 | Occitanie | Village house | Move-in ready | Mountains | available | <https://www.french-property.com/sale-property/3397-32848> | 2026-08-25 |
| 26 | `ginals-watermill-32445` | Watermill on the Seye, Ginals | €143,000 | Occitanie | Other | Needs some work | Countryside | available | <https://www.french-property.com/sale-property/3397-32445> | 2026-08-25 |

## 3. Snapshot statistics

| Facet | Distribution |
|---|---|
| Price | under €80k: 4 · €80–100k: 6 · €100–125k: 6 · €125–150k: 10 (range €59,600 – €149,900) |
| Size (`size_m2`) | under 70: 2 · 70–100: 16 · 100–150: 7 · over 150: 1 (range 57 – 189 m²) |
| Land (`land_size_m2`) | not stated: **7** · under 300: 5 · 300–999: 6 · 1,000–4,999: 6 · 5,000+: 2 (11,000 and 80,000 m²) |
| Bedrooms | 1: 1 · 2: 10 · 3: 14 · 5: 1 |
| Bathrooms | 1: 20 · 2: 5 · 3: 1 |
| Region | Nouvelle-Aquitaine 14 · Occitanie 8 · Bretagne 2 · Pays de la Loire 1 · Normandie 1 (5 of the 13 metropolitan regions) |
| Type | Stone house 8 · Village house 7 · Cottage 4 · Historic house 2 · Farmhouse 2 · Country house 2 · Other 1 |
| Condition | Move-in ready **22** · Needs some work 3 · Renovation project 1 |
| Setting | Village 14 · Countryside 10 · Town 1 · Mountains 1 |
| Status | available 23 · under_offer 3 |
| Source (agency) | Leggett 13 · Selection Habitat 5 · Beaux Villages 5 · Agence Newton 3 |
| Photos per home | 8: 22 homes · 10: 1 · 6: 1 · 3: 1 · 2: 1 |
| Feature tags | garden 17 · stone 15 · original features 11 · outbuildings 10 · terrace 8 · views 7 · historic 6 · fireplace 6 · renovation 3 · garage 2 · land 2 · pool 1 |

---

## 4. Findings

### 4.1 `property_type` mixes four different questions

The nine allowed values (schema) / seven used values answer different questions, so a home can legitimately fit several and the label chosen is arbitrary:

| Value | What it actually describes |
|---|---|
| Stone house | the **material** (the `stone` feature tag says the same thing; all 8 "Stone house" homes also carry `stone`) |
| Village house, Country house | the **location** (this is what `setting` is for) |
| Cottage, Farmhouse | the **scale / rural origin** of the building |
| Historic house | **heritage / age** (the `historic` tag says the same) |
| Other | a catch-all (the single use is a watermill) |

Evidence of the overlap in the data itself:

- Six homes carry the `historic` tag but only two are typed "Historic house": #1 and #17 (Village house), #15 (Stone house) and #26 (Other) are typed otherwise.
- Four titles say "Stone …" (#1, #3, #6, #20) while the type is not "Stone house".
- #1's title is "Stone house in Pépieux" but its type is "Village house"; #5's title is "Stone cottage project" but its type is "Stone house"; #24's description calls it "an authentic 1900 stone country house" while its type is "Farmhouse" (and "Country house" is another value).
- "Village house" is used for #25, which the same record places in a Pyrenean *hamlet* with setting "Mountains".
- Schema values that are never used: Townhouse, Barn / conversion. Setting "Coastal" is also never used.

Consequence: the Type filter and the `#hashtag` shortcut (which is wired to the same value) cannot give a visitor a reliable answer to "show me stone cottages" or "show me farmhouses".

### 4.2 `condition` has almost no discriminating power and its evidence is not stored

- 22 of 26 homes (85%) are "Move-in ready": the filter removes almost nothing.
- Only **9 of 26** records contain any wording about condition in the stored title, description or highlights (#1 "tastefully refitted", #3 "beautifully presented", #5 "habitable cottage … a second house to renovate and a ruin", #9 "in good condition", #14 "quality 2017 renovation", #21 "renovated single-storey", #22 "fully restored", #25 "fully renovated — no work required", #26 "requires general updating").
- For the other **17** the label cannot be verified from the file: 15 are "Move-in ready" and 2 (#4, #24) are "Needs some work" with no sentence supporting it. The evidence may exist in the source listing; the record does not keep it, nor who decided the label.
- The three values mix two different things: *can I live there now* and *how much work is needed*. #5 is "Renovation project" yet contains "a habitable cottage"; #26 "Needs some work" means interior updating of a watermill.
- The `renovation` feature tag means opposite things: it marks a project to renovate (#5) and homes that **have been** renovated (#14, #22). The tag duplicates `condition` and contradicts itself.

### 4.3 `setting` mixes settlement type and landscape

Values are Village / Countryside / Town / Mountains (and an unused Coastal). "Mountains" is a landscape; the others are settlement types. A hamlet is not a value, and the data treats hamlets inconsistently — six records mention a hamlet in their text:

| # | Text says | `setting` |
|---|---|---|
| 6 | "a pretty hamlet" | Countryside |
| 8 | "a hamlet farmhouse" | Countryside |
| 15 | "a small hamlet 4 km from Gourdon" | **Village** |
| 18 | "a quiet hamlet" | Countryside |
| 20 | "a hamlet" | Countryside |
| 25 | "a Pyrenean hamlet at 600 m" | Mountains |

Only one home is "Town" (#16) and one "Mountains" (#25), so those two filter values each select one house. Altitude (#25: 600 m) exists only inside a highlight string.

### 4.4 `features` is a flat bag with overlaps

- `stone` duplicates the type "Stone house"; `historic` duplicates "Historic house"; `renovation` duplicates and contradicts `condition` (4.2); `land` duplicates `land_size_m2`; `fireplace` is repeated by the highlight "marble fireplace" (#19).
- `outbuildings` (10) and `garage` (2) say a building exists but not which kind or size; the kind appears only in highlights ("barn", "large outbuilding", "big barn", "two-level barn") or descriptions ("dependance", "summer kitchen", "bread oven", "a ruin").
- Features are shown on the detail page as one comma-joined line and are not filterable, although they carry the most buyer-relevant facts (garden, pool, terrace, views).
- The schema lists `walkable village`, which is never used.

### 4.5 `highlights` is an undefined catch-all

One short free-text item per home, shown only as the third segment of the map preview. The 26 values mix: facts ("8 hectares", "3 bathrooms", "single storey", "potential 2 homes"), place descriptors ("riverside village", "medieval village", "Pyrenean hamlet at 600 m"), objects ("bread oven", "marble fireplace", "barn", "summer kitchen") and marketing adjectives copied from listings ("charming cottage", "stunning views", "beautifully presented"). Facts should be structured fields, objects should be features, adjectives are editorial voice.

### 4.6 Location

- All 26 coordinates are approximate (geocoded from the town); this is consistent and already flagged, but there is no distinction between "commune centre" and "listing gave an exact address".
- Only region is stored. The **département** is not a field, although descriptions mention it (Côtes-d'Armor, Tarn, Mayenne, Creuse, Charente-Maritime, Aveyron) and several source URLs contain it. Natural parks/areas named in text (Parc naturel régional Périgord-Limousin in #7, Pays d'Auge in #16, Couserans in #25, Minervois in #14) are not captured. These are candidates for structured location data, not for guessing.
- Region names are French strings used as keys. The site shows English names (`lib/regions.ts`); keys should stay stable.

### 4.7 Status, dates, sources, ids

- **Status vocabulary differs between documents.** `schema.md`: available, under_offer, sold. `lib/types.ts`: available, under_offer, sold, **unavailable**. The archive tab treats sold and unavailable as archived.
- **Availability is also written into the editorial text.** #9, #10 and #14 end their `short_description` with "Currently under offer." — exactly the 3 `under_offer` records. When the status changes the text will be wrong.
- **Dates carry no information yet.** `date_added` is 2026-08-25 for all 26, and `last_checked` equals it for all 26: nothing has been re-checked in 54 days. `date_added` is the day *we* recorded the home, not the day it was listed, yet the site renders it as "posted … ago".
- **Price history does not exist.** `original_listing_price` is null for all 26 and is only meant for archived homes. A price drop on an available home cannot be represented.
- **Source modelling is one string.** `source_name` is the agency, but the URL host varies: Leggett → `frenchestateagents.com` (7) and `leggett-immo.com` (6); Selection Habitat → `french-property.com` (4, a portal) and `selectionocean.com` (1); Beaux Villages → `beauxvillages.com` (5); Agence Newton → `agencenewton.com` (3). The agency and the portal that republishes it are mixed, and there is nowhere to record the rights or permission status per source (relevant for the photo permission process).
- **References are inconsistent.** `source_reference` is null for #1, #3, #4. Formats differ (A37509LW86, BVI72280, AM-5270, 12008-DeE-28262MI, 32848 …), and the slug suffix is derived from them in different ways (`a37509`, `bvi72280`, `am5270`, `1962`, `60636342`, `newton`).
- **ids.** The schema says "short unique id", but for all 26 records `id` equals `slug`; both are unique. Treat them as the permanent public identity of the record.
- **Titles are mostly generated** (`<type> in <town>`) and sometimes disagree with the type (4.1). A few are editorial ("Watermill on the Seye, Ginals", "Colombage house in Gacé").

### 4.8 Missing information (not stated anywhere in the record)

| Missing | Coverage today |
|---|---|
| Land size | 7 of 26 are null (#1, #4, #8, #12, #14, #19, #20). Unknown vs "not applicable" is not distinguished |
| Source reference | 3 of 26 null |
| Energy performance (DPE / GES) | 0 of 26 mention it |
| Heating | 1 of 26 mentions a heating system (#22 "wood stove"); fireplaces appear on 6 but a fireplace is not a heating system |
| Sanitation (mains drainage / septic) | 1 of 26 (#13 "mains drainage") |
| Connectivity | 1 of 26 (#13 "Fibre") |
| Year built / era | 5 of 26 in text only (#1 1850, #14 1874 + renovated 2017, #15 15th & 19th century, #24 1900, #26 1800s) |
| Additional buildings (kind, area) | 12 of 26 mention one in text or tags; only the *existence* is structured, the area appears in text for #24 (98 m² barn) |
| Building configuration | 4 of 26 say detached / single storey in text (#10, #11, #12, #21); #13 "potential to split into two homes" is a highlight |
| Fees (agency fees included or not) | 0 of 26 |
| Price history / reductions | 0 of 26 |
| What `size_m2` measures (living area vs built area vs total of several buildings) | not stated for any; #5 has three buildings and one `size_m2` |
| Photo credit / permission | not modelled |

### 4.9 Structured fields vs. text

- #16: `bedrooms` is 3, the description says "three to four bedrooms".
- #4: `bedrooms` is 1; the source URL says "6-piece-s-120-m2" (6 rooms, 120 m²). Not necessarily a contradiction (rooms ≠ bedrooms) — flagged for a check against the listing.
- #8: description "three bedrooms plus a study"; stored 3.
- #3, #24, #25, #26 repeat measurements in text (plot sizes, a 98 m² barn, a 20 m² terrace, a 28 m² convertible attic, 1.1 hectares) that have no structured home.
- #26: "its own water rights" (a legal fact) exists only in prose.

### 4.10 Photo coverage

#20 has 2 photos and #21 has 3 (the other 24 have 6–10); the catalogue is a visual product, so this is an editorial quality flag. The 8-photo cap used for most homes is a content rule that is not recorded in the data.

### 4.11 Per-property review flags

Flags are observations that need a human check against the source listing. They are **not** corrections.

| # | ID | Flag |
|---|---|---|
| 1 | `pepieux-stone-house-1962` | title says "Stone house", type is "Village house"; `historic` tag without "Historic house"; no reference; land not stated; source is a portal (french-property.com) |
| 2 | `le-vigeant-village-house-a37509` | "Move-in ready" with no condition wording in the text |
| 3 | `merdrignac-stone-cottage-newton` | no reference; plot size only in text; "beautifully presented" stored as highlight |
| 4 | `lacaze-timbered-house-60636342` | "Needs some work" without supporting text; type "Historic house" vs title "Timber-framed"; no reference; land not stated; URL says 6 rooms vs 1 bedroom |
| 5 | `champgeneteux-renovation-a44098` | three buildings (habitable cottage + house to renovate + ruin) forced into one type and one condition; one `size_m2` for three buildings; `renovation` tag means "to renovate" |
| 6 | `pressignac-stone-cottage-a41100` | "hamlet" in text, setting Countryside |
| 7 | `la-chapelle-montbrandeix-stone-house-a29584` | regional park designation only in text |
| 8 | `thollet-farmhouse-bvi72280` | hamlet → Countryside; land not stated; "plus a study" |
| 9 | `saint-sebastien-cottage-a45393` | "Currently under offer." inside the editorial text; "in good condition" supports the label |
| 10 | `locarn-country-house-a45191` | "under offer" inside text; "detached" is a configuration fact in prose; "Country house" for a 2-bed, 88 m² house with balcony |
| 11 | `saint-ouen-la-thene-house-a39000` | "detached" and "dependance" in prose; 3 bathrooms is a highlight as well as a field |
| 12 | `saint-germain-de-confolens-house-a44033` | "detached" in prose; land not stated |
| 13 | `exideuil-village-house-a44580` | "potential 2 homes" as highlight; fibre and mains drainage only in text |
| 14 | `azillanet-stone-house-a44962` | "Move-in ready" with the `renovation` tag (renovated 2017); "under offer" inside text; land not stated |
| 15 | `gourdon-stone-house-a43147` | text says "small hamlet", setting is Village; 8 feature tags; `historic` without "Historic house"; "convertible attic", "bread oven" in prose/highlight; 10 photos |
| 16 | `gace-colombage-house-a39921` | bedrooms 3 vs "three to four bedrooms"; the only "Town" |
| 17 | `la-roque-sur-ceze-village-house-a44763` | `historic` without "Historic house"; land 28 m² (very small plot) |
| 18 | `riberac-stone-house-bvi77914` | land 80,000 m² (8 ha) shown in m²; `land` tag + highlight "8 hectares" |
| 19 | `saint-sulpice-house-bvi80970` | 6 photos; land not stated although "garden with its own well"; "marble fireplace" repeated |
| 20 | `chalais-stone-cottage-bvi86937` | only 2 photos; land not stated; hamlet → Countryside |
| 21 | `la-trimouille-house-bvi85550` | only 3 photos; "renovated single-storey" labelled Move-in ready without a `renovation` tag (unlike #14/#22) |
| 22 | `chateauponsac-stone-house-am5270` | "fully restored" + `renovation` tag; "wood stove" and "large attached barn" only in text |
| 23 | `chamberet-stone-house-cc4941` | "summer kitchen" highlight; garage tag |
| 24 | `valzergues-farmhouse-28262` | "Needs some work" without supporting text; "stone country house" in text vs type "Farmhouse"; barn area (98 m²) and build year (1900) only in text |
| 25 | `lacourt-hamlet-house-32848` | "Village house" type for a hamlet; the only "Mountains"; altitude (600 m) and attic (28 m²) only in text |
| 26 | `ginals-watermill-32445` | type "Other"; water rights and 1.1 ha only in text; `historic` + `land` tags |

---

## 5. Summary of the problems

1. **Classification is not orthogonal.** Type, tags and setting repeat each other (stone, historic, village/country), so filters overlap and hashtags mislead.
2. **Condition is both too coarse and unevidenced.** 85% of the catalogue shares one value; 17 of 26 labels have no supporting text in the record.
3. **Facts live in prose.** Era, configuration, sanitation, heating, additional buildings, areas, altitude and rights are in descriptions/highlights, so they cannot be shown consistently or filtered.
4. **Availability, price and dates are thin.** No price history, no per-listing publication date, no re-check since the first capture, availability stated inside editorial text.
5. **Sources are one string.** Agency vs portal vs domain are mixed; there is no place for photo permissions.
6. **Schema and code disagree** (status values, unused values, "short id").

---

## 6. Proposed data model

Principle: a property record has four layers with different owners, rhythms and visibility. Today they share one flat object, which is why availability leaks into editorial text and classification has no evidence trail.

| Layer | Question it answers | Changes | Public? | Owner |
|---|---|---|---|---|
| **A. Property facts** | What is this house and where? | rarely; when verified facts change | mostly | verified from the listing / documents |
| **B. Editorial** | Why is it in LOT and how do we say it? | by Sabina | yes | editorial |
| **C. Listing** | Is it available, at what price, according to whom? | often (re-checks) | partly | machine + human re-check |
| **D. Publication** | May it be shown, who checked what, what rights do we hold? | workflow | **no** | internal |

### 6.1 Identity (outside the layers, immutable)

`id`, `slug`. Never changed after publication (migration rules, section 9).

### 6.2 Layer A: property facts

Every classified attribute carries its **evidence** (see 6.6); plain numbers inherit the listing as source.

| Group | Fields | Notes |
|---|---|---|
| location | `country`, `region` (official name = key), `department`, `commune`, `coordinates {lat, lng, precision: commune \| exact}`, `areas[]` (park, historic area) | `department` and `areas[]` are new; fill only from the listing |
| areas | `living_area_m2`, `plot_area_m2` (+ `plot_status: stated \| none \| unknown`) | replaces `size_m2` / `land_size_m2`; **keep the old names until the migration is verified**; distinguishes "no plot" from "not stated" |
| rooms | `bedrooms`, `bathrooms`, `rooms_total` | `rooms_total` only if the listing gives it |
| dwelling | `dwelling_form` (house, farmhouse, mill, barn conversion, townhouse, other), `construction_material[]`, `era_or_year_built`, `listed_or_protected` | **material and heritage are separate from form** |
| configuration | `detached`, `storeys`, `single_storey`, `attic {convertible}`, `courtyard`, `split_potential` | all nullable |
| condition | `habitability` (see 7), `renovation_level`, `works_description` (verbatim from the listing), `last_renovation_year` | evidence required |
| systems | `energy_class_dpe`, `ghg_class`, `heating[]`, `sanitation`, `connectivity` | evidence required |
| grounds | `outbuildings[] {kind, area_m2?, condition?}`, `pool`, `terrace`, `garden`, `views`, `water_rights` | replaces the tags `outbuildings`, `garage`, `pool`, `terrace`, `garden`, `views`, `land` |
| surroundings | `settlement` (isolated, hamlet, village, town), `landscape[]` (countryside, mountains, coastal, riverside, …), `altitude_m` | replaces `setting` |

### 6.3 Layer B: editorial

`title`, `summary` (= the current `short_description`, byte-for-byte), `highlights[]` (curated, optional, never facts), `collections[]`, `editor_note`, `hero_image`, `language`. Rule: **no availability and no price in editorial text.**

### 6.4 Layer C: listing

| Field | Notes |
|---|---|
| `source {agency, portal?, url, reference, language}` | agency and the portal that republishes it are separate; domain recorded |
| `status` | `available`, `under_offer`, `sold`, `withdrawn` (= today's "unavailable"), `unverified` |
| `price {amount, currency, fees: included \| excluded \| unknown, history[]}` | `history[]` = `{date, amount, source}` |
| `dates` | `first_seen_at` (today's `date_added`, renamed because it is *our* date), `listed_at` (if the listing states it), `last_checked_at`, `last_changed_at`, `ended_at` |
| `events[]` | append-only log: price change, status change, listing removed |

### 6.5 Layer D: publication workflow (internal)

| Field | Notes |
|---|---|
| `state` | `discovered` → `drafted` → `needs_review` → `approved` → `published` → `archived` |
| `review` | `{reviewer, reviewed_at, checklist: facts, classification, photos, rights, description}` |
| `rights` | per source: `photo_permission {status: none \| requested \| granted \| refused, date, reference}`; credit line to show |
| `media[]` | `{path, order, credit, source_url}`; the cap of 8 photos is a rule here, not in the data |
| `origin` | where the record came from (Airtable record, discovery run) |
| `notes` | internal |

### 6.7 Evidence for every classified attribute

```ts
// the same shape for habitability, renovation_level, dwelling_form, settlement, heating, sanitation, energy class …
type Classified<T> = {
  value: T | null;                    // null = unknown
  basis: "stated" | "derived" | "unknown";
  evidence?: { quote?: string; url: string; checked_at: string };  // required unless basis = "unknown"
  reviewed_by?: string;               // required for "derived"
};
```

- `stated`: the listing says it in so many words (a quote is stored).
- `derived`: a person concluded it from the listing; the reviewer is recorded.
- `unknown`: nobody has checked. This is the **default**. Filters ignore unknown values; the UI never shows a guessed value.

### 6.8 Illustration (record #15, only what its stored text says)

```json
{
  "id": "gourdon-stone-house-a43147",
  "slug": "gourdon-stone-house-a43147",
  "facts": {
    "dwelling": {
      "era_or_year_built": { "value": "15th & 19th century", "basis": "stated", "evidence": { "quote": "A 15th & 19th-century stone house" } },
      "construction_material": { "value": ["stone"], "basis": "stated", "evidence": { "quote": "stone house" } }
    },
    "configuration": { "attic": { "convertible": true } },
    "grounds": { "garden": true, "terrace": true, "views": true },
    "surroundings": { "settlement": { "value": "hamlet", "basis": "stated", "evidence": { "quote": "a small hamlet 4 km from Gourdon" } } },
    "condition": { "habitability": { "value": null, "basis": "unknown" }, "renovation_level": { "value": null, "basis": "unknown" } },
    "systems": { "energy_class_dpe": { "value": null, "basis": "unknown" }, "heating": { "value": null, "basis": "unknown" } }
  },
  "listing": { "source": { "agency": "Leggett", "reference": "A43147NB46" }, "status": "available" }
}
```

(Illustration only: the real records would be produced by the migration in section 9, which never invents values. In particular `condition` for #15 stays "unknown" until the listing is checked, even though the legacy label says "Move-in ready".)

---

## 7. Candidate fields

"Text evidence today" counts the 26 stored records whose own text already mentions the topic. It is a measure of how much can be pre-filled for **human review**, not an instruction to fill it.

| Field | What it answers | Candidate values | Text evidence today | Needs | Recommendation |
|---|---|---|---|---|---|
| **Habitability** | Can I live there now? | habitable as is · habitable after light works · partly habitable · not habitable | 9 of 26 say something about state | listing check | **Public filter** (replaces `condition`'s first meaning) |
| **Renovation level** | How much and what kind of work? | recently renovated (year) · good order · needs refreshing · needs renovation · restoration project | same 9 | listing check; `works_description` quote | **Detail page** + part of the habitability filter |
| **Building configuration** | Detached? How many storeys? Attic? Split potential? | detached · attached · single storey · convertible attic · could be split | 4 say detached/single storey; #13 split; #15, #25 attic | listing check | **Detail page**; optional filter "detached" later |
| **DPE (energy class)** | Running cost and rental/sale rules | A–G (+ GHG class) | **0** of 26 | listing / diagnostic document | **Detail page** once verified; internal until then (never infer) |
| **Heating** | How is it heated? | wood stove · electric · gas · oil · heat pump · fireplace only · none | 1 (#22 wood stove); 6 fireplaces (not the same as heating) | listing check | **Detail page** |
| **Sanitation** | Mains drainage or septic? | mains · septic · unknown | 1 (#13 mains drainage) | listing check | **Detail page**; strong buyer concern, candidate filter later |
| **Additional buildings** | Barn, garage, ruin, gîte potential | list of {kind, area, condition} | 12 mention at least one | listing check | **Detail page** + simple public yes/no "extra buildings" |
| **Price history** | Has it dropped? | dated amounts + source | **0**; no re-check yet | repeated checks | **Detail page** (as "price reduced" note) + internal log |
| Year built / era | Age of the building | year or era | 5 | listing check | Detail page |
| Département | Where exactly in a region | official name | 0 structured (6 mentioned in text) | listing / URL | Detail + region drill-down |
| Plot size | Land | m² (+ ha display) | 19 numeric, 7 null | listing | **Public range filter** |
| Fees | Price comparability | included / excluded | 0 | listing | Detail page; internal until verified |
| Altitude, protected area, water rights | Specifics | free-form structured | 1 each | listing | Detail page |

---

## 8. Visibility: filter, detail page, internal

### 8.1 Public filters

Choose filters by two rules: (1) the attribute splits the catalogue into meaningful groups, (2) the data is reliable for every published home. The current catalogue is a small sample, so the best *future* filters are judged on what buyers ask, with the discriminating power below as a sanity check.

| Today's filter | Share of the commonest value | Verdict |
|---|---|---|
| Condition | 85% (22/26) | cannot filter anything; replace with *habitability* once evidenced |
| Setting | 54% Village | keep but redefine (settlement type + landscape) |
| Type | 31% Stone house | keep only if it means *form* (house, farmhouse, mill …); drop material and "village/country" |
| Region | 54% Nouvelle-Aquitaine | keep; add département when data exists; draw the boundary on the map (already done) |
| Bedrooms | 54% have 3 (92% have 2–3) | keep |
| Price | even spread | keep |
| Size | 62% in 70–100 m² | keep (as living area) |

Recommended public filter set: **Price, Region (with map), Bedrooms, Living area, Plot size, Dwelling form, Habitability, Settlement/landscape, Extra buildings (yes/no)**. Add **Detached**, **Sanitation**, **Energy class** only when at least the large majority of homes have verified values; a filter whose value is unknown for half the catalogue is misleading.

Rule for unknown values: a home with an unknown value for a facet is **excluded** from that filter and the filter shows how many homes are unclassified. It is never silently treated as "no".

### 8.2 Detail page only

Construction era, configuration, DPE, heating, sanitation, connectivity, additional-building list with areas, protected/listed status, altitude, water rights, price history ("price reduced"), fees, land in hectares for large plots, bathrooms.

### 8.3 Internal (never public)

Evidence quotes and URLs, `basis`, reviewer and review checklist, photo permission status and references, source reference and domain, raw listing text, ingest/discovery ids, notes, `events[]` log details, "stale" flags, `unverified` status reasons.

### 8.4 The hashtags

The two card hashtags (`#type`, `#condition`) are wired to the filters. They should follow whichever facets become reliable (e.g. `#farmhouse`, `#habitable`); until then they inherit the ambiguity in 4.1 and 4.2.

---

## 9. Migration rules

The goal is additive, reversible and verifiable. The existing records are the source of truth until a reviewer changes something.

### 9.1 Invariants (must hold after every migration step)

| Invariant | Today's value |
|---|---|
| Number of records | 26 in, 26 out |
| `id` and `slug` | identical to today for all 26; `id == slug` for all 26 |
| `images` | the exact same paths in the same order for every record; every file exists |
| `short_description` | byte-identical text; it moves to `editorial.summary`, no edits (the 3 sentences "Currently under offer." stay; they are flagged for editorial review, not removed) |
| `source_url`, `source_name`, `source_reference` | identical; nulls stay null |
| `price`, `status` | identical |
| `date_added`, `last_checked` | preserved (renamed `first_seen_at`, `last_checked_at` in the new layer; the old names remain readable) |
| Public URLs | `/homes/<slug>` unchanged; no redirects needed |

### 9.2 Rules

1. **Never change `id` or `slug`.** They are the permanent identity; new records get their own immutable `slug` at creation. If a slug ever has to change, keep the old one as `slug_history` and redirect.
2. **Additive first.** Add the new layers next to the legacy fields, keep legacy fields readable, and write an adapter so the current UI keeps working. Remove legacy fields only after the UI has moved and the invariants have passed for a release cycle.
3. **Legacy classification is preserved, not reinterpreted.** `property_type`, `condition`, `setting`, `features` and `highlights` are copied into `legacy.*` unchanged. They never populate the new classified fields (`dwelling_form`, `habitability`, `renovation_level`, `settlement`, …).
4. **No auto-assignment.** New classified fields start as `{ value: null, basis: "unknown" }`. They are filled only (a) from a quote in the source listing (`stated`) or (b) by a named reviewer (`derived`), each with evidence (6.7). A script may *suggest* values from the stored text (section 7 counts) into a review queue; it never writes them as accepted data.
5. **Only mechanical moves are automatic:** `size_m2 → living_area_m2`, `land_size_m2 → plot_area_m2`, `bedrooms`, `bathrooms`, `lat`, `lng`, `approximate_location → coordinates.precision`, `price`, `source_*`, `status`, dates, `images`. `null` stays `unknown` (for plot size: `plot_status: unknown`, **not** "none").
6. **Status mapping:** `available → available`, `under_offer → under_offer`, `sold → sold`, `unavailable → withdrawn`. `unverified` is new and used when a re-check is overdue.
7. **Titles** are kept as they are; flagged (section 4.1) for editorial review, not rewritten.
8. **Region keys** stay the official French names; display names stay in `lib/regions.ts`.
9. **New facts enter with provenance** (listing URL, check date, checker). A fact without provenance is not accepted.
10. **Dry-run first.** The migration produces a diff report (field by field) and fails on any invariant violation; nothing is written until the report is read.
11. **Reversible.** The pre-migration `data/properties.json` stays in version history; the migration is a pure function from legacy → new, so it can be re-run.
12. **Re-check policy (proposal):** every `available` or `under_offer` record is re-checked on a fixed cadence (suggested 14 days; to be decided) and becomes `unverified` after a longer gap. Today all 26 are 54 days past their only check.
13. **Rights are tracked per source.** Record photo permission per agency (Leggett, Selection Habitat, Beaux Villages, Agence Newton); a record is `published` only if the permission status of its source allows it.

### 9.3 Validation checklist (for the future migration script)

- [ ] 26 records, ids and slugs identical to the snapshot
- [ ] every image path identical and every file exists
- [ ] every `short_description` byte-equal to the original
- [ ] every `source_url` identical
- [ ] no new classified field has `basis` other than `unknown` unless evidence + reviewer are present
- [ ] no value invented: every non-null new value is a mechanical copy or carries evidence
- [ ] build output unchanged (same 26 pages, same filters until the UI is switched)

---

## 10. Decisions needed from Sabina

1. **Condition vs habitability.** Replace the single "Condition" with two attributes (*habitable now?* and *renovation level*) — yes/no?
2. **Dwelling form.** Should the type list describe only the *form* (house, farmhouse, mill, barn conversion, townhouse, other) with material and heritage as features? Which forms matter for your buyers?
3. **Settlement.** Is "hamlet" a value of its own (it already appears in 6 descriptions)?
4. **Photo rights.** Track permission per agency in the data (recommended) — and is the four-agency list in 4.7 complete?
5. **Re-check cadence** and who does it.
6. **Which three filters are the must-have when the database is bigger?** (the section 8.1 list is a proposal.)
7. **Fees.** Do we show prices "agency fees included" only, or both?

---

## 11. Key issues and proposed changes (one paragraph)

The catalogue's labels overlap (type, tags and setting repeat material, heritage and location), the condition label is almost constant and 17 of 26 values have no stored evidence, many buyer-relevant facts (era, configuration, sanitation, heating, additional buildings, areas, altitude, rights) exist only in prose, availability is written inside editorial text, there is no price history and nothing has been re-checked since 2026-08-25, and sources are one string with no place for photo permissions. The proposal splits each record into four layers — facts, editorial, listing, publication — with an evidence record (`stated`, `derived` or `unknown`) on every classified attribute, replaces "condition" with habitability and renovation level, reduces "type" to building form, redefines "setting" as settlement and landscape, adds price history, dates and per-source rights, and migrates additively with strict invariants (26 records, ids, slugs, images, descriptions and source links unchanged, no auto-assigned categories).
