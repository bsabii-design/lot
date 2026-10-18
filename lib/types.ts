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
}

export type Tab = "all" | "favourites" | "archive";
export type View = "list" | "map";

export interface Range {
  presets: string[];
  min: string;
  max: string;
}

/** Every facet is a set of allowed values (any of them matches) or a min–max range. */
export interface Filters {
  types: string[];
  conditions: string[];
  settings: string[];
  regions: string[];
  bedrooms: string[];
  price: Range;
  size: Range;
}
