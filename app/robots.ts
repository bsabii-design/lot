import type { MetadataRoute } from "next";

/* A portfolio prototype, not a public service yet: keep it out of search engines. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
