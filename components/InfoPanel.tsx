import { CloseLink } from "./PanelLinks";
import OverlayShell from "./OverlayShell";
import type { ReactNode } from "react";

const span = (n: number) => ({ "--span": n }) as React.CSSProperties;

/** A text page (About, Privacy) in the same panel as a home: the title and "(Close)" in the header, then the text in the right half of the panel
    (where a home has its details), the second paragraph onward indented, as in the Cargo "Information" panel. */
export default function InfoPanel({ title, modal, children }: { title: string; modal: boolean; children: ReactNode }) {
  return (
    <OverlayShell modal={modal} label={title}>
      <div className="cg-set">
        <div className="cg-u" style={span(8)}>
          <h1 className="cg-title">{title}</h1>
        </div>
        <div className="cg-u" style={span(4)}>
          <div className="ui" style={{ textAlign: "right" }}><CloseLink>Close</CloseLink></div>
        </div>
      </div>
      <div className="cg-set cg-info-page">
        <div className="cg-u cg-prose" style={span(6)}>{children}</div>
      </div>
    </OverlayShell>
  );
}
