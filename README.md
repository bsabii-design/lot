# LOT (Next.js)

Curated discovery of affordable French homes (up to ~€150k). Not an estate agency: every home links to its original listing.

- Next.js (App Router, Cache Components) + TypeScript + Tailwind CSS v4
- Map: MapLibre GL + OpenFreeMap (labels in self-hosted Tinos, see `public/fonts`)
- Data: `data/properties.json` (schema in `data/schema.md`), photos in `public/images/<slug>/`
- Design rules (sizes, colours, buttons, the one hairline): `docs/design-rules.md`

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 26 home pages are generated statically
```

Light theme only. Saved homes live in the browser (`localStorage`).
