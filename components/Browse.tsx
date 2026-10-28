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
import type { Filters, Property, Tab, View } from "@/lib/types";

/* the map is client-only (WebGL) and loads on demand */
const MapView = dynamic(() => import("./MapView"), { ssr: false });

/* (the "Saved" tab is off for now: with no accounts a saved home lives in one browser only; the "Archive" tab is gone: sold homes stay in the data, not on the page) */

interface Saved { tab: Tab; view: View; y: number; filters: Filters }

/** The feed page: tabs, list or map, filters. Everything the visitor picks lives here. */
export default function Browse({ homes }: { homes: Property[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [view, setView] = useState<View>("list");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [open, setOpen] = useState(false);
  /* the window stays in the page while it fades out (a quarter of a second after it is closed) */
  const [mounted, setMounted] = useState(false);

  const avail = useMemo(() => available(homes), [homes]);
  const list = useMemo(() => visible(homes, tab, [], filters), [homes, tab, filters]);
  const facets = useMemo(() => activeFacets(filters), [filters]);
  const draftCount = useMemo(() => visible(homes, tab, [], withoutInvalid(draft)).length, [homes, tab, draft]);

  /* keep the browsing state when the visitor opens a home and comes back */
  const latest = useRef<Saved>({ tab, view, y: 0, filters });
  useEffect(() => { latest.current = { ...latest.current, tab, view, filters }; });

  /* Restoring from the URL and sessionStorage must wait until the browser (server and first client render
     have to match), so this is one of the places where setting state in an effect is the right tool. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    const q = new URLSearchParams(location.search);
    let y = 0;
    const explicit = q.get("tab") || q.get("t") || q.get("c");
    let returning = false;
    try { returning = sessionStorage.getItem(RETURN_KEY) === "1"; sessionStorage.removeItem(RETURN_KEY); } catch {}
    if (!explicit && returning) {
      try {
        const s = JSON.parse(sessionStorage.getItem(STATE_KEY) || "null") as Saved | null;
        if (s) {
          setTab("all"); // an older visit may have left the Saved or Archive tab: both are gone
          setView(s.view || "list");
          setFilters(normalizeFilters(s.filters));
          y = s.y || 0;
        }
      } catch {}
    } else {
      setFilters((f) => ({
        ...f,
        tagTypes: q.get("t") ? [q.get("t")!] : f.tagTypes,
        tagConditions: q.get("c") ? [q.get("c")!] : f.tagConditions,
      }));
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
        <main className="cg-pages">
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
          <button className={cn(view === "list" && "active")} onClick={() => setView("list")}>List</button>
          <button className={cn(view === "map" && "active")} onClick={() => setView("map")}>Map</button>
        </div>
        <button className={cn("filter-toggle", facets.length > 0 && "active", open && "open")} onClick={() => { if (!open) setDraft(filters); setOpen((o) => !o); }}>
          Filter{facets.length ? ` (${facets.length})` : ""}
        </button>
      </div>
    </div>
  );
}
