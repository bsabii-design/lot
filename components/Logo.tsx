"use client";

import Link from "next/link";
import { RETURN_KEY } from "@/lib/cn";

export default function Logo() {
  return (
    <Link className="logo" href="/" onClick={() => { try { sessionStorage.removeItem(RETURN_KEY); } catch {} }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="LOT" />
    </Link>
  );
}
