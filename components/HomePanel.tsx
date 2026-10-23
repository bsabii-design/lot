import Price, { Cells } from "./Price";
import Glossed from "./Glossed";
import Icon from "./Icon";
import MediaFrame from "./MediaFrame";
import MiniMapLazy from "./MiniMapLazy";
import { CloseLink } from "./PanelLinks";
import { archived, imageSrc, placeLine } from "@/lib/format";
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
      <div className="cg-split">
        {/* the photos scroll, the map is the last tile of them ... */}
        <div className="cg-grid cg-photos">
          {p.images.map((src, i) => (
            <MediaFrame key={src} src={imageSrc(src)} alt={i ? `${p.title} ${i + 1}` : p.title} sizes="(max-aspect-ratio: 4/5) 100vw, 38vw" priority={i === 0} />
          ))}
          {p.lat != null && <div className="cg-tile"><MiniMapLazy p={p} /></div>}
        </div>
        {/* ... while the text stays put: the text and the facts */}
        <aside className="cg-info">
          <div className="cg-scroll">
            {p.short_description && (
              <p className="cg-block cg-first">
                {[...p.short_description.split("\n"), ...(p.description_more ? [p.description_more] : [])].map((para, i) => (
                  <span key={i}>
                    {i > 0 && <><br />{"\u00a0 \u00a0 \u00a0 \u00a0 \u00a0 \u00a0 "}</>}
                    <Glossed text={para} focusable />
                  </span>
                ))}
              </p>
            )}
            <dl className="datalist cg-block">
              {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </div>
        </aside>
      </div>
      {/* the way out, the width of the panel, always on screen */}
      <a className="pr cta" href={p.source_url} target="_blank" rel="noopener" aria-label="View listing">
        <Cells text="View listing ">
          <span className="pc" aria-hidden="true"><Icon name="arrow-up-right" size="1.1em" /></span>
        </Cells>
      </a>
    </>
  );
}
