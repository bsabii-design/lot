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
function SetRow({ label, sub, entries, selected, has, onToggle }: {
  label: string;
  sub?: boolean;
  entries: Option[];
  selected: string[];
  has?: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="frow">
      <span className={cn("flabel", sub && "sub")}>{label}</span>
      <div className="chips">
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
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const pick = (key: "price" | "area") => (value: string) => set({ [key]: { preset: value, min: "", max: "" } });
  const setKey = (key: "regions" | "conditions" | "settlements" | "landscapes" | "types" | "features") => (value: string) =>
    set({ [key]: toggle(filters[key], value) });
  const regions: Option[] = REGIONS.map((v): Option => [v, regionLabel(v)]).sort((a, b) => a[1].localeCompare(b[1]));
  const areaAny = filters.area.preset === "" && filters.area.min === "" && filters.area.max === "";
  const extra = moreCount(filters);

  return (
    <aside className="filterwin" id="filter-window">
      <div className="fscroll">
        <div className="frow">
          <span className="flabel">Price</span>
          <OneRow entries={PRICE_PRESETS} value={filters.price.preset} onPick={pick("price")} />
          <RangeInputs label="Price" unit="€" range={filters.price} onChange={(price) => set({ price })} />
        </div>

        <SetRow label="Location" entries={regions} selected={filters.regions} onToggle={setKey("regions")} />
        <SetRow label="Condition" entries={CONDITIONS} selected={filters.conditions} has={avail.conditions} onToggle={setKey("conditions")} />

        <div className="frow">
          <span className="flabel">Living area</span>
          <OneRow entries={AREA_PRESETS} value={areaAny ? "" : filters.area.preset || "custom"} onPick={pick("area")} />
          <RangeInputs label="Living area" unit="m²" range={filters.area} onChange={(area) => set({ area })} />
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
                <RangeInputs label="Plot size" unit="m²" range={filters.plot} onChange={(plot) => set({ plot })} />
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
        <button className="bk sm" onClick={onClear}>Clear all</button>
        <button className="apply" disabled={count === 0 || invalid} onClick={onApply}>
          <span className="pr"><Cells text={invalid ? "Check the range" : count === 0 ? "No homes match" : `Show ${count} ${count === 1 ? "home" : "homes"}`} /></span>
        </button>
      </div>
    </aside>
  );
}
