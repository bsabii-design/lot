import { price } from "@/lib/format";

/** The price in a solid block, one cell per character like the █ redaction bars of the reference: every cell is
    0.697em wide (the width of █ in Times), so the block is as wide as that many bars. */
export default function Price({ value }: { value: number }) {
  const text = price(value);
  return (
    <span className="pr" aria-label={text}>
      {[...text].map((c, i) => <span className="pc" key={i} aria-hidden="true">{c}</span>)}
    </span>
  );
}
