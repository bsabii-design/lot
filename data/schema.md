# Property schema

Each entry in properties.json:

| field | type | notes |
|---|---|---|
| id | string | short unique id |
| slug | string | e.g. gourdon-village-house-a43147 |
| title | string | editorial title |
| price | number | current asking price |
| currency | string | "EUR" |
| country | string | "France" |
| region | string | e.g. "Occitanie" |
| town | string | commune/town |
| lat / lng | number\|null | approx if only town known |
| approximate_location | boolean | true when geocoded from town |
| size_m2 | number\|null | |
| land_size_m2 | number\|null | |
| bedrooms | number\|null | |
| bathrooms | number\|null | |
| property_type | string | Village house, Cottage, Farmhouse, Stone house, Townhouse, Country house, Historic house, Barn / conversion, Other |
| condition | string | Move-in ready, Needs some work, Renovation project |
| setting | string | Village, Countryside, Town, Coastal, Mountains |
| features | string[] | controlled tags: stone, historic, original features, garden, land, pool, terrace, garage, outbuildings, views, fireplace, renovation, walkable village |
| images | string[] | paths under images/<slug>/ |
| short_description | string | |
| status | string | available, under_offer, sold |
| source_name | string | e.g. "Leggett" |
| source_url | string | original listing |
| source_reference | string\|null | e.g. "A43147NB46" |
| date_added | string | YYYY-MM-DD |
| last_checked | string | YYYY-MM-DD |
| original_listing_price | number\|null | kept when archived |

## data/classification.json

The new filter attributes (property type, settlement, landscape, features, habitability, renovation level), keyed by property id, kept separate from properties.json. A missing key means unknown. See docs/filter-taxonomy.md.
