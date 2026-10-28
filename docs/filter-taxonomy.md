# Filter taxonomy

The approved filter panel: five main groups, then a collapsed **More filters** block. Code: `lib/taxonomy.ts` (vocabulary), `lib/filters.ts` (logic), `components/FilterWindow.tsx` (panel). Tests: `node scripts/test-filters.mjs`.

## Groups

| Group | Choices | Behaviour |
|---|---|---|
| Price | Up to €50k … €150k; typed Min–Max | presets are **upper limits**; one at a time; typing clears the preset, picking a preset clears the typed numbers |
| Location | all 13 metropolitan regions | several; OR |
| Condition | Move-in ready · Light works · Needs renovation · Restoration project | several; OR; see "Condition" below |
| Living area | Any area, 50+, 75+, 100+, 150+ m², Custom (typed Min–Max) | presets are **minimums**; one at a time |
| Bedrooms | Any, 1+ … 4+ | minimum, one at a time |
| **More filters** (starts collapsed; one flat list, each group has one label) | | |
| Plot & outdoor | Plot size (typed Min–Max, m²) · Outdoor: Garden, Courtyard | garden and courtyard are separate attributes, never inferred from plot size |
| Surroundings | Settlement: Village, Hamlet, Town, Isolated · Landscape: Countryside, Mountains, Coastal, Riverside | independent; a home has one settlement and any number of landscapes |
| Property type | House, Cottage, Farmhouse, Townhouse, Mill, Converted barn, Other | the building only, not material, age or place |
| Features | Stone, Historic, Original features, Outbuildings, Garage, Terrace, Fireplace, Views, Pool, Detached, Single-storey | several; **all** selected must be present |

Logic: OR inside Location, Settlement, Landscape, Property type and Condition; AND between groups; Features need every selected one. Selections are a draft until "Show N homes"; the count is live; Clear all resets every control, including More filters.

## Unknown is never false

A home that does not state a value never matches an active filter on that attribute (`null` size, bedrooms or plot; a missing classification). `0` is a real value (a home with no plot matches a plot filter that includes 0). Typed ranges accept digits only; a from above to is flagged ("Min is above max") and Apply is disabled.

## Data layer

`data/properties.json` is **unchanged** (byte-identical; the test checks its hash). The new attributes live next to it in `data/classification.json`, keyed by property id, and are attached in `lib/properties.ts`. A missing key means unknown. Each value has a `basis`: `legacy` (moved label-for-label, not reviewed) or `stated` / `derived` (checked against the listing, evidence required, per `docs/property-audit.md` §6.7).

`scripts/classify-legacy.py` writes the file. It moves only unambiguous things:

| New attribute | From | Not moved, and why |
|---|---|---|
| Property type: Cottage, Farmhouse | legacy type with the same word | Stone/Village/Country/Historic house (material, place, age: ambiguous); Other |
| Settlement: Town | legacy setting "Town" | "Village": hamlets are labelled Village (audit 4.3) |
| Landscape: Countryside, Mountains, Coastal | legacy setting with the same word | |
| Features: garden, stone, historic, original features, outbuildings, garage, terrace, fireplace, views, pool | the tag being present; a missing tag means unknown | `renovation` (means both "to renovate" and "renovated"), `land` (duplicates plot size) |
| Condition | **nothing** | habitability and renovation level are separate attributes and are never read from the old `condition` label or from photos |

Price, region, living area (`size_m2`), bedrooms and plot (`land_size_m2`) use the existing numbers.

## Condition

Two attributes per home: **habitability** (`habitable`, `habitable_after_light_works`, `partly_habitable`, `not_habitable`) and **renovation level** (`recently_renovated`, `good_order`, `needs_refreshing`, `needs_renovation`, `restoration_project`). The visitor-facing category is computed in `conditionOf()` (`lib/taxonomy.ts`) and needs both known:

- Restoration project: not or partly habitable, or a restoration project
- Needs renovation: a renovation is needed (habitable or not)
- Light works: habitable after light works, or only needs refreshing
- Move-in ready: habitable and recently renovated or in good order

**This mapping is a proposal; confirm or change it there.**

## Choices without data

A choice with no home behind it is dimmed and cannot be picked (a filter that can only return an empty list would mislead). It switches on by itself once a home has the value. Today: all of **Condition**, Settlement (Village, Hamlet, Isolated), Landscape (Coastal, Riverside), Property type (House, Townhouse, Mill, Converted barn, Other), Features (Courtyard, Detached, Single-storey). Regions are never dimmed: location is known for every home, so a region with no homes is a real empty result.

## Hashtags

`#type` and `#condition` on cards and home pages still filter on the **old labels** (cards are out of scope). They appear in the active list as "Tag" and are not shown in the panel.

## Distance to the sea (computed, not judged)

`data/geo.json`, written by `scripts/sea-distance.py` from the Natural Earth 10m coastline (public domain): the straight-line distance from each home's point to the nearest coast, in km. The point is a commune's centre, so the figure is good to roughly 5-10 km. The site rounds it to 5 km (10 beyond 100 km), writes it with a tilde ("~40 km to the sea"), shows it on a card only up to 60 km, and in the full list inside a home for every home. Today the nearest home is 39 km from the coast.

## The facts line

`lib/facts.ts`: state, settlement, living area, bedrooms, plot, sea: on the feed card, in the map popup and above the description inside a home. A value nobody has checked (state, settlement) is not shown; `docs/review-sheet.md` lists what to check.
