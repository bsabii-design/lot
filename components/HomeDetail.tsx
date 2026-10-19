import Link from "next/link";
import BackLink from "./BackLink";
import DetailGallery from "./DetailGallery";
import SaveButton from "./SaveButton";
import Ago from "./Ago";
import Glossed from "./Glossed";
import Icon from "./Icon";
import MiniMapLazy from "./MiniMapLazy";
import { archived, placeLine, price } from "@/lib/format";
import type { Property } from "@/lib/types";

const STATUS = { available: "Available", under_offer: "Under offer", sold: "Sold", unavailable: "No longer available" } as const;

function ViewListing({ url }: { url: string }) {
  return (
    <a className="btn" href={url} target="_blank" rel="noopener">
      View listing{" "}
      <Icon name="arrow-up-right" className="arr" />
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
      {p.short_description && <p className="desc"><Glossed text={p.short_description} focusable /></p>}
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
          <Link className="tag" href={`/?t=${encodeURIComponent(p.property_type)}`}><span className="lab" data-t={`#${p.property_type.toLowerCase()}`}>#{p.property_type.toLowerCase()}</span></Link>
          <Link className="tag" href={`/?c=${encodeURIComponent(p.condition)}`}><span className="lab" data-t={`#${p.condition.toLowerCase()}`}>#{p.condition.toLowerCase()}</span></Link>
        </span>
        <Ago date={p.date_added} />
      </p>
      <div className="source"><ViewListing url={p.source_url} /></div>
    </main>
  );
}
