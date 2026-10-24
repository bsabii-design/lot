"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Glossed from "./Glossed";

const LINES = 2;
const MORE = "(See home…)";
/* the cut never leaves an article, preposition or conjunction hanging at the end of the line */
const DANGLING = /(?:^|\s)(?:a|an|the|of|in|on|at|to|by|for|with|from|and|or|but|as|is|are|was|its|his|her|their|our|your|this|that|these|those|into|onto|over|under|near|around|while|which|who|all|also|only|just|both|very|more|most|some|any|each|every|plus|than|so|if|no|not|be|been|has|have|had|can|will|would)$/i;
/* ... nor a number whose noun was cut off ("12 km", "2,225 m²" at the end are fine, a bare "12" is not) */
const BARE_NUMBER = /(?:^|\s)\d[\d,.]*$/;
const tidy = (s: string) => {
  const trim = (x: string) => x.replace(/[\s,;:—–-]+$/, "");
  let out = trim(s);
  while (DANGLING.test(out) || BARE_NUMBER.test(out)) out = trim(out.replace(DANGLING.test(out) ? DANGLING : BARE_NUMBER, ""));
  return out;
};

/** The feed text: at most two lines, the last of them ending with "(See home…)" — the text is cut at a word so that the link
    fits on the same line. The fit is measured with a hidden copy of the caption, and again when the width changes. */
export default function FeedText({ text, href }: { text: string; href: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(text);

  useLayoutEffect(() => {
    const box = root.current, ghost = probe.current;
    if (!box || !ghost) return;
    const fit = () => {
      const max = parseFloat(getComputedStyle(box).lineHeight) * (LINES + 0.5);
      ghost.style.width = box.getBoundingClientRect().width + "px";
      const fits = (s: string) => { ghost.textContent = s + " " + MORE; return ghost.getBoundingClientRect().height <= max; };
      if (fits(text)) return setShown(text);
      const words = text.split(" ");
      let lo = 0, hi = words.length;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (fits(words.slice(0, mid).join(" "))) lo = mid; else hi = mid - 1;
      }
      setShown(tidy(words.slice(0, lo).join(" ")));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [text]);

  return (
    <span className="caption feed-text" ref={root}>
      <Glossed text={shown} />{" "}
      <Link className="ul cg-stretch" href={href} scroll={false}>{MORE}</Link>
      <span className="probe" ref={probe} aria-hidden="true" />
    </span>
  );
}
