import Term from "./Term";
import { annotate } from "@/lib/glossary";

/** A text where the French words from the glossary carry their definition. */
export default function Glossed({ text, focusable }: { text: string; focusable?: boolean }) {
  return (
    <>
      {annotate(text).map((part, i) =>
        typeof part === "string" ? part : (
          <Term key={i} entry={part.entry} focusable={focusable}>{part.text}</Term>
        ),
      )}
    </>
  );
}
