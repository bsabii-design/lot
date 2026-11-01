import { facts } from "@/lib/facts";
import type { Property } from "@/lib/types";

/** The compact line of facts that decide whether to look further (state, settlement, size, bedrooms, plot, sea): the value in the text
    colour, the quiet word after it in grey, a wide gap between facts. Only what is known is shown. */
export default function Facts({ p, className }: { p: Property; className?: string }) {
  const list = facts(p);
  const underOffer = p.status === "under_offer";
  if (!list.length && !underOffer) return null;
  return (
    <div className={className ? `facts ${className}` : "facts"}>
      {/* a home under offer says so first, above its facts (its price block is grey too) */}
      {underOffer && <span className="status-line">Under offer</span>}
      {list.map(([v, w]) => <span key={v + (w ?? "")}>{v}{w && <> <span className="w">{w}</span></>}</span>)}
    </div>
  );
}
