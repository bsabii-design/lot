import Link from "next/link";
import BackLink from "./BackLink";
import DetailGallery from "./DetailGallery";
import SaveButton from "./SaveButton";
import Ago from "./Ago";
import MiniMapLazy from "./MiniMapLazy";
import { archived, placeLine, price } from "@/lib/format";
import type { Property } from "@/lib/types";

const STATUS = { available: "Available", under_offer: "Under offer", sold: "Sold", unavailable: "No longer available" } as const;

function ViewListing({ url }: { url: string }) {
  return (
    <a className="btn visit" href={url} target="_blank" rel="noopener">
      View listing{" "}
      <svg className="arr" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

/** A home's page: photos, price and place, facts, map, tags, and the link to the original listing. */
export default function HomeDetail({ p }: { p: Property }) {
  const sold = archived(p);
  const rows: [string, string | number | null][] = [
    ["Status", STATUS[p.status] ?? p.status],
    ["Type", p.property_type],
    ["Condition", p.condition],
    ["Setting", p.setting],
    ["Size", p.size_m2 ? p.size_m2 + " m²" : null],
    ["Land", p.land_size_m2 ? p.land_size_m2 + " m²" : null],
    ["Bedrooms", p.bedrooms],
    ["Bathrooms", p.bathrooms],
    ["Features", (p.features || []).join(", ")],
  ];

  return (
    <main className="property">
      <BackLink />
      <DetailGallery images={p.images} title={p.title} sold={sold} />
      <div className="head">
        <span className="actions">
          <SaveButton id={p.id} />
          <ViewListing url={p.source_url} />
        </span>
        <span className="price">
          {sold ? <>Sold <span className="sub">&mdash; last listed for {price(p.original_listing_price || p.price)}</span></> : price(p.price)}
        </span>
        <br />
        <span className="sub">{placeLine(p)}</span>
      </div>
      {p.short_description && <p className="desc">{p.short_description}</p>}
      <dl className="datalist">
        {rows.filter(([, v]) => v != null && v !== "").map(([k, v]) => (
          <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      {p.lat != null && (
        <>
          <MiniMapLazy p={p} />
          {p.approximate_location && <p className="approx-note">Approximate location — exact address not published.</p>}
        </>
      )}
      <p className="ptags">
        <span>
          <Link className="tag" href={`/?t=${encodeURIComponent(p.property_type)}`}>#{p.property_type.toLowerCase()}</Link>
          <Link className="tag" href={`/?c=${encodeURIComponent(p.condition)}`}>#{p.condition.toLowerCase()}</Link>
        </span>
        <Ago date={p.date_added} />
      </p>
      <div className="source"><ViewListing url={p.source_url} /></div>
    </main>
  );
}
