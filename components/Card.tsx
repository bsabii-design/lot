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

/** One feed page, built like the Cargo "Basic Feed": the slideshow with its caption, then a row of two equal columns —
    number and name on the left; price, place, text and "(See home...)" on the right. */
export default function Card({ p, number, first, onTag }: Props) {
  const sold = archived(p);
  const tag = (kind: "type" | "condition", value: string) => (
    <button className="tag lk" onClick={() => onTag(kind, value)}>
      <span className="lab" data-t={`#${value.toLowerCase()}`}>#{value.toLowerCase()}</span>
    </button>
  );

  return (
    <article className={cn("cg-page", sold && "sold")}>
      <div className="cg">
        <Slideshow images={p.images} alt={p.title} priority={first} />
        <div className="cg-set" data-stack="true">
          <div className="cg-u" style={{ "--span": 6 } as React.CSSProperties}>
            {number} &nbsp; &nbsp;{p.title}
          </div>
          <div className="cg-u" style={{ "--span": 6 } as React.CSSProperties}>
            <span className="caption">
              <span className="price">
                {sold ? <>Sold <span className="sub">&mdash; last listed for {price(p.original_listing_price || p.price)}</span></> : price(p.price)}
              </span>
              {!sold && p.status === "under_offer" && <span className="status-note"> &middot; under offer</span>}
              , {placeLine(p)}
              {p.short_description && <> &mdash; <Glossed text={p.short_description} /></>}
              {" "}(<Link href={`/homes/${p.slug}`} scroll={false}>See home...</Link>)
              <br />
              <SaveButton id={p.id} />
              {" "}{tag("type", p.property_type)}{tag("condition", p.condition)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
