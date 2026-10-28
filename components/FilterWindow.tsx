"use client";

import { useState } from "react";
import { digits, moreCount, rangeInvalid, toggle, type Availability } from "@/lib/filters";
import {
  AREA_PRESETS, BEDROOM_PRESETS, CONDITIONS, FEATURES, LANDSCAPES, OUTDOOR, PRICE_PRESETS, REGIONS, SETTLEMENTS, TYPES,
  type Option,
} from "@/lib/taxonomy";
import { regionLabel } from "@/lib/regions";
import { cn } from "@/lib/cn";
import Icon from "./Icon";
import { Cells } from "./Price";
import type { Filters, NumRange } from "@/lib/types";

interface Props {
  filters: Filters;
  /** which choices have homes behind them (the rest are dimmed) */
  avail: Availability;
  count: number;
  /** a typed from–to the wrong way round */
  invalid: boolean;
  onChange: (next: Filters) => void;
  onClear: () => void;
  onApply: () => void;
}

function Chip({ label, on, disabled, onClick }: { label: string; on: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      className={cn("chipopt", on && "on")}
      disabled={disabled}
      aria-pressed={on}
      title={disabled ? "No homes with this data yet" : undefined}
      onClick={onClick}
    >
      <span className="lab" data-t={label}>{label}</span>
    </button>
  );
}

/** Several can be picked (any of them matches). `has` limits the choices that have homes; undefined = all are live. */
function SetRow({ label, sub, any, entries, selected, has, onToggle, onAny }: {
  label: string;
  sub?: boolean;
  /** the group's "any" ("Any location"): chosen while nothing is picked; picking it again clears the picks */
  any?: string;
  entries: Option[];
  selected: string[];
  has?: Set<string>;
  onToggle: (key: string) => void;
  onAny?: () => void;
}) {
  return (
    <div className="frow">
      <span className={cn("flabel", sub && "sub")}>{label}</span>
      <div className="chips">
        {any && <Chip label={any} on={selected.length === 0} onClick={() => onAny?.()} />}
        {entries.map(([key, text]) => (
          <Chip key={key} label={text} on={selected.includes(key)} disabled={has ? !has.has(key) && !selected.includes(key) : false} onClick={() => onToggle(key)} />
        ))}
      </div>
    </div>
  );
}

/** One at a time: picking the chosen one again goes back to "any" ("" is that choice where the list has it). */
function OneRow({ entries, value, onPick }: { entries: Option[]; value: string; onPick: (key: string) => void }) {
  return (
    <div className="chips">
      {entries.map(([key, text]) => (
        <Chip key={key || "any"} label={text} on={value === key} onClick={() => onPick(value === key ? "" : key)} />
      ))}
    </div>
  );
}

const CUSTOM: Option = ["custom", "Custom"];

/** The choices of a number group: the group's "any", its presets, then "Custom" (the typed min–max shows only when it is chosen). */
function NumberGroup({ label, unit, entries, range, custom, onPreset, onCustom, onChange }: {
  label: string;
  unit: string;
  entries: Option[];
  range: NumRange;
  custom: boolean;
  onPreset: (preset: string) => void;
  onCustom: (on: boolean) => void;
  onChange: (next: NumRange) => void;
}) {
  const value = custom ? "custom" : range.preset;
  return (
    <>
      <div className="chips">
        {[...entries, CUSTOM].map(([key, text]) => (
          <Chip
            key={key || "any"}
            label={text}
            on={value === key}
            onClick={() => (key === "custom" ? onCustom(!custom) : onPreset(value === key ? "" : key))}
          />
        ))}
      </div>
      {custom && <RangeInputs label={label} unit={unit} range={range} onChange={onChange} />}
    </>
  );
}

/** Typed min–max (digits only). Typing clears the preset. */
function RangeInputs({ label, unit, range, onChange }: { label: string; unit: string; range: NumRange; onChange: (next: NumRange) => void }) {
  const bad = rangeInvalid(range);
  const field = (which: "min" | "max", name: string) => (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={`${name} ${unit}`}
      aria-label={`${label} ${name.toLowerCase()}`}
      aria-invalid={bad || undefined}
      value={range[which]}
      onChange={(e) => onChange({ ...range, preset: "", [which]: digits(e.target.value) })}
    />
  );
  return (
    <>
      <div className="range">
        {field("min", "Min")}
        <span>&ndash;</span>
        {field("max", "Max")}
      </div>
      {bad && <p className="rangenote" role="alert">Min is above max</p>}
    </>
  );
}

/** The filter window that opens above the dock. Picks are a draft: nothing changes behind the window until
    "Show N homes". Inside a group any of the picks matches; between groups all of them must. */
export default function FilterWindow({ filters, avail, count, invalid, onChange, onClear, onApply }: Props) {
  const [more, setMore] = useState(false);
  /** "Custom" is chosen: the typed from–to shows (it starts open when the filters already hold typed numbers) */
  const typed = (r: NumRange) => r.min !== "" || r.max !== "";
  const [custom, setCustom] = useState({ price: typed(filters.price), area: typed(filters.area), plot: typed(filters.plot) });
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const pick = (key: "price" | "area" | "plot") => (value: string) => {
    setCustom((c) => ({ ...c, [key]: false }));
    set({ [key]: { preset: value, min: "", max: "" } });
  };
  const openCustom = (key: "price" | "area" | "plot") => (on: boolean) => {
    setCustom((c) => ({ ...c, [key]: on }));
    set({ [key]: { preset: "", min: on ? filters[key].min : "", max: on ? filters[key].max : "" } });
  };
  const clearAll = () => { setCustom({ price: false, area: false, plot: false }); onClear(); };
  const setKey = (key: "regions" | "conditions" | "settlements" | "landscapes" | "types" | "features") => (value: string) =>
    set({ [key]: toggle(filters[key], value) });
  const regions: Option[] = REGIONS.map((v): Option => [v, regionLabel(v)]).sort((a, b) => a[1].localeCompare(b[1]));
  const extra = moreCount(filters);

  return (
    <aside className="filterwin" id="filter-window">
      <div className="fscroll">
        <div className="frow">
          <span className="flabel">Price</span>
          <NumberGroup label="Price" unit="€" entries={[["", "Any price"], ...PRICE_PRESETS]} range={filters.price} custom={custom.price}
            onPreset={pick("price")} onCustom={openCustom("price")} onChange={(price) => set({ price })} />
        </div>

        <SetRow label="Location" any="Any location" entries={regions} selected={filters.regions} onToggle={setKey("regions")} onAny={() => set({ regions: [] })} />
        <SetRow label="Condition" any="Any condition" entries={CONDITIONS} selected={filters.conditions} has={avail.conditions} onToggle={setKey("conditions")} onAny={() => set({ conditions: [] })} />

        <div className="frow">
          <span className="flabel">Living area</span>
          <NumberGroup label="Living area" unit="m²" entries={AREA_PRESETS} range={filters.area} custom={custom.area}
            onPreset={pick("area")} onCustom={openCustom("area")} onChange={(area) => set({ area })} />
        </div>

        <div className="frow">
          <span className="flabel">Bedrooms</span>
          <OneRow entries={BEDROOM_PRESETS} value={filters.bedrooms} onPick={(bedrooms) => set({ bedrooms })} />
        </div>

        <button className="moretoggle" aria-expanded={more} aria-controls="more-filters" onClick={() => setMore((v) => !v)}>
          <span>More filters{extra > 0 && <>{" "}<i>({extra})</i></>}</span>
          <Icon name={more ? "minus" : "plus"} size="0.75rem" />
        </button>

        {more && (
          <div className="more" id="more-filters">
            <section className="msec">
              <h3 className="mhead">Plot &amp; outdoor</h3>
              <div className="frow">
                <span className="flabel sub">Plot size</span>
                <NumberGroup label="Plot size" unit="m²" entries={[["", "Any plot"]]} range={filters.plot} custom={custom.plot}
                  onPreset={pick("plot")} onCustom={openCustom("plot")} onChange={(plot) => set({ plot })} />
              </div>
              <SetRow label="Outdoor" sub entries={OUTDOOR} selected={filters.features} has={avail.features} onToggle={setKey("features")} />
            </section>

            <section className="msec">
              <h3 className="mhead">Surroundings</h3>
              <SetRow label="Settlement" sub entries={SETTLEMENTS} selected={filters.settlements} has={avail.settlements} onToggle={setKey("settlements")} />
              <SetRow label="Landscape" sub entries={LANDSCAPES} selected={filters.landscapes} has={avail.landscapes} onToggle={setKey("landscapes")} />
            </section>

            <section className="msec">
              <h3 className="mhead">Property type</h3>
              <SetRow label="Type" sub entries={TYPES} selected={filters.types} has={avail.types} onToggle={setKey("types")} />
            </section>

            <section className="msec">
              <h3 className="mhead">Features</h3>
              <SetRow label="All of" sub entries={FEATURES} selected={filters.features} has={avail.features} onToggle={setKey("features")} />
            </section>
          </div>
        )}
      </div>
      <div className="ffoot">
        <button className="bk sm" onClick={clearAll}>Clear all</button>
        <button className="apply" disabled={count === 0 || invalid} onClick={onApply}>
          <span className="pr"><Cells text={invalid ? "Check the range" : count === 0 ? "No homes match" : `Show ${count} ${count === 1 ? "home" : "homes"}`} /></span>
        </button>
      </div>
    </aside>
  );
}
