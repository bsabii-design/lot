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
  /** the first card's photo is the page's main image: load it eagerly */
  first?: boolean;
}

/** One feed page, built like the Cargo "Basic Feed": the slideshow with its caption, then a row of two equal columns —
    price and place on the left; the text and "(See home...)  (Save)" on the right. */
export default function Card({ p, first }: Props) {
  const sold = archived(p);
  return (
    <article className={cn("cg-page", sold && "sold")}>
      <div className="cg">
        <Slideshow images={p.images} alt={p.title} priority={first} />
        <div className="cg-set" data-stack="true">
          {/* left: what it costs and where it is */}
          <div className="cg-u" style={{ "--span": 6 } as React.CSSProperties}>
            <span className="pr">{sold ? <>Sold <span className="sub">&mdash; last listed for {price(p.original_listing_price || p.price)}</span></> : price(p.price)}</span>
            {!sold && p.status === "under_offer" && <span className="status-note"> &middot; under offer</span>}
            <br />
            {placeLine(p)}
          </div>
          {/* right: the story, then the two things you can do with it */}
          <div className="cg-u" style={{ "--span": 6 } as React.CSSProperties}>
            {p.short_description && <span className="caption"><Glossed text={p.short_description} /></span>}
            <br />
            (<Link className="ul" href={`/homes/${p.slug}`} scroll={false}>See home...</Link>) &nbsp;<SaveButton id={p.id} />
          </div>
        </div>
      </div>
    </article>
  );
}
