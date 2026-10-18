import type { MetadataRoute } from "next";
import { properties } from "@/lib/properties";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    { url: base },
    ...properties.map((p) => ({ url: `${base}/homes/${p.slug}`, lastModified: p.last_checked })),
  ];
}
