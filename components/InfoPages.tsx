import InfoPanel from "./InfoPanel";

export function About({ modal }: { modal: boolean }) {
  return (
    <InfoPanel title="About" modal={modal}>
      <p>LOT is a small selection of homes across France, all priced at €150,000 or less. We pick them by eye: houses with character that a modest budget can still reach.</p>
      <p>Every home links to its original listing, and that is where the seller or the agent can be reached. Photos and descriptions come from those listings. What we add ourselves, such as the distance to the sea, is calculated; the short descriptions are drafted from the listing. If we cannot be sure of a detail, we leave it out.</p>
      <p>The selection changes as homes are added, sold or taken off the market. Sold homes move to the Archive.</p>
    </InfoPanel>
  );
}

export function Privacy({ modal }: { modal: boolean }) {
  return (
    <InfoPanel title="Privacy" modal={modal}>
      <p>LOT has no accounts and no analytics, and it sets no cookies.</p>
      <p>The homes you save with (Save) are kept in your own browser (local storage) and nowhere else. The filters you chose are kept in the browser for the length of your visit so that “(Close)” takes you back to where you were. Clearing the site data in your browser removes both.</p>
      <p>The map is drawn with tiles from OpenFreeMap, built on OpenStreetMap data. Like any website you open, their servers see your IP address when the map loads. “View listing” opens the original listing on another website, which has its own privacy policy.</p>
    </InfoPanel>
  );
}
