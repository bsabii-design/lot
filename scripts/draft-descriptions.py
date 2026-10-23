#!/usr/bin/env python3
"""Writes data/description-drafts.json: a second paragraph for every home, built ONLY from fields already in its record
(living area, bedrooms, bathrooms, plot, listed features, place). Nothing is inferred from photos, from the old
`condition` / `setting` / `property_type` labels (unreviewed) or from the first paragraph. A missing value is left out,
never guessed. These are drafts for the editor to rewrite; properties.json is not touched.
Run: python3 scripts/draft-descriptions.py"""
import json, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
props = json.loads((root / "data/properties.json").read_text())["properties"]

REGION = {"Bretagne": "Brittany", "Normandie": "Normandy", "Corse": "Corsica", "Bourgogne-Franche-Comté": "Burgundy-Franche-Comté"}
# tags that name a thing the listing mentions; "renovation" (means two opposite things) and "land" (= the plot) are left out
FEATURE = {
    "garden": "garden", "terrace": "terrace", "pool": "pool", "garage": "garage", "outbuildings": "outbuildings",
    "fireplace": "fireplace", "views": "views", "stone": "stone", "historic": "historic", "original features": "original features",
}

def plural(n, word):
    return f"{n} {word}" + ("" if n == 1 else "s")

def num(n):
    return f"{n:,}"

out = {}
for p in props:
    parts = []
    beds, baths = p.get("bedrooms"), p.get("bathrooms")
    rooms = []
    if beds is not None:
        rooms.append(plural(beds, "bedroom"))
    if baths is not None:
        rooms.append(plural(baths, "bathroom"))
    land = p.get("land_size_m2")
    # a paragraph never starts with a figure: "The property measures 80 m², with 2 bedrooms and 2 bathrooms, on a plot of …"
    if p.get("size_m2"):
        s = f"The property measures {num(p['size_m2'])} m²"
        if rooms:
            s += f", with {' and '.join(rooms)}"
    elif rooms:
        s = f"The property has {' and '.join(rooms)}"
    else:
        s = ""
    if s:
        if land:
            s += f", on a plot of {num(land)} m²"
        parts.append(s + ".")
    elif land:
        parts.append(f"The property has a plot of {num(land)} m².")
    feats = [FEATURE[t] for t in p.get("features", []) if t in FEATURE]
    if feats:
        parts.append("Listed features: " + ", ".join(feats) + ".")
    place = REGION.get(p["region"], p["region"])
    parts.append(f"Located in {p['town']}, {place}.")
    out[p["id"]] = " ".join(parts)

doc = {
    "_about": "DRAFT second paragraphs, built only from fields in each record (see scripts/draft-descriptions.py). Edit freely; properties.json is untouched. A home without an entry shows only its published description.",
    "paragraphs": out,
}
(root / "data/description-drafts.json").write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
print(len(out), "drafts")
