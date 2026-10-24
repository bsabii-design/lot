"use client";

import Link from "next/link";
import Slideshow from "./Slideshow";
import Glossed from "./Glossed";
import SaveButton from "./SaveButton";
import Price from "./Price";
import { archived, placeLine } from "@/lib/format";
import Facts from "./Facts";
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
        <Slideshow images={p.images} alt={p.title} priority={first} href={`/homes/${p.slug}`} />
        {/* the whole row under the photo is one target: the "See home..." link stretches over it (Save and the French-word
            hints stay on top of it) */}
        <div className="cg-set cg-row" data-stack="true">
          <div className="cg-u" style={{ "--span": 6 } as React.CSSProperties}>
            {sold ? <>Sold &mdash; last listed for <Price value={p.original_listing_price || p.price} id={p.id} /></> : <Price value={p.price} id={p.id} />}
            {!sold && p.status === "under_offer" && <span className="status-note"> &middot; under offer</span>}
            {" "}{placeLine(p)}
          </div>
          <div className="cg-u" style={{ "--span": 6 } as React.CSSProperties}>
            <Facts p={p} className="cg-facts-above" />
            <span className="caption">
              {p.short_description && <span className="clamp"><Glossed text={p.short_description} /></span>}
              <span className="more">(<Link className="ul cg-stretch" href={`/homes/${p.slug}`} scroll={false}>See home...</Link>)</span>
            </span>
            <div className="cg-save"><SaveButton id={p.id} /></div>
          </div>
        </div>
      </div>
    </article>
  );
}
