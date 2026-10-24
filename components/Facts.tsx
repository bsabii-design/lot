import { facts } from "@/lib/facts";
import type { Property } from "@/lib/types";

/** The compact line of facts that decide whether to look further (state, settlement, size, bedrooms, plot, sea): the value in the text
    colour, the quiet word after it in grey, a wide gap between facts. Only what is known is shown. */
export default function Facts({ p, className }: { p: Property; className?: string }) {
  const list = facts(p);
  if (!list.length) return null;
  return (
    <div className={className ? `facts ${className}` : "facts"}>
      {list.map(([v, w]) => <span key={v + (w ?? "")}>{v}{w && <> <span className="w">{w}</span></>}</span>)}
    </div>
  );
}
