"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

const PanelContext = createContext<{ close: () => void; modal: boolean }>({ close: () => {}, modal: false });
export const usePanel = () => useContext(PanelContext);

/** The panel that opens over the feed, as in the Cargo layout: the right two thirds are white (the screen is three columns), the feed stays behind it
    faded (a text page — About, Privacy — is `wide`: the white covers the whole page). Esc, a click outside the panel or "(Close)" closes it. Opened from the feed it is an intercepted route
    (back closes it); on a direct visit to /homes/<slug> there is nothing behind, and closing goes to the feed. */
export default function OverlayShell({ children, modal, label, sold, wide }: { children: ReactNode; modal: boolean; label: string; sold?: boolean; wide?: boolean }) {
  const router = useRouter();
  const content = useRef<HTMLDivElement>(null);
  const close = useCallback(() => { if (modal) router.back(); else router.push("/"); }, [modal, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("has-panel");
    content.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("has-panel");
    };
  }, [close]);

  return (
    <PanelContext.Provider value={{ close, modal }}>
      <div
        className={cn("cg-ov", sold && "sold", wide && "wide")}
        role="dialog"
        aria-label={label}
        onMouseDown={(e) => { if (!(e.target as Element).closest(".cg-ovcontent")) close(); }}
      >
        <div className="cg-ovpage">
          <div className="cg-ovlayout">
            <div className="cg-ovcontent cg" ref={content} tabIndex={-1}>{children}</div>
          </div>
        </div>
      </div>
    </PanelContext.Provider>
  );
}
