"use client";

import { shareHome } from "@/lib/share";

/** "(Share)": opens the device's share sheet (or our own small window where there is none). The brackets are plain text, as in the Cargo layout. */
export default function ShareButton({ title, slug }: { title: string; slug: string }) {
  return (
    <>
      (<button
        className="lk ul"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void shareHome(title, `/homes/${slug}`);
        }}
      >
        Share
      </button>)
    </>
  );
}
