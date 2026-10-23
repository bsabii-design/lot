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
}

/** One feed page, built like the Cargo "Basic Feed": the slideshow with its caption, then a row of two equal columns —
    number and name on the left; price, place, text and "(See home...)" on the right. */
export default function Card({ p, number, first }: Props) {
  const sold = archived(p);
  return (
    <article className={cn("cg-page", sold && "sold")}>
      <div className="cg">
        <Slideshow images={p.images} alt={p.title} priority={first} />
        <div className="cg-set" data-stack="true">
          {/* left: what it is, what it costs, where it is, how it is tagged */}
          <div className="cg-u" style={{ "--span": 6 } as React.CSSProperties}>
            <div className="cg-name">
              <span>{number}</span>
              <div>
                {p.title}
                <br /><br />
                <span className="price">
                  {sold ? <>Sold <span className="sub">&mdash; last listed for {price(p.original_listing_price || p.price)}</span></> : price(p.price)}
                </span>
                {!sold && p.status === "under_offer" && <span className="status-note"> &middot; under offer</span>}
                <br />
                <span className="where">{placeLine(p)}</span>
              </div>
            </div>
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
