"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Card from "./Card";
import Icon from "./Icon";
import FilterWindow from "./FilterWindow";
import { useFavs } from "@/lib/favs";
import { activeFacets, available, emptyFilters, hasInvalidRange, normalizeFilters, visible, withoutInvalid } from "@/lib/filters";
import { RETURN_KEY, STATE_KEY, cn } from "@/lib/cn";
import type { Filters, Property, Tab, View } from "@/lib/types";

/* the map is client-only (WebGL) and loads on demand */
const MapView = dynamic(() => import("./MapView"), { ssr: false });

const TAB_URL: Record<Tab, string> = { all: "", favourites: "?tab=saved", archive: "?tab=archive" };
const TABS: [Tab, string][] = [["all", "All posts"], ["favourites", "Saved"], ["archive", "Archive"]];

interface Saved { tab: Tab; view: View; y: number; filters: Filters }

/** The feed page: tabs, list or map, filters. Everything the visitor picks lives here. */
export default function Browse({ homes }: { homes: Property[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [view, setView] = useState<View>("list");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draft, setDraft] = useState<Filters>(emptyFilters);
  const [open, setOpen] = useState(false);
  const favs = useFavs();

  const avail = useMemo(() => available(homes), [homes]);
  const list = useMemo(() => visible(homes, tab, favs, filters), [homes, tab, favs, filters]);
  const facets = useMemo(() => activeFacets(filters), [filters]);
  const draftCount = useMemo(() => visible(homes, tab, favs, withoutInvalid(draft)).length, [homes, tab, favs, draft]);

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
          setTab(s.tab || "all");
          setView(s.view || "list");
          setFilters(normalizeFilters(s.filters));
          y = s.y || 0;
        }
      } catch {}
    } else {
      const t = { saved: "favourites", archive: "archive" }[q.get("tab") ?? ""] as Tab | undefined;
      if (t) setTab(t);
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

  const pickTab = (t: Tab) => {
    setTab(t);
    try { history.replaceState(null, "", location.pathname + TAB_URL[t]); } catch {}
  };
  const clearFilters = () => setFilters(emptyFilters());
  /* a tag clicked inside an opened home asks the feed (which stays mounted behind the panel) to filter */
  useEffect(() => {
    const onTag = (e: Event) => {
      const { kind, value } = (e as CustomEvent<{ kind: "type" | "condition"; value: string }>).detail;
      setFilters((f) => ({ ...f, tagTypes: kind === "type" ? [value] : f.tagTypes, tagConditions: kind === "condition" ? [value] : f.tagConditions }));
    };
    window.addEventListener("lot:tag", onTag);
    return () => window.removeEventListener("lot:tag", onTag);
  }, []);

  const empty = list.length === 0;
  const where = tab === "favourites" ? "saved homes" : tab === "archive" ? "archived homes" : "homes";

  return (
    <div className="browse" data-view={view}>
      <nav className="nav">
        {TABS.map(([key, label], i) => (
          <span key={key}>
            {i > 0 && <>&nbsp; &nbsp;</>}
            <button className={cn(tab === key && "active")} onClick={() => pickTab(key)}>
              {label}{key === "favourites" && favs.length > 0 && <>{" "}<i>({favs.length})</i></>}
            </button>
          </span>
        ))}
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
              ) : tab === "favourites" ? (
                <>
                  <p className="title">No saved homes yet</p>
                  <p className="sub">Tap Save on a home and it will wait for you here.</p>
                  <button className="bk content on" onClick={() => pickTab("all")}>Browse all homes</button>
                </>
              ) : tab === "archive" ? (
                <>
                  <p className="title">The archive is empty</p>
                  <p className="sub">Homes that are sold or no longer available will move here.</p>
                  <button className="bk content on" onClick={() => pickTab("all")}>Browse all homes</button>
                </>
              ) : (
                <p className="title">No homes yet</p>
              )}
            </div>
          ) : (
            list.map((p, i) => <Card key={p.id} p={p} number={String(homes.indexOf(p) + 1).padStart(2, "0")} first={i === 0} />)
          )}
        </main>
      )}

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

      {open && (
        <FilterWindow
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
