import SaveButton from "./SaveButton";
import Ago from "./Ago";
import Glossed from "./Glossed";
import Icon from "./Icon";
import MiniMapLazy from "./MiniMapLazy";
import { CloseLink, TagLink } from "./PanelLinks";
import Image from "next/image";
import { archived, imageSrc, placeLine, price } from "@/lib/format";
import { homeNumber } from "@/lib/number";
import type { Property } from "@/lib/types";

const STATUS = { available: "Available", under_offer: "Under offer", sold: "Sold", unavailable: "No longer available" } as const;

/** A home's page, laid out like the project panel of the Cargo layout: number and name with "(Close)", the photos
    stacked, then two columns (the facts on the left, price, place, text and the buttons on the right), the map,
    and "(Return to homes)" at the foot. */
export default function HomePanel({ p }: { p: Property }) {
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
    <article className="home">
      <header className="phead">
        <h1 className="ptitle"><span className="num">{homeNumber(p.id)}</span>{p.title}</h1>
        <CloseLink>Close</CloseLink>
      </header>

      <div className={sold ? "pgallery sold" : "pgallery"}>
        {p.images.map((src, i) => (
          <div className="pimg" key={src}>
            <Image src={imageSrc(src)} alt={i ? `${p.title} ${i + 1}` : p.title} fill sizes="(max-width: 700px) 100vw, 50vw" priority={i === 0} loading={i < 2 ? "eager" : "lazy"} />
          </div>
        ))}
      </div>

      <div className="pcols">
        <div className="pfacts">
          <p className="plabel">Details</p>
          <dl className="datalist">
            {rows.filter(([, v]) => v != null && v !== "").map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </div>
        <div className="ptext">
          <p className="pwhere">
            <span className="price">
              {sold ? <>Sold <span className="sub">&mdash; last listed for {price(p.original_listing_price || p.price)}</span></> : price(p.price)}
            </span>
            <br />
            <span className="sub">{placeLine(p)}</span>
          </p>
          {p.short_description && <p className="desc"><Glossed text={p.short_description} focusable /></p>}
          <p className="pbtns">
            <a className="bk content main" href={p.source_url} target="_blank" rel="noopener">
              View listing{" "}<Icon name="arrow-up-right" className="arr" />
            </a>
            <SaveButton id={p.id} />
          </p>
          <p className="ptags">
            <TagLink kind="type" value={p.property_type} />
            <TagLink kind="condition" value={p.condition} />
          </p>
        </div>
      </div>

      {p.lat != null && (
        <div className="pmap">
          <MiniMapLazy p={p} />
          {p.approximate_location && <p className="approx-note">Approximate location — exact address not published.</p>}
        </div>
      )}

      <footer className="pfoot">
        <CloseLink>Return to homes</CloseLink>
        <Ago date={p.date_added} />
      </footer>
    </article>
  );
}
