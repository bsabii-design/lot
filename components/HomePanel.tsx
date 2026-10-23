import SaveButton from "./SaveButton";
import Ago from "./Ago";
import Glossed from "./Glossed";
import Icon from "./Icon";
import MediaFrame from "./MediaFrame";
import MiniMapLazy from "./MiniMapLazy";
import { CloseLink, TagLink } from "./PanelLinks";
import { archived, imageSrc, placeLine, price } from "@/lib/format";
import type { Property } from "@/lib/types";

const STATUS = { available: "Available", under_offer: "Under offer", sold: "Sold", unavailable: "No longer available" } as const;
const span = (n: number) => ({ "--span": n }) as React.CSSProperties;

/** A home's page, built like the project panel of the Cargo "Basic Feed": number, name and "(Close)"; the photos
    stacked in one column; two equal columns of caption text (the facts, then price / place / text / buttons); the map;
    and "(Return to homes)" with the date at the foot. */
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
  ].filter(([, v]) => v != null && v !== "") as [string, string | number][];

  return (
    <>
      <div className="cg-set">
        <div className="cg-u" style={span(8)}>
          <h1 className="sr-only">{p.title}</h1>
          {placeLine(p)}
        </div>
        <div className="cg-u" style={span(4)}>
          <div className="ui" style={{ textAlign: "right" }}><CloseLink>Close</CloseLink></div>
        </div>
      </div>
      <br />
      <div className="cg-grid">
        {p.images.map((src, i) => (
          <MediaFrame key={src} src={imageSrc(src)} alt={i ? `${p.title} ${i + 1}` : p.title} sizes="(max-aspect-ratio: 4/5) 100vw, 50vw" priority={i === 0} />
        ))}
      </div>
      <br />
      <div className="cg-set" data-stack="true">
        <div className="cg-u" style={span(6)}>
          <span className="caption">
            {sold ? <>Sold &mdash; last listed for <span className="pr">{price(p.original_listing_price || p.price)}</span></> : <span className="pr">{price(p.price)}</span>}
            <br /><br />
            Details<br /><br />
            {rows.map(([k, v]) => <span key={k}>{k}: {v}<br /></span>)}
          </span>
        </div>
        <div className="cg-u" style={span(6)}>
          {p.short_description && <span className="caption"><Glossed text={p.short_description} focusable /></span>}
          <br />
          (<a className="ul" href={p.source_url} target="_blank" rel="noopener">View listing <Icon name="arrow-up-right" /></a>) &nbsp;<SaveButton id={p.id} />
          <br /><br />
          <TagLink kind="type" value={p.property_type} />
          <TagLink kind="condition" value={p.condition} />
        </div>
      </div>
      {p.lat != null && (
        <>
          <br />
          <MiniMapLazy p={p} />
          {p.approximate_location && <><br /><span className="ui approx-note">Approximate location — exact address not published.</span></>}
        </>
      )}
      <br /><br /><br /><br /><br /><br />
      <div className="cg-set">
        <div className="cg-u" style={span(6)}>
          <span className="ui"><CloseLink underline>Return to homes</CloseLink></span>
        </div>
        <div className="cg-u" style={span(6)}>
          <span className="ui"><Ago date={p.date_added} /></span>
        </div>
      </div>
    </>
  );
}
