import { properties } from "./properties";

/** A home's catalogue number ("01" …): its place in the catalogue, stable whatever the filters show. */
export const homeNumber = (id: string) => String(properties.findIndex((p) => p.id === id) + 1).padStart(2, "0");
