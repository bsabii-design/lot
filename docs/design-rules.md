# LOT design rules

Everything is set in **rem**, so the whole interface scales with the window (design size: a 1152px window, content column 484px).
Font: Times New Roman everywhere, including the map labels (self-hosted Tinos glyphs).

## 0. Type settings

Taken from the reference Sabina picked (Times New Roman Regular, 22px / line-height 23.5px / letter-spacing −0.2px / colour `#000000D9`) and applied proportionally to our sizes:

| Setting | Reference | Ours (token) |
|---|---|---|
| Line height | 23.5 / 22 = **1.068** | `--lh`, `--lh-sm` = 1.068 (16px at 15px text, 13.6px at 12.75px) |
| Letter spacing | −0.2 / 22 = **−0.009em** | `--tracking` (−0.135px at 15px; set on `body`, also on the map labels) |
| Reading colour | `#000000D9` = black 85% | `--text-read` (running text: description, place line values, facts list, map preview); the UI black `--text` `#0a0a0a` stays for chosen / active states, fills and icons |

Because reading text is now 85%, the secondary grey `--text-2` moved from 80% to **68%** so the three steps stay distinct: 85% reading → 68% secondary → 58% quiet.

## 1. Two text sizes, nothing in between

| Level | Size (at design size) | Token | Used for |
|---|---|---|---|
| **Content** | 15px | `--fs` | everything about a home: price, place, description, facts list, tags, the buttons that act on a home (Save, View listing), empty-state messages |
| **Interface** | 12.75px (85% of content) | `--fs-sm` | navigation tabs, Back, the dock (List / Map / Filter), the filter window (labels, chips, inputs), the active-filter list, map bubbles and map preview, counters (1/8), captions and notes |

Rule of thumb: the home is the hero, so its text is the largest thing on screen; everything that helps you *find* a home is smaller.
Price is bold (700); everything else is regular.

## 2. Colour = importance (reading 85% / secondary 68% / quiet 58%; black for chosen)

| Colour | Token | Meaning |
|---|---|---|
| Black | `--text` (UI) / `--text-read` (85%, running text) | what matters right now: home information, the chosen option, an active filter, the "N homes" count |
| 68% | `--text-2` | secondary text on content: place line, grey buttons, text buttons |
| 58% | `--text-3` | inactive or quiet: unchosen tab / List-or-Map, filter names, Clear, hashtags (black on hover) |

Chosen = black, unchosen = 58%. **One grey for everything not chosen**: the unchosen tab, Map/List, Filter with nothing set, Back, unselected chips are all `--text-3` (58%) and turn black on hover. Filter turns black once a filter is set or its window is open.

## 3. Component sizes (heights are fixed; padding is sideways only)

All heights are multiples of 4px and come from tokens in `styles.css` (`--h-row`, `--h-chip`, `--h-btn`, `--h-cta`).

| Component | Height | Side padding | Text |
|---|---|---|---|
| Text row (nav tab, Back, active-filter list line) | 20px (`--h-row`) | 0 | interface |
| Chip (filter option, mobile filter pill, photo counter) | 24px (`--h-chip`) | filter option: 0 (text in brackets); others 8px | interface |
| Map bubble (price; merged = round, count) | 24px (`--h-chip`) | 8px (round: 4px, min width 24px) | interface |
| Black button (View listing in the header; **Show N homes** is the small one, 28px) | 32px (`--h-btn`) | 12px | content (small: interface) |
| Bracket button `.bk` (Save, Clear filters, Browse all homes, Close, Clear all, Clear) | 32px hit area (28px small, 20px row in the filter list) | 0 | content for actions on a home and empty states, interface otherwise |
| Dock (List / Map / Filter) | 32px (`--h-btn`) | 16px | interface |
| Input (price / size range) | 32px (`--h-btn`) | 8px | interface |
| Primary CTA, full width (View listing at the bottom of a home) | 40px (`--h-cta`) | centred | content |
| Filter window | auto; scroll area padding 16px, 8px between groups, 4px label-to-chips and chip-to-chip; fixed footer (12px 16px) with a hairline: Clear all (left) and the black button "Show N homes" (right, 32px) | | interface |

The filter window works on a **draft**: picks change only the number on the button, the page behind stays as it is. "Show N homes" applies them, closes the window, and the chosen filters appear in the list at the bottom left. Closing the window without the button (Esc, outside click) throws the draft away.

## 4. Buttons

Two kinds only, plus chips: one **black pill** for the main action of a screen, and **brackets** for everything else.

| Role | Look | Where |
|---|---|---|
| **Main action** (`.btn`) | black pill, white text; one per screen | View listing (top of a home page and full width at the bottom), Show N homes in the filter window (small) |
| **Quiet action** (`.bk`) | the label in brackets: `(Save)`. No fill, no line. Grey 58% at rest, black on hover | Save, Close (fullscreen photo), Clear all, Clear |
| **Quiet action, black** (`.bk.on`) | the same brackets in black at rest | a chosen state — **(Saved)** — and the only action on an empty screen: (Browse all homes), (Clear filters) |
| **Chip** | 1px outline pill; chosen = black fill, white text | the filter window |
| **Map bubble** | black pill with the price in k; open = white. On a home's own page the place is a plain 12px black dot, no price | the map |

Brackets are drawn by CSS (`::before` / `::after`) with an empty text alternative, so screen readers read just the label, and the hit area stays 32px high. The state of Save is carried by the colour and the type (grey roman → black *italic*, `.bk.saved`) and by the count in the Saved tab, written like the one on Filter: "Saved (2)", with the (2) in italic. The grey tint pill is gone: it did not read as a button and Saved was hard to tell from Save. Back keeps its arrow (it shows a direction).

Pills are always fully rounded (radius 999). No shadows. Map zoom buttons (+ / −) are one white capsule with the hairline, 28px squares, top-right of the minimap.

**One stroke.** The only line in the visual language is a 1px hairline, `--stroke` (10% ink; 30% on hover, `--stroke-hover`). It marks two things: *containers that float* (dock, filter window, map preview, minimap) and *controls you can switch* (chips, inputs). Brackets have no line; the black button, chosen chips and map bubbles are solid black with no line. List dividers are the even quieter `--border` (8%).
Floating surfaces (dock, filter window, map preview) are **white everywhere**, on the map and on the list; the mobile "N homes" pill is white on the map and light grey on the list.

## 5. Spacing

The grid step is **4px** (0.25rem); every gap, padding and margin is a multiple of 4, with deliberate exceptions only (hairlines are 1px).
Blocks are separated by 16px. Page edge to logo / tabs / dock / active-filter list: 20px (dock and list: 16px from the bottom).

## 6. Icons

One set (`components/Icon.tsx`): a 24-unit grid, round caps and joins, `currentColor`. The stroke weight is a token, `--icon-stroke` = 0.07 of the interface text size (about 0.9px at design size), and it does **not** scale with the icon: a 14px arrow and a 24px chevron have the same line weight. Why 0.07 and not the stem of the letters (~0.09): Times has thick stems and light hairlines, so grey text prints lighter than a solid line of the same colour; measured on screen, a 0.09 × looked about 25% darker than the grey text next to it, 0.065–0.07 matches it. Size: 14px (buttons, rows, zoom); 12px for the small remove mark (×) after a filter in the active-filter list, 4px from the text. Photo arrows (feed and fullscreen) sit in a 28px round dark translucent button (`.cbtn`, same tone as the photo counter), because a thin white line vanishes on light photos. Never use text glyphs (‹ › ✕ + −) as icons.

## 7. Regions on the map

A visitor may not know where Normandy or Brittany is, so a chosen region is drawn on the map: a 1.5px black outline and a 5% tint (data: `data/regions.json`, the 13 metropolitan regions, IGN / Etalab open data, credited in the map attribution). It updates live while the filter window is open (the map frames the whole region in the free space beside the window) and stays after "Show N homes". The region names in the filter are the French names, the same as in the data.

## 8. Writing region names (the site is in English)

Data keys stay the official French names (`Bretagne`, `Normandie` …); what the visitor reads comes from `lib/regions.ts`: the established English name where there is one — **Brittany, Normandy, Corsica, Burgundy-Franche-Comté** — and the official name otherwise — **Nouvelle-Aquitaine, Occitanie, Pays de la Loire, Centre-Val de Loire, Auvergne-Rhône-Alpes, Provence-Alpes-Côte d'Azur, Hauts-de-France, Grand Est, Île-de-France**. This is the same in the filter chips, the active-filter list, the place line on cards and home pages. Add a new region there once and it is consistent everywhere.

## 9. French words in descriptions (glossary)

Words from `data/glossary.json` (20 entries today) are marked in descriptions with a 1px **dotted underline** in the quiet grey (black on hover). On hover — on a phone, on tap; on a home's page also on keyboard focus — a definition card appears above the word: white, the site hairline, the term in italics followed by a 4px gap, and the definition continuing on the same line. There is no source line and no link on the card. Only the **first** use of a term in a description is marked. The card is drawn outside the text block, so the feed's 4-line clamp never cuts it, and it stays inside the window. Terms are matched with and without accents (château / chateau).

**Definitions are plain English in our own words, but only what the sources say.** Each entry in `data/glossary.json` keeps, next to the text, the quotes it rests on (English and French Wikipedia, English Wiktionary), with page and URL; a script checks that every quote exists word for word in the source before the file is written. Nothing about the sources is shown on the site: the tooltip has only the term and the definition, no link and no label. `reviewed` stays `false` until a person has read the text against its quotes (`docs/glossary-review.md` lays them side by side). A statement that is not in a quote is not allowed. Terms with no source are left out (*lauze*, *DPE*). If you want to credit the sources, a single line on a future About page is enough.

## 10. The "N homes" count

Shown only when filters are active (in the list and on the map alike), black, with the chosen filters and (Clear) in the bottom-left list. With no filters there is no count: on the map the cluster numbers already add up to the total, in the list the feed itself is the total.

## Filter window options

Row labels (Type, Price …) are black. Every option is text in grey brackets, `(Stone house)`; the chosen one is black *italic*. No border, no fill. There is no "Custom" range: price and size are picked from the presets only. Tags (`#village house`) stay grey text; on hover they turn black *italic*, like a chosen option.
