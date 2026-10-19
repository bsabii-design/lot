"use client";

import Link from "next/link";
import Gallery from "./Gallery";
import Glossed from "./Glossed";
import SaveButton from "./SaveButton";
import { archived, placeLine, price } from "@/lib/format";
import { RETURN_KEY, cn } from "@/lib/cn";
import type { Property } from "@/lib/types";

interface Props {
  p: Property;
  /** the first card's photo is the page's main image: load it eagerly */
  first?: boolean;
  onTag: (kind: "type" | "condition", value: string) => void;
}

/** One feed entry: photo, price + place, Save, description, tags. The whole card opens the home. */
export default function Card({ p, first, onTag }: Props) {
  const sold = archived(p);
  const tag = (kind: "type" | "condition", value: string) => (
    <button
      className="tag"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onTag(kind, value);
      }}
    >
      <span className="lab" data-t={`#${value.toLowerCase()}`}>#{value.toLowerCase()}</span>
    </button>
  );

  return (
    <Link
      href={`/homes/${p.slug}`}
      className={cn("card", sold && "sold")}
      onClick={() => { try { sessionStorage.setItem(RETURN_KEY, "1"); } catch {} }}
    >
      <Gallery images={p.images} alt={p.title} sold={sold} priority={first} resetWhenOffscreen />
      <div className="card-head">
        <div>
          <span className="price">
            {sold ? (
              <>Sold <span className="sub">&mdash; last listed for {price(p.original_listing_price || p.price)}</span></>
            ) : (
              <>{price(p.price)}{p.status === "under_offer" && <span className="status-note"> &middot; under offer</span>}</>
            )}
          </span>
          <br />
          <span className="where">{placeLine(p)}</span>
        </div>
        <SaveButton id={p.id} />
      </div>
      {p.short_description && <p className="card-desc"><Glossed text={p.short_description} /></p>}
      <p className="card-tags">
        {tag("type", p.property_type)}
        {tag("condition", p.condition)}
      </p>
    </Link>
  );
}
