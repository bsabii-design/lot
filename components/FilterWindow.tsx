"use client";

import { BEDROOMS, PRICE_PRESETS, SIZE_PRESETS, toggle, type SetKey } from "@/lib/filters";
import { regionLabel } from "@/lib/regions";
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
    <button className={cn("chipopt", on && "on")} onClick={onClick}><span className="lab" data-t={label}>{label}</span></button>
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

/* quick ranges on one tap (several can be picked) */
function RangeRow({ label, presets, range, onPreset }: {
  label: string;
  presets: [string, string][];
  range: Range;
  onPreset: (key: string) => void;
}) {
  return (
    <div className="frow">
      <span className="flabel">{label}</span>
      <div className="chips">
        {presets.map(([key, text]) => (
          <Chip key={key} label={text} on={range.presets.includes(key)} onClick={() => onPreset(key)} />
        ))}
      </div>
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

  return (
    <aside className="filterwin" id="filter-window">
      <div className="fscroll">
      <SetRow label="Type" entries={pairs(options.types)} selected={filters.types} onToggle={setRow("types")} />
      <SetRow label="Condition" entries={pairs(options.conditions)} selected={filters.conditions} onToggle={setRow("conditions")} />
      <SetRow label="Bedrooms" entries={BEDROOMS} selected={filters.bedrooms} onToggle={setRow("bedrooms")} />
      <RangeRow label="Price" presets={PRICE_PRESETS.map(([k, l]) => [k, l])} range={filters.price}
        onPreset={preset("price")} />
      <RangeRow label="Size" presets={SIZE_PRESETS.map(([k, l]) => [k, l])} range={filters.size}
        onPreset={preset("size")} />
      <SetRow label="Region" entries={options.regions.map((v): [string, string] => [v, regionLabel(v)]).sort((a, b) => a[1].localeCompare(b[1]))} selected={filters.regions} onToggle={setRow("regions")} />
      <SetRow label="Setting" entries={pairs(options.settings)} selected={filters.settings} onToggle={setRow("settings")} />
      </div>
      <div className="ffoot">
        <button className="bk sm" onClick={onClear}>Clear all</button>
        <button className="btn sm" disabled={count === 0} onClick={onApply}>
          {count === 0 ? "No homes match" : `Show ${count} ${count === 1 ? "home" : "homes"}`}
        </button>
      </div>
    </aside>
  );
}
