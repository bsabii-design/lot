#!/usr/bin/env python3
"""Writes docs/review-sheet.md: one row per home with what the filters and the cards still need to know and the words of the stored text
that bear on it. NOTHING is concluded here: the hints are quotes from the record's own description / highlights, for a person to check against
the listing and then to fill into data/classification.json (value + basis "stated"/"derived"). Run: python3 scripts/review-sheet.py"""
import json, pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
props = json.loads((root / "data/properties.json").read_text())["properties"]
KEYS = {
    "state": r"renovat|refit|restor|updat|modernis|moderniz|work|good condition|presented|ruin|habitable|no work|move-in|needs",
    "place": r"hamlet|village|town|isolated|rural|countryside|quiet|walking distance|restaurants|shops",
    "sea/mountain": r"sea|coast|beach|ocean|mountain|pyrenean|altitude|\b\d+ ?m\b at|river|lake",
}
rows = []
for p in props:
    text = " ".join([p["short_description"]] + (p.get("highlights") or []))
    sentences = re.split(r"(?<=[.!?])\s+|\s[—-]\s", text)
    hints = {}
    for name, rx in KEYS.items():
        hit = [s.strip() for s in sentences if re.search(rx, s, re.I)]
        hints[name] = hit[:2]
    rows.append((p, hints))

out = ["# Review sheet: what the cards still need",
       "",
       "Each home needs four things checked against its listing before they can be shown (a value nobody has checked is never shown):",
       "",
       "1. **State**: can it be lived in as it is, light works, or a project; and how much work (cosmetic refresh, renovation, restoration).",
       "2. **Settlement**: town, village, hamlet or isolated.",
       "3. **Sea**: the distance to the coast in km (or none within a limit).",
       "4. **Mountains**: in or next to them (altitude if stated).",
       "",
       "The hints below are quotes from our own stored text, **not conclusions**. Fill the answers into `data/classification.json` (see `docs/filter-taxonomy.md`).",
       "",
       "| # | Home | Source | Old label (not checked) | Hints from the stored text |",
       "|---|---|---|---|---|"]
for i, (p, h) in enumerate(rows, 1):
    def cell(k):
        return "<br>".join(f"{k}: “{x}”" for x in h[k]) if h[k] else ""
    hints = "<br>".join(x for x in (cell("state"), cell("place"), cell("sea/mountain")) if x) or "—"
    out.append(f"| {i} | `{p['id']}`<br>{p['town']}, {p['region']} | [listing]({p['source_url']}) | {p['condition']} · {p['setting']} | {hints} |")
(root / "docs/review-sheet.md").write_text("\n".join(out) + "\n")
print(len(rows), "homes")
