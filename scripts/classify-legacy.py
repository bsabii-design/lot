#!/usr/bin/env python3
"""Builds data/classification.json: the new filter attributes, next to (never inside) data/properties.json.

Only unambiguous, label-for-label moves from the legacy fields are written. Everything else stays unknown
(missing key). Nothing is inferred from descriptions or photos. See docs/filter-taxonomy.md for the crosswalk.
Run: python3 scripts/classify-legacy.py
"""
import json, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
props = json.loads((root / "data/properties.json").read_text())["properties"]

TYPE = {"Cottage": "cottage", "Farmhouse": "farmhouse"}            # same word, describes the building
SETTLEMENT = {"Town": "town"}                                      # "Village" is NOT moved: hamlets are labelled Village (audit 4.3)
LANDSCAPE = {"Countryside": "countryside", "Mountains": "mountains", "Coastal": "coastal"}
FEATURE = {                                                        # a legacy tag says the thing is there; absence says nothing
    "garden": "garden", "stone": "stone", "historic": "historic", "original features": "original_features",
    "outbuildings": "outbuildings", "garage": "garage", "terrace": "terrace", "fireplace": "fireplace",
    "views": "views", "pool": "pool",
}  # not moved: "renovation" (means both "to renovate" and "renovated"), "land" (duplicates the plot size), "walkable village"

out = {}
for p in props:
    e = {}
    if p["property_type"] in TYPE:
        e["property_type"] = {"value": TYPE[p["property_type"]], "basis": "legacy"}
    if p["setting"] in SETTLEMENT:
        e["settlement"] = {"value": SETTLEMENT[p["setting"]], "basis": "legacy"}
    if p["setting"] in LANDSCAPE:
        e["landscape"] = {"value": [LANDSCAPE[p["setting"]]], "basis": "legacy"}
    feats = [FEATURE[t] for t in p["features"] if t in FEATURE]
    if feats:
        e["features"] = {"value": sorted(feats), "basis": "legacy"}
    # habitability and renovation_level are never derived from `condition` or photos: they stay unknown until reviewed
    out[p["id"]] = e

doc = {
    "_about": "New filter attributes, keyed by property id. A missing key means UNKNOWN (never false). basis: legacy = moved label-for-label from the old fields, not reviewed; stated / derived = checked against the listing (evidence required). See docs/filter-taxonomy.md.",
    "properties": out,
}
(root / "data/classification.json").write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
print(len(out), "records;", sum(1 for e in out.values() if e), "with at least one value")
