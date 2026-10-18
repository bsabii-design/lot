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
| Chip (filter option, mobile filter pill, photo counter) | 24px (`--h-chip`) | 8px | interface |
| Map bubble (price; merged = round, count) | 24px (`--h-chip`) | 8px (round: 4px, min width 24px) | interface |
| Button, secondary or primary (Save, View listing in the header, Clear filters, Browse all homes) | 32px (`--h-btn`) | 12px | content |
| Small button (`.btn.sm`, actions inside floating windows: Show N homes; the text button Clear all has the same 28px row height, no padding) | 28px | 12px | interface |
| Dock (List / Map / Filter) | 32px (`--h-btn`) | 16px | interface |
| Input (price / size range) | 32px (`--h-btn`) | 8px | interface |
| Primary CTA, full width (View listing at the bottom of a home) | 40px (`--h-cta`) | centred | content |
| Filter window | auto; scroll area padding 16px, 8px between groups, 4px label-to-chips and chip-to-chip; fixed footer (12px 16px) with a hairline: Clear all (left) and the black button "Show N homes" (right, 32px) | | interface |

The filter window works on a **draft**: picks change only the number on the button, the page behind stays as it is. "Show N homes" applies them, closes the window, and the chosen filters appear in the list at the bottom left. Closing the window without the button (Esc, outside click) throws the draft away.

## 4. Buttons

| Role | Look | Where |
|---|---|---|
| **Primary CTA** | black pill, white text; one per screen | View listing (full width at the bottom of the home page) |
| **Secondary** | grey tint pill (6% black), 68% text; darker on hover / when on | Save / Saved, Clear filters, Browse all homes |
| **Tertiary / text button** (`.btn.ghost`) | plain text, no fill, no padding; 68% text, black on hover | Clear all in the filter window, Clear, Custom, Back |
| **Chip** | 1px outline pill; chosen = black fill, white text | the filter window |
| **Map bubble** | black pill with the price in k; open = white. On a home's own page the place is a plain 12px black dot, no price | the map |

Pills are always fully rounded (radius 999). No shadows. Map zoom buttons (+ / −) are one white capsule with the hairline, 28px squares, top-right of the minimap.

**One stroke.** The only line in the visual language is a 1px hairline, `--stroke` (10% ink; 30% on hover, `--stroke-hover`). It marks two things: *containers that float* (dock, filter window, map preview, minimap) and *controls you can switch* (chips, inputs). Secondary buttons are a grey tint with no line; primary buttons, chosen chips and map bubbles are solid black with no line. List dividers are the even quieter `--border` (8%).
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

Words from `data/glossary.json` (19 entries today) are marked in descriptions with a 1px **dotted underline** in the quiet grey (black on hover). On hover — on a phone, on tap; on a home's page also on keyboard focus — a definition card appears above the word: white, the site hairline, the term in italics on its own line, the definition, and a small grey source line that links to the dictionary page (`Wiktionary · CC BY-SA 4.0`). The mouse can move onto the card (150ms grace) to follow the link. Only the **first** use of a term in a description is marked. The card is drawn outside the text block, so the feed's 4-line clamp never cuts it, and it stays inside the window. Terms are matched with and without accents (château / chateau).

**Definitions are never written by us.** Each one is quoted word for word from an open source (English Wiktionary or English Wikipedia, both CC BY-SA 4.0) with its page URL, licence and retrieval date stored next to it; the build script that produced the file refuses any text that is not found verbatim in the source response. Wiktionary senses are chosen by relevance to property (e.g. *dépendance* → "outbuilding", not "dependence"). A term with no open source is not defined: *maison de maître*, *lauze* and *DPE* were removed for that reason. To add a word: find it in Wiktionary or Wikipedia, copy the sentence exactly, add the entry (term, aliases, definition, source).
