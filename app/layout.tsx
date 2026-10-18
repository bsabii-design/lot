import type { Metadata } from "next";
import Logo from "@/components/Logo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "LOT", template: "LOT — %s" },
  description: "A small selection of homes across Europe that caught our eye.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <Logo />
        {children}
      </body>
    </html>
  );
}
