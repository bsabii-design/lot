import data from "@/data/glossary.json";

export interface GlossaryEntry {
  term: string;
  aliases: string[];
  /** quoted word for word from the source, never paraphrased */
  definition: string;
  source: { name: "Wiktionary" | "Wikipedia"; url: string; licence: string; retrieved: string };
}

export const glossary = data as GlossaryEntry[];

/* one pattern for every alias, longest first, so "Petite Cité de Caractère" wins over a shorter word inside it */
const aliases = glossary
  .flatMap((e) => e.aliases.map((a) => ({ a, e })))
  .sort((x, y) => y.a.length - x.a.length);
const lookup = new Map(aliases.map(({ a, e }) => [a.toLowerCase(), e]));
const pattern = new RegExp(
  "(?<![\\p{L}\\p{N}])(" + aliases.map(({ a }) => a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")(?![\\p{L}\\p{N}])",
  "giu",
);

export type Part = string | { text: string; entry: GlossaryEntry };

/** Splits a text into plain parts and glossary terms. Only the first use of each term is marked. */
export function annotate(text: string): Part[] {
  const parts: Part[] = [];
  const seen = new Set<string>();
  let last = 0;
  for (const m of text.matchAll(pattern)) {
    const entry = lookup.get(m[0].toLowerCase());
    if (!entry || seen.has(entry.term)) continue;
    seen.add(entry.term);
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push({ text: m[0], entry });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
