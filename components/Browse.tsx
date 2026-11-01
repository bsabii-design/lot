"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Card from "./Card";
import Footer from "./Footer";
import Icon from "./Icon";
import FilterWindow from "./FilterWindow";
import { activeFacets, available, emptyFilters, hasInvalidRange, normalizeFilters, visible, withoutInvalid } from "@/lib/filters";
import { RETURN_KEY, STATE_KEY, cn } from "@/lib/cn";
import { warmMap } from "@/lib/map";
import type { Filters, Property, View } from "@/lib/types";

/* the map is client-only (WebGL) and loads on demand */
const MapView = dynamic(() => import("./MapView"), { ssr: false });
/** the map's code and files are fetched while the visitor is still looking at the list (after the page is idle, and again the moment Map is touched) */
const warm = () => { void import("./MapView"); warmMap(); };

interface Saved { view: View; y: number; filters: Filters }

/** The feed page: list or map, filters. Everything the visitor picks lives here. */
export default function Browse({ homes }: { homes: Property[] }) {
  const [view, setView] = useState<View>("list");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [open, setOpen] = useState(false);
  /* once the visitor has switched views, the list fades in when it comes back */
  const [switched, setSwitched] = useState(false);
  /* the window stays in the page while it fades out (a quarter of a second after it is closed) */
  const [mounted, setMounted] = useState(false);

  const avail = useMemo(() => available(homes), [homes]);
  const list = useMemo(() => visible(homes, filters), [homes, filters]);
  const facets = useMemo(() => activeFacets(filters), [filters]);
  const draftCount = useMemo(() => visible(homes, withoutInvalid(draft)).length, [homes, draft]);

  /* keep the browsing state when the visitor opens a home and comes back */
  const latest = useRef<Saved>({ view, y: 0, filters });
  useEffect(() => { latest.current = { ...latest.current, view, filters }; });

  /* Restoring from the URL and sessionStorage must wait until the browser (server and first client render
     have to match), so this is one of the places where setting state in an effect is the right tool. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    let y = 0;
    let returning = false;
    try { returning = sessionStorage.getItem(RETURN_KEY) === "1"; sessionStorage.removeItem(RETURN_KEY); } catch {}
    if (returning) {
      try {
        const s = JSON.parse(sessionStorage.getItem(STATE_KEY) || "null") as Saved | null;
        if (s) {
          setView(s.view || "list");
          setFilters(normalizeFilters(s.filters));
          y = s.y || 0;
        }
      } catch {}
    }
    if (y) requestAnimationFrame(() => window.scrollTo(0, y));

    const onScroll = () => { latest.current.y = window.scrollY; };
    const save = () => { try { sessionStorage.setItem(STATE_KEY, JSON.stringify(latest.current)); } catch {} };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", save);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", save);
      save();
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) { setMounted(true); return; }
    const t = setTimeout(() => setMounted(false), 250);
    return () => clearTimeout(t);
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const idle = (window as unknown as { requestIdleCallback?: (f: () => void) => number }).requestIdleCallback;
    const id = idle ? idle(warm) : window.setTimeout(warm, 1500);
    return () => { if (!idle) window.clearTimeout(id); };
  }, []);

  /* the filter window closes on an outside click or Escape */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as Element).closest("#filter-window, .filter-toggle")) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("click", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const clearFilters = () => setFilters(emptyFilters());

  const empty = list.length === 0;
  const where = "homes";

  return (
    <div className="browse" data-view={view}>
      <h1 className="sr-only">LOT: homes across France</h1>
      <nav className="nav">
        <Link href="/about" scroll={false}>About</Link>
      </nav>

      {view === "map" && !empty ? (
        <MapView homes={list} regions={open ? draft.regions : filters.regions} windowOpen={open} />
      ) : (
        <main className={cn("cg-pages", switched && "page-in")}>
          {empty ? (
            <div className="empty">
              {facets.length ? (
                <>
                  <p className="title">No {where} match these filters</p>
                  <button className="bk content on" onClick={clearFilters}>Clear filters</button>
                </>
              ) : (
                <p className="title">No homes yet</p>
              )}
            </div>
          ) : (
            list.map((p, i) => <Card key={p.id} p={p} first={i === 0} />)
          )}
        </main>
      )}
      {!(view === "map" && !empty) && <Footer />}

      {facets.length > 0 && (
        <div className="filterbar">
          {facets.map((f) => (
            <button key={f.name} className="chip" title={`Remove ${f.name.toLowerCase()}`} onClick={() => setFilters(f.off(filters))}>
              <span className="k">{f.name}</span><span className="v">{f.value}</span><Icon name="close" size="0.75rem" className="x" />
            </button>
          ))}
          <span className="stat">{list.length} {list.length === 1 ? "home" : "homes"}</span>
          {facets.length > 0 && <button className="clear bk" onClick={clearFilters}>Clear</button>}
        </div>
      )}

      {mounted && (
        <FilterWindow
          closing={!open}
          filters={draft}
          avail={avail}
          count={draftCount}
          invalid={hasInvalidRange(draft)}
          onChange={setDraft}
          onClear={() => setDraft(emptyFilters())}
          onApply={() => { setFilters(draft); setOpen(false); }}
        />
      )}

      <div className="dock">
        <div className="seg" role="group" aria-label="View">
          <button className={cn(view === "list" && "active")} onClick={() => { setSwitched(true); setView("list"); }}>List</button>
          <button className={cn(view === "map" && "active")} onPointerEnter={warm} onFocus={warm} onTouchStart={warm} onClick={() => { setSwitched(true); setView("map"); }}>Map</button>
        </div>
        <button className={cn("filter-toggle", facets.length > 0 && "active", open && "open")} onClick={() => { if (!open) setDraft(filters); setOpen((o) => !o); }}>
          Filter{facets.length ? ` (${facets.length})` : ""}
        </button>
      </div>
    </div>
  );
}
