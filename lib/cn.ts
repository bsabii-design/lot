export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/** Set when a home is opened from the feed, so the feed can restore its filters and scroll on the way back. */
export const RETURN_KEY = "lot_return";
export const STATE_KEY = "lot_state";
