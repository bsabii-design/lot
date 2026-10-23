import SaveButton from "./SaveButton";
import Price from "./Price";
import Ago from "./Ago";
import Glossed from "./Glossed";
import Icon from "./Icon";
import Slideshow from "./Slideshow";
import MiniMapLazy from "./MiniMapLazy";
import { CloseLink } from "./PanelLinks";
import { archived, placeLine } from "@/lib/format";
import type { Property } from "@/lib/types";

const STATUS = { available: "Available", under_offer: "Under offer", sold: "Sold", unavailable: "No longer available" } as const;
const span = (n: number) => ({ "--span": n }) as React.CSSProperties;

/** A home's page, built like the project panel of the Cargo "Basic Feed": number, name and "(Close)"; the photos
    in the same slideshow as the feed; the map; two equal columns of caption text (the facts, then the text and buttons); and "(Return to homes)" with the date at the foot. */
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
        <div className="cg-u" style={span(9)}>
          <h1 className="sr-only">{p.title}</h1>
          {sold ? <>Sold &mdash; last listed for <Price value={p.original_listing_price || p.price} /></> : <Price value={p.price} />}
          {" "}{placeLine(p)}
        </div>
        <div className="cg-u" style={span(3)}>
          <div className="ui" style={{ textAlign: "right" }}><CloseLink>Close</CloseLink></div>
        </div>
      </div>
      <br />
      <Slideshow images={p.images} alt={p.title} priority sizes="(max-aspect-ratio: 4/5) 100vw, 75vw" />
      <br />
      {p.lat != null && (
        <>
          <MiniMapLazy p={p} />
          {p.approximate_location && <><br /><span className="ui approx-note">Approximate location — exact address not published.</span><br /></>}
        </>
      )}
      <br />
      <div className="cg-set" data-stack="true">
        <div className="cg-u" style={span(6)}>
          <span className="caption">
            Details<br /><br />
            {rows.map(([k, v]) => <span key={k}>{k}: {v}<br /></span>)}
          </span>
        </div>
        <div className="cg-u" style={span(6)}>
          {p.short_description && (
            <span className="caption">
              Description<br /><br />
              {p.short_description.split("\n").map((para, i) => (
                <span key={i}>
                  {i > 0 && <><br />{"\u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 "}</>}
                  <Glossed text={para} focusable />
                </span>
              ))}
            </span>
          )}
          <br />
          <SaveButton id={p.id} />
        </div>
      </div>
      <br />
      <a className="cta" href={p.source_url} target="_blank" rel="noopener">View listing <Icon name="arrow-up-right" /></a>
      <br /><br /><br /><br /><br />
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
