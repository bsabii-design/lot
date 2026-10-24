import type { Metadata } from "next";
import { Privacy } from "@/components/InfoPages";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return <Privacy modal={false} />;
}
