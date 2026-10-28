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
    link("Email", `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`),
    link("WhatsApp", `https://wa.me/?text=${body}`),
    link("Telegram", `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`),
  );

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
  field.focus({ preventScroll: true });
}
