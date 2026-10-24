#!/usr/bin/env python3
"""Computes, for every home, the straight-line distance to the nearest coast, and writes data/geo.json.

Input: Natural Earth 10m coastline (public domain), given as the one argument, e.g.
  python3 -I scripts/sea-distance.py /path/to/ne_10m_coastline.geojson
Method: the distance from the home's point (lat/lng) to the nearest segment of the coastline, on a local flat projection (good to well under 1%
at these distances). The coordinates in our records are the commune's centre, not the house, so the result is good to roughly 5-10 km: it is
stored as a distance AND the precision it can be quoted at, and the site only says "sea within N km" with N a round limit that the
uncertainty cannot change much. Nothing here is judged by a person: basis is "derived" (computed), method named.
"""
import json, math, pathlib, sys

root = pathlib.Path(__file__).resolve().parent.parent
props = json.loads((root / "data/properties.json").read_text())["properties"]
coast = json.loads(pathlib.Path(sys.argv[1]).read_text())

# only the coast near the homes matters: keep the segments inside a box around France
LAT0, LAT1, LNG0, LNG1 = 36.0, 55.0, -12.0, 12.0
lines = []
for f in coast["features"]:
    g = f["geometry"]
    parts = g["coordinates"] if g["type"] == "MultiLineString" else [g["coordinates"]]
    for part in parts:
        pts = [(la, ln) for ln, la in part if LAT0 <= la <= LAT1 and LNG0 <= ln <= LNG1]
        if len(pts) > 1:
            lines.append([(la, ln) for ln, la in part])

R = 6371.0088
def km_to_segment(lat, lng, a, b):
    k = math.cos(math.radians(lat))
    ax, ay = (a[1] - lng) * k * math.pi / 180 * R, (a[0] - lat) * math.pi / 180 * R
    bx, by = (b[1] - lng) * k * math.pi / 180 * R, (b[0] - lat) * math.pi / 180 * R
    dx, dy = bx - ax, by - ay
    if dx == dy == 0:
        return math.hypot(ax, ay)
    t = max(0.0, min(1.0, -(ax * dx + ay * dy) / (dx * dx + dy * dy)))
    return math.hypot(ax + t * dx, ay + t * dy)

out = {}
for p in props:
    if p["lat"] is None or p["lng"] is None:
        continue
    best = 1e9
    for line in lines:
        for a, b in zip(line, line[1:]):
            # a quick reject: the segment is far away in latitude
            if abs(a[0] - p["lat"]) > 3 and abs(b[0] - p["lat"]) > 3:
                continue
            d = km_to_segment(p["lat"], p["lng"], a, b)
            if d < best:
                best = d
    out[p["id"]] = {"sea_km": round(best, 1)}

doc = {
    "_about": "Derived, not checked by a person: the straight-line distance (km) from each home's point to the nearest coast (Natural Earth 10m coastline, public domain). The point is the commune's centre, so the distance is good to roughly 5-10 km; the site quotes it only as 'sea within N km' for round N. Regenerate with scripts/sea-distance.py.",
    "basis": "derived",
    "precision_km": 10,
    "homes": out,
}
(root / "data/geo.json").write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
vals = sorted(v["sea_km"] for v in out.values())
print(len(out), "homes; nearest", vals[0], "km, farthest", vals[-1], "km")
print("within 10:", sum(v <= 10 for v in vals), " within 25:", sum(v <= 25 for v in vals), " within 50:", sum(v <= 50 for v in vals), " within 100:", sum(v <= 100 for v in vals))
