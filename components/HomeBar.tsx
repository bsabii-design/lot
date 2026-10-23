import SaveButton from "./SaveButton";
import Ago from "./Ago";
import { CloseLink } from "./PanelLinks";
import type { Property } from "@/lib/types";

/** The bottom bar of an open home, the width of the whole window like the top bar: Save and Return on the left,
    how long ago it was posted on the right. */
export default function HomeBar({ p }: { p: Property }) {
  return (
    <div className="cg cg-bar">
      <span><SaveButton id={p.id} /> &nbsp;<CloseLink underline>Return to homes</CloseLink></span>
      <span className="posted-wrap"><Ago date={p.date_added} /></span>
    </div>
  );
}
