"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { RETURN_KEY } from "@/lib/cn";

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
      <Icon name="arrow-left" className="arr" /> Back
    </Link>
  );
}
