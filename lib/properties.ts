import data from "@/data/properties.json";
import classification from "@/data/classification.json";
import type { Facts, Property } from "./types";

/* Bundled at build time: the catalogue is a file in the repo for now.
   Later this is the one place to swap for Airtable / Supabase.
   The records are published as they are; the new filter attributes live in data/classification.json and are
   attached here (a record without an entry has no facts, i.e. everything unknown). */
const facts = (classification as unknown as { properties: Record<string, Facts> }).properties;
export const properties: Property[] = (data as unknown as { properties: Property[] }).properties.map((p) => ({ ...p, facts: facts[p.id] }));

export const getProperty = (slug: string) => properties.find((p) => p.slug === slug);
