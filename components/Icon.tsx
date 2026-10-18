import { cn } from "@/lib/cn";

/* One icon set: 24-unit grid, round caps, and a stroke weight tied to the type (--icon-stroke in globals.css),
   so every icon is optically as heavy as the letters next to it, at any size. */
const PATHS = {
  plus: "M6 12H18M12 6V18",
  minus: "M6 12H18",
  "arrow-left": "M20 12H4M4 12L10 18M4 12L10 6",
  "arrow-up-right": "M7 17L17 7M17 7H7M17 7V17",
  "chevron-left": "M15 5L8 12L15 19",
  "chevron-right": "M9 5L16 12L9 19",
  close: "M6 6L18 18M18 6L6 18",
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, size = "0.875rem", className }: { name: IconName; size?: string; className?: string }) {
  return (
    <svg className={cn("icon", className)} style={{ width: size, height: size }} viewBox="0 0 24 24" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
