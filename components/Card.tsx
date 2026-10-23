"use client";

import Link from "next/link";
import Slideshow from "./Slideshow";
import Glossed from "./Glossed";
import SaveButton from "./SaveButton";
import { archived, placeLine, price } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Property } from "@/lib/types";

interface Props {
  p: Property;
  /** its catalogue number ("01") */
  number: string;
  /** the first card's photo is the page's main image: load it eagerly */
  first?: boolean;
  onTag: (kind: "type" | "condition", value: string) => void;
}

/** One feed entry, laid out like the Cargo feed: the photos, a caption under them, then a row — number and name on the
    left, price, place and text on the right, "(See home…)" at its end. The panel with the whole home opens over the feed. */
export default function Card({ p, number, first, onTag }: Props) {
  const sold = archived(p);
  const tag = (kind: "type" | "condition", value: string) => (
    <button className="tag" onClick={() => onTag(kind, value)}>
      <span className="lab" data-t={`#${value.toLowerCase()}`}>#{value.toLowerCase()}</span>
    </button>
  );

  return (
    <article className={cn("card", sold && "sold")}>
      <Slideshow images={p.images} alt={p.title} sold={sold} priority={first} />
      <div className="crow">
        <div className="cleft">
          <p className="ctitle"><span className="num">{number}</span>{p.title}</p>
          <p className="card-tags">
            {tag("type", p.property_type)}
            {tag("condition", p.condition)}
          </p>
        </div>
        <div className="cright">
          <p className="cwhere">
            <span className="price">
              {sold ? (
                <>Sold <span className="sub">&mdash; last listed for {price(p.original_listing_price || p.price)}</span></>
              ) : (
                <>{price(p.price)}{p.status === "under_offer" && <span className="status-note"> &middot; under offer</span>}</>
              )}
            </span>
            <br />
            <span className="where">{placeLine(p)}</span>
          </p>
          {p.short_description && <p className="card-desc"><Glossed text={p.short_description} /></p>}
          <p className="cactions">
            <Link className="more" href={`/homes/${p.slug}`} scroll={false}>(See home...)</Link>
            <SaveButton id={p.id} />
          </p>
        </div>
      </div>
    </article>
  );
}
