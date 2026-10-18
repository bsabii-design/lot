"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RETURN_KEY } from "@/lib/cn";

export function ArrowLeft() {
  return (
    <svg className="arr" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 12H4M4 12L10 18M4 12L10 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Back to the feed exactly as it was left (filters, scroll) when the visitor came from it, otherwise to the feed. */
export default function BackLink() {
  const router = useRouter();
  return (
    <Link
      className="back"
      href="/"
      onClick={(e) => {
        e.preventDefault();
        let fromFeed = false;
        try { fromFeed = sessionStorage.getItem(RETURN_KEY) === "1"; } catch {}
        if (fromFeed && window.history.length > 1) router.back();
        else router.push("/");
      }}
    >
      <ArrowLeft /> Back
    </Link>
  );
}
