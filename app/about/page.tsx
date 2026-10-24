import type { Metadata } from "next";
import { About } from "@/components/InfoPages";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return <About modal={false} />;
}
