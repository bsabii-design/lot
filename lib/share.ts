"use client";

/** Share a home. Where the device has its own share sheet (phones, Safari, Windows) it opens: copy, AirDrop, mail, messengers, social networks.
    Where it has none (most desktop browsers) a small window of our own opens with the link and the common ways to send it. */
export async function shareHome(title: string, path: string) {
  const url = new URL(path, location.origin).href;
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, url });
      return;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // the visitor closed the sheet
      /* the sheet could not open: fall through to our own window */
    }
  }
  openShareWindow(title, url);
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch {}
    ta.remove();
    return ok;
  }
}

function openShareWindow(title: string, url: string) {
  const back = document.activeElement as HTMLElement | null;
  const ov = document.createElement("div");
  ov.className = "share-ov";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-modal", "true");
  ov.setAttribute("aria-label", "Share");
  const box = document.createElement("div");
  box.className = "share-box cg";
  box.tabIndex = -1;

  const link = document.createElement("div");
  link.className = "share-url";
  link.textContent = url;

  const row = document.createElement("div");
  row.className = "share-row";
  const act = (label: string, onClick?: () => void, href?: string) => {
    const wrap = document.createElement("span");
    const el = document.createElement(href ? "a" : "button");
    el.className = "lk ul";
    el.textContent = label;
    if (href) { (el as HTMLAnchorElement).href = href; (el as HTMLAnchorElement).target = "_blank"; (el as HTMLAnchorElement).rel = "noopener"; }
    if (onClick) el.addEventListener("click", onClick);
    wrap.append("(", el, ")");
    row.appendChild(wrap);
    return el;
  };

  /* the confirmation is a line of its own under the buttons (it keeps its place, so nothing jumps) */
  const note = document.createElement("p");
  note.className = "share-note";
  note.setAttribute("aria-live", "polite");
  let timer: ReturnType<typeof setTimeout> | undefined;
  const say = (t: string) => { note.textContent = t; clearTimeout(timer); timer = setTimeout(() => { note.textContent = ""; }, 2200); };

  const text = encodeURIComponent(`${title} ${url}`);
  act("Copy link", async () => say((await copyText(url)) ? "Link copied" : "Select the link and copy it"));
  act("Email", undefined, `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`);
  act("WhatsApp", undefined, `https://wa.me/?text=${text}`);
  act("Telegram", undefined, `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
  act("Close", () => close());

  box.append(link, row, note);
  ov.appendChild(box);

  const close = () => {
    clearTimeout(timer);
    document.removeEventListener("keydown", onKey, true);
    ov.remove();
    back?.focus?.({ preventScroll: true });
  };
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); close(); } };
  document.addEventListener("keydown", onKey, true);
  ov.addEventListener("mousedown", (e) => { e.stopPropagation(); if (e.target === ov) close(); });

  document.body.appendChild(ov);
  box.focus({ preventScroll: true });
  const range = document.createRange();
  range.selectNodeContents(link);
  const sel = getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}
