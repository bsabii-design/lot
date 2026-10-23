import { Suspense } from "react";
import { notFound } from "next/navigation";
import HomePanel from "@/components/HomePanel";
import OverlayShell from "@/components/OverlayShell";
import { getProperty } from "@/lib/properties";

/* Opened from the feed: the home as a panel over it (the feed stays mounted behind). */
async function Panel({ params }: Pick<PageProps<"/homes/[slug]">, "params">) {
  const { slug } = await params;
  const p = getProperty(slug);
  if (!p) notFound();
  return (
    <OverlayShell modal label={p.title}>
      <HomePanel p={p} />
    </OverlayShell>
  );
}

export default function ModalHome({ params }: PageProps<"/homes/[slug]">) {
  return (
    <Suspense fallback={null}>
      <Panel params={params} />
    </Suspense>
  );
}
