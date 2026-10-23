import type { Metadata } from "next";
import Logo from "@/components/Logo";
import "./globals.css";
import "./cargo.css";

/* Cargo's sizing: 1rem follows the window (the viewport height when it is wider than tall, the width otherwise),
   and a tall / narrow window is flagged .mobile. --cr is that rem in px. Runs before the first paint. */
const CARGO_SCALE = `(function(){var d=document.documentElement,a=matchMedia("(max-aspect-ratio: 4/5)"),b=matchMedia("(min-aspect-ratio: 2/3) and (max-height: 500px)");function m(){var P=a.matches,M=P||b.matches;d.classList.toggle("mobile",M);var w=d.clientWidth,h=innerHeight,l=0;if(h>w)l=h/w-1;l=l/0.777777778;if(l>1)l=1;var k=9;if(M&&!P)k=18;k+=5*l;var p=Math.min(w,h)/(100/k);if(p<20)p=20;var s=p*0.16;if(M)s*=Math.min(w,h)<=520?1.3:1;d.style.setProperty("--cr",s+"px")}addEventListener("resize",m,{passive:true});a.addEventListener&&a.addEventListener("change",m);b.addEventListener&&b.addEventListener("change",m);m()})();`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "LOT", template: "LOT — %s" },
  description: "A small selection of homes across Europe that caught our eye.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: CARGO_SCALE }} />
      </head>
      <body>
        <Logo />
        {children}
        {modal}
      </body>
    </html>
  );
}
