"use client";

import { useState } from "react";
import { BEDROOMS, PRICE_PRESETS, SIZE_PRESETS, toggle, type SetKey } from "@/lib/filters";
import { cn } from "@/lib/cn";
import type { Filters, Range } from "@/lib/types";

interface Options { types: string[]; conditions: string[]; settings: string[]; regions: string[] }

interface Props {
  filters: Filters;
  options: Options;
  /** how many homes the current picks would show */
  count: number;
  onChange: (next: Filters) => void;
  onClear: () => void;
  onApply: () => void;
}

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button className={cn("chipopt", on && "on")} onClick={onClick}>{label}</button>
  );
}

function SetRow({ label, entries, selected, onToggle }: {
  label: string;
  entries: [string, string][];
  selected: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div className="frow">
      <span className="flabel">{label}</span>
      <div className="chips">
        {entries.map(([key, text]) => (
          <Chip key={key} label={text} on={selected.includes(key)} onClick={() => onToggle(key)} />
        ))}
      </div>
    </div>
  );
}

/* quick ranges on one tap (several can be picked); "Custom" opens exact from–to fields */
function RangeRow({ label, presets, range, unit, step, onPreset, onType }: {
  label: string;
  presets: [string, string][];
  range: Range;
  unit: string;
  step: number;
  onPreset: (key: string) => void;
  onType: (field: "min" | "max", value: string) => void;
}) {
  const [custom, setCustom] = useState(false);
  const show = custom || range.min !== "" || range.max !== "";
  return (
    <div className="frow">
      <span className="flabel">{label}</span>
      <div className="chips">
        {presets.map(([key, text]) => (
          <Chip key={key} label={text} on={range.presets.includes(key)} onClick={() => onPreset(key)} />
        ))}
      </div>
      {show && (
        <div className="range">
          <input type="number" inputMode="numeric" min={0} step={step} placeholder={`from, ${unit}`} aria-label={`${label} from`}
            value={range.min} autoFocus={custom} onChange={(e) => onType("min", e.target.value)} />
          <span>&ndash;</span>
          <input type="number" inputMode="numeric" min={0} step={step} placeholder={`to, ${unit}`} aria-label={`${label} to`}
            value={range.max} onChange={(e) => onType("max", e.target.value)} />
        </div>
      )}
      <button className="customlink" onClick={() => setCustom((v) => !v)}>Custom</button>
    </div>
  );
}

/** The filter window that opens above the dock. Picks are a draft: nothing changes behind the window until
    "Show N homes". Every pick is a multi-select (any of the values matches). */
export default function FilterWindow({ filters, options, count, onChange, onClear, onApply }: Props) {
  const setRow = (key: SetKey) => (value: string) => onChange({ ...filters, [key]: toggle(filters[key], value) });
  const pairs = (list: string[]): [string, string][] => list.map((v) => [v, v]);
  const preset = (rk: "price" | "size") => (key: string) =>
    onChange({ ...filters, [rk]: { presets: toggle(filters[rk].presets, key), min: "", max: "" } });
  const type = (rk: "price" | "size") => (field: "min" | "max", value: string) =>
    onChange({ ...filters, [rk]: { ...filters[rk], [field]: value.trim(), presets: [] } });

  return (
    <aside className="filterwin" id="filter-window">
      <div className="fscroll">
      <SetRow label="Type" entries={pairs(options.types)} selected={filters.types} onToggle={setRow("types")} />
      <SetRow label="Condition" entries={pairs(options.conditions)} selected={filters.conditions} onToggle={setRow("conditions")} />
      <SetRow label="Bedrooms" entries={BEDROOMS} selected={filters.bedrooms} onToggle={setRow("bedrooms")} />
      <RangeRow label="Price" presets={PRICE_PRESETS.map(([k, l]) => [k, l])} range={filters.price} unit="€" step={5000}
        onPreset={preset("price")} onType={type("price")} />
      <RangeRow label="Size" presets={SIZE_PRESETS.map(([k, l]) => [k, l])} range={filters.size} unit="m²" step={10}
        onPreset={preset("size")} onType={type("size")} />
      <SetRow label="Region" entries={pairs(options.regions)} selected={filters.regions} onToggle={setRow("regions")} />
      <SetRow label="Setting" entries={pairs(options.settings)} selected={filters.settings} onToggle={setRow("settings")} />
      </div>
      <div className="ffoot">
        <button className="btn sm" onClick={onClear}>Clear all</button>
        <button className="btn sm visit" disabled={count === 0} onClick={onApply}>
          {count === 0 ? "No homes match" : `Show ${count} ${count === 1 ? "home" : "homes"}`}
        </button>
      </div>
    </aside>
  );
}
