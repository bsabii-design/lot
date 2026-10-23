import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePanel from "@/components/HomePanel";
import OverlayShell from "@/components/OverlayShell";
import { getProperty, properties } from "@/lib/properties";
import { placeLine, price } from "@/lib/format";

export function generateStaticParams() {
  return properties.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/homes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) return {};
  const description = `${price(p.price)} · ${placeLine(p)}. ${p.short_description}`;
  return {
    title: p.title,
    description,
    openGraph: { title: p.title, description, images: [{ url: "/" + p.images[0] }] },
  };
}

async function Home({ params }: Pick<PageProps<"/homes/[slug]">, "params">) {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) notFound();
  return (
    <OverlayShell modal={false} label={p.title}>
      <HomePanel p={p} />
    </OverlayShell>
  );
}

export default function HomePage({ params }: PageProps<"/homes/[slug]">) {
  return (
    <Suspense fallback={null}>
      <Home params={params} />
    </Suspense>
  );
}
