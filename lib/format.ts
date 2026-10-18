import type { Property } from "./types";

export const imageSrc = (path: string) => "/" + path.replace(/^\//, "");

export const archived = (p: Property) => p.status === "sold" || p.status === "unavailable";

export const price = (n: number) => "€" + n.toLocaleString("en-US");

/** €139k: short enough for a map bubble (the exact price is in the preview). */
export const priceShort = (n: number) => "€" + Math.round(n / 1000) + "k";

export function metaLine(p: Property) {
  const parts: string[] = [];
  if (p.size_m2) parts.push(p.size_m2 + " m²");
  if (p.bedrooms) parts.push(p.bedrooms + " bed");
  if (p.highlights?.length) parts.push(p.highlights[0]);
  return parts.join(" · ");
}

export function ago(dateStr: string, now = Date.now()) {
  const days = Math.max(0, Math.floor((now - new Date(dateStr + "T00:00:00").getTime()) / 86400000));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return days + " days ago";
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (days < 31) return weeks + " weeks ago";
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return months + " months ago";
  const years = Math.floor(days / 365);
  return years === 1 ? "1 year ago" : years + " years ago";
}

export const placeLine = (p: Property) => `${p.town}, ${p.region}, ${p.country}`;
