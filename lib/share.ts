"use client";

/** Share a home. On a phone or tablet the device's own share sheet opens (the system puts it where it belongs: copy, AirDrop, mail, messengers, social networks).
    On a computer a small window of our own opens right next to the button that was pressed: the link, copy, mail, WhatsApp, Telegram and, where the browser has one,
    "(More…)" for its own share sheet (AirDrop and the rest) — a computer's own sheet appears wherever the system likes, not by the button. */
export async function shareHome(title: string, path: string, anchor?: Element | null) {
  const url = new URL(path, location.origin).href;
  const hasSheet = typeof navigator.share === "function";
  const computer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (hasSheet && !computer) {
    try {
      await navigator.share({ title, url });
      return;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // the visitor closed the sheet
      /* the sheet could not open: fall through to our own window */
    }
  }
  openShareWindow(title, url, anchor ?? null, hasSheet);
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

/** Opens the mail app with the link in a new message. A "mailto:" in a new tab does nothing in many browsers, and with no mail app set up it does nothing at all
    (desktop browsers do not say so): so it is opened in this tab, and if the page was not left in a moment the link is copied instead and the visitor is told. */
function email(title: string, url: string, say: (t: string) => void) {
  let left = false;
  const gone = () => { left = true; };
  const hidden = () => { if (document.hidden) left = true; };
  window.addEventListener("blur", gone, { once: true });
  document.addEventListener("visibilitychange", hidden);
  location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
  setTimeout(async () => {
    window.removeEventListener("blur", gone);
    document.removeEventListener("visibilitychange", hidden);
    if (left) return;
    if (await copyText(url)) say("No mail app found: link copied");
    else {
      say("No mail app found");
      document.querySelector<HTMLInputElement>(".share-url")?.select(); // so the link can be copied by hand
    }
  }, 1200);
}

function openShareWindow(title: string, url: string, anchor: Element | null, hasSheet: boolean) {
  const back = document.activeElement as HTMLElement | null;
  const ov = document.createElement("div");
  ov.className = anchor ? "share-ov anchored" : "share-ov";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-modal", "true");
  ov.setAttribute("aria-label", "Share");
  const box = document.createElement("div");
  box.className = "share-box cg";

  /* "(Text)": the word is the button or link, the brackets are plain text */
  const bracket = (label: string, el: HTMLElement) => {
    const wrap = document.createElement("span");
    el.className = "lk ul";
    el.textContent = label;
    wrap.append("(", el, ")");
    return wrap;
  };
  const button = (label: string, onClick: () => void) => {
    const el = document.createElement("button");
    el.addEventListener("click", onClick);
    return bracket(label, el);
  };
  const link = (label: string, href: string) => {
    const el = document.createElement("a");
    el.href = href;
    el.target = "_blank";
    el.rel = "noopener";
    return bracket(label, el);
  };

  /* the header: "Share", a quiet "Link copied" after it when it has been copied, "(Close)" at the right edge */
  const head = document.createElement("div");
  head.className = "share-head";
  const heading = document.createElement("span");
  heading.textContent = "Share";
  const note = document.createElement("span");
  note.className = "share-note";
  note.setAttribute("aria-live", "polite");
  const close = button("Close", () => done());
  close.classList.add("share-close");
  head.append(heading, note, close);

  const field = document.createElement("input");
  field.className = "share-url";
  field.readOnly = true;
  field.value = url;
  field.setAttribute("aria-label", "Link to this home");
  field.addEventListener("focus", () => field.select());

  let timer: ReturnType<typeof setTimeout> | undefined;
  const say = (t: string) => { note.textContent = t; clearTimeout(timer); timer = setTimeout(() => { note.textContent = ""; }, 2200); };

  const row = document.createElement("div");
  row.className = "share-row";
  const body = encodeURIComponent(`${title} ${url}`);
  row.append(
    button("Copy link", async () => { field.select(); say((await copyText(url)) ? "Link copied" : "Press Ctrl+C to copy"); }),
    button("Email", () => email(title, url, say)),
    link("WhatsApp", `https://wa.me/?text=${body}`),
    link("Telegram", `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`),
  );
  if (hasSheet) {
    row.append(button("More…", () => { done(); void navigator.share({ title, url }).catch(() => {}); }));
  }

  box.append(head, field, row);
  ov.appendChild(box);

  const done = () => {
    clearTimeout(timer);
    document.removeEventListener("keydown", onKey, true);
    ov.remove();
    back?.focus?.({ preventScroll: true });
  };
  const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); done(); } };
  document.addEventListener("keydown", onKey, true);
  ov.addEventListener("mousedown", (e) => { e.stopPropagation(); if (e.target === ov) done(); });

  document.body.appendChild(ov);

  /* next to the button: under it, its left edge on the button's left edge (its right edge on the button's right edge when there is no room to the right),
     above it when there is no room below; kept inside the window with one unit of margin */
  if (anchor) {
    const r = anchor.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    const m = parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.625;
    const gap = m * 0.6;
    let left = r.left;
    if (left + b.width > innerWidth - m) left = r.right - b.width;
    left = Math.max(m, Math.min(left, innerWidth - b.width - m));
    let top = r.bottom + gap;
    if (top + b.height > innerHeight - m) top = Math.max(m, r.top - b.height - gap);
    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
    /* it belongs to the button: when the page moves under it, it goes */
    const leave = () => done();
    addEventListener("resize", leave, { once: true });
    addEventListener("scroll", leave, { capture: true, once: true });
  }
  field.focus({ preventScroll: true });
}
