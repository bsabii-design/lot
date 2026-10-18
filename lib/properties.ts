import data from "@/data/properties.json";
import type { Property } from "./types";

/* Bundled at build time: the catalogue is a file in the repo for now.
   Later this is the one place to swap for Airtable / Supabase. */
export const properties = (data as unknown as { properties: Property[] }).properties;

export const getProperty = (slug: string) => properties.find((p) => p.slug === slug);
