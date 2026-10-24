import { CloseLink } from "./PanelLinks";
import OverlayShell from "./OverlayShell";
import type { ReactNode } from "react";

const span = (n: number) => ({ "--span": n }) as React.CSSProperties;

/** A text page (About, Privacy) built like the Cargo "Information" overlay: the white covers the whole page; a header row (the logo on the
    left, "(Close)" on the right, 8 + 4 columns), one empty line, then the text in 3 columns and the contact block in the next 3
    (6 columns stay empty). On a phone the columns stack. The second paragraph on is indented. */
export default function InfoPanel({ title, modal, children, aside }: { title: string; modal: boolean; children: ReactNode; aside?: ReactNode }) {
  return (
    <OverlayShell modal={modal} label={title} wide>
      <div className="cg-set">
        <div className="cg-u" style={span(8)}><h1 className="sr-only">{title}</h1></div>
        <div className="cg-u" style={span(4)}>
          <div className="ui" style={{ textAlign: "right" }}><CloseLink>Close</CloseLink></div>
        </div>
      </div>
      <div className="cg-set cg-info-page" data-stack="true">
        <div className="cg-u cg-prose" style={span(3)}>{children}</div>
        <div className="cg-u" style={span(3)}>{aside}</div>
        <div className="cg-u" style={span(6)} />
      </div>
    </OverlayShell>
  );
}
