import Link from "next/link";

/** The foot of the feed: "© LOT, 2026" under the left column, "About" and "Privacy" together at the right.
    (Terms and Cookies are left out for now: the site sets no cookies and sells nothing.) */
export default function Footer() {
  return (
    <footer className="cg-foot">
      <span>© LOT, 2026</span>
      <span className="cg-foot-r">
        <Link href="/about" scroll={false}>About</Link>
        <Link href="/privacy" scroll={false}>Privacy</Link>
      </span>
    </footer>
  );
}
