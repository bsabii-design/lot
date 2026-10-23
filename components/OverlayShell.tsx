"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";

const PanelContext = createContext<{ close: () => void; modal: boolean }>({ close: () => {}, modal: false });
export const usePanel = () => useContext(PanelContext);

/** The panel that opens over the feed (like the project panel in the Cargo layout): the feed stays mounted behind it,
    faded; Esc, a click outside or "(Close)" closes it. Opened from the feed it is an intercepted route (back closes it);
    on a direct visit to /homes/<slug> there is nothing behind, and closing goes to the feed. */
export default function OverlayShell({ children, modal, label }: { children: ReactNode; modal: boolean; label: string }) {
  const router = useRouter();
  const panel = useRef<HTMLDivElement>(null);
  const close = useCallback(() => { if (modal) router.back(); else router.push("/"); }, [modal, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("has-panel");
    panel.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("has-panel");
    };
  }, [close]);

  return (
    <PanelContext.Provider value={{ close, modal }}>
      <div className="overlay" role="dialog" aria-label={label} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
        <div className="panel" ref={panel} tabIndex={-1}>{children}</div>
      </div>
    </PanelContext.Provider>
  );
}
