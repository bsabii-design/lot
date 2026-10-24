"use client";

import { useSyncExternalStore } from "react";

const KEY = "lot_favs";
const EMPTY: string[] = [];
let cache: { raw: string | null; list: string[] } = { raw: null, list: EMPTY };
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== cache.raw) cache = { raw, list: raw ? (JSON.parse(raw) as string[]) : EMPTY };
  } catch {
    return EMPTY;
  }
  return cache.list;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** The saved homes (ids), kept in localStorage and shared by every component. */
export function useFavs() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** For code outside React (the map's popup): is it saved, and tell me when the saved homes change. */
export const isFav = (id: string) => read().includes(id);
export const onFavs = subscribe;

export function toggleFav(id: string) {
  const favs = [...read()];
  const i = favs.indexOf(id);
  if (i === -1) favs.push(id);
  else favs.splice(i, 1);
  try {
    localStorage.setItem(KEY, JSON.stringify(favs));
  } catch {}
  listeners.forEach((l) => l());
}
