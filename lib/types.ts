/** One new-taxonomy attribute with where it came from. A missing attribute is UNKNOWN, never false or zero. */
export interface Classified<T> {
  value: T;
  /** legacy = moved label-for-label from the old fields, not reviewed; stated / derived = checked against the listing */
  basis: "legacy" | "stated" | "derived";
}

/** The attributes behind the filters that the old fields cannot answer reliably (data/classification.json). */
export interface Facts {
  property_type?: Classified<string>;
  settlement?: Classified<string>;
  landscape?: Classified<string[]>;
  /** features known to be present; a feature that is not listed is unknown, not absent */
  features?: Classified<string[]>;
  habitability?: Classified<string>;
  renovation_level?: Classified<string>;
}

export type Status = "available" | "under_offer" | "sold" | "unavailable";

/** One home, as stored in data/properties.json (see data/schema.md). */
export interface Property {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  country: string;
  region: string;
  town: string;
  lat: number | null;
  lng: number | null;
  approximate_location: boolean;
  size_m2: number | null;
  land_size_m2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string;
  condition: string;
  setting: string;
  features: string[];
  highlights?: string[];
  /** paths under images/<slug>/, without a leading slash */
  images: string[];
  short_description: string;
  status: Status;
  source_name: string;
  source_url: string;
  source_reference: string | null;
  date_added: string;
  last_checked: string;
  original_listing_price: number | null;
  /** added at load time from data/classification.json; absent = nothing classified yet */
  facts?: Facts;
  /** computed from the coordinates (data/geo.json): the distance to the nearest coast in km, good to roughly 5-10 km */
  geo?: { sea_km: number };
  /** a draft second paragraph (data/description-drafts.json), built from the record's own fields; absent = none */
  description_more?: string;
}

export type Tab = "all" | "favourites" | "archive";
export type View = "list" | "map";

/** One numeric facet: a quick preset (one at a time) or a typed min–max, never both. Strings so an empty box is "". */
export interface NumRange {
  preset: string;
  min: string;
  max: string;
}

/** Between facets AND; inside a set, OR (features: all selected must be present). */
export interface Filters {
  price: NumRange;
  regions: string[];
  conditions: string[];
  area: NumRange;
  /** minimum bedrooms ("" = any) */
  bedrooms: string;
  plot: NumRange;
  settlements: string[];
  landscapes: string[];
  types: string[];
  features: string[];
  /** the #hashtags on cards and home pages still filter on the old labels */
  tagTypes: string[];
  tagConditions: string[];
}
