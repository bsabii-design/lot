import Price from "./Price";
import Glossed from "./Glossed";
import Icon from "./Icon";
import PhotoColumn from "./PhotoColumn";
import { seaKm } from "@/lib/facts";
import MiniMapLazy from "./MiniMapLazy";
import { CloseLink } from "./PanelLinks";
import SaveButton from "./SaveButton";
import Ago from "./Ago";
import { archived, placeLine } from "@/lib/format";
import type { Property } from "@/lib/types";

const STATUS = { available: "Available", under_offer: "Under offer", sold: "Sold", unavailable: "No longer available" } as const;
const span = (n: number) => ({ "--span": n }) as React.CSSProperties;

/** A home's page, built like the project panel of the Cargo "Basic Feed": number, name and "(Close)"; the photos
    stacked in one column; the map; two equal columns of caption text (the facts, then the text and buttons); and "(Return to homes)" with the date at the foot. */
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
    ["To the sea", seaKm(p) !== null ? `about ${seaKm(p)} km` : null],
  ].filter(([, v]) => v != null && v !== "") as [string, string | number][];

  return (
    <>
      <div className="cg-set">
        <div className="cg-u" style={span(8)}>
          <h1 className="sr-only">{p.title}</h1>
          {sold ? <>Sold &mdash; last listed for <Price value={p.original_listing_price || p.price} id={p.id} /></> : <Price value={p.price} id={p.id} />}
          {" "}{placeLine(p)}
        </div>
        <div className="cg-u" style={span(4)}>
          <div className="ui" style={{ textAlign: "right" }}><SaveButton id={p.id} /> &nbsp;<CloseLink>Close</CloseLink></div>
        </div>
      </div>
      <div className="cg-split">
        {/* the photos scroll, the map is the last tile of them ... */}
        <PhotoColumn images={p.images} title={p.title}>
          {p.lat != null && <div className="cg-tile"><MiniMapLazy p={p} /></div>}
          <p className="ui cg-added"><Ago date={p.date_added} prefix="Added " /></p>
        </PhotoColumn>
        {/* ... while the text stays put: the details, then the text */}
        <aside className="cg-info">
          <div className="cg-scroll">
            <dl className="datalist cg-block cg-first">
              {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
            {p.short_description && (
              <p className="cg-block">
                {[...p.short_description.split("\n"), ...(p.description_more ? [p.description_more] : [])].map((para, i) => (
                  <span key={i}>
                    {i > 0 && <><br />{"\u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 "}</>}
                    <Glossed text={para} focusable />
                  </span>
                ))}
              </p>
            )}
          </div>
        </aside>
      </div>
      {/* the way out, the width of the panel, always on screen */}
      <a className="pr cta" href={p.source_url} target="_blank" rel="noopener" aria-label="View listing">
        View listing <Icon name="arrow-up-right" size="1.1em" />
      </a>
    </>
  );
}
