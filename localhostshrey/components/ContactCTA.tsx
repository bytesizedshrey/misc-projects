"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import XCard from "./XCard";

/**
 * A compact toolbar: avatar · "open to work" (click to cycle) · "work with me". Hovering (or focusing) "work with me"
 * pops the black card out beside it; leaving both the text and the card hides it.
 */
const LABELS = ["open to work", "got something in mind?"];

export default function ContactCTA() {
  const wrap = useRef<HTMLSpanElement>(null);
  const [dismissed, setDismissed] = useState(false);
  /* the label is a button that cycles between two lines, resizing to fit like the Toolbar on shwn.design */
  const [i, setI] = useState(0);
  const measure = useRef<(HTMLSpanElement | null)[]>([]);
  const [widths, setWidths] = useState<number[]>([]);
  useLayoutEffect(() => {
    const m = () => setWidths(measure.current.map((el) => (el ? Math.ceil(el.getBoundingClientRect().width) : 0)));
    m();
    document.fonts?.ready.then(m);
    window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, []);

  /* beside the button when there is room; otherwise above it, nudged to stay on screen */
  const place = useCallback(() => {
    const el = wrap.current;
    const card = el?.querySelector<HTMLElement>(".xcard-wrap");
    const btn = el?.querySelector<HTMLElement>(".bubble--out");
    if (!el || !card || !btn) return;
    if (!el.dataset.ready) el.dataset.ready = "1"; /* display:none until first placed, so it can't widen the page */
    const b = btn.getBoundingClientRect();
    const w = card.offsetWidth;
    if (innerWidth - b.right - 16 - w - 12 >= 0) {
      el.dataset.side = "right";
      return;
    }
    el.dataset.side = "above";
    const left = b.left + b.width / 2 - w / 2;
    const dx = Math.max(12 - left, Math.min(0, innerWidth - 12 - (left + w)));
    el.style.setProperty("--cdx", `${Math.round(dx)}px`);
  }, []);

  useEffect(() => {
    place();
    document.fonts?.ready.then(place);
    window.addEventListener("resize", place);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDismissed(true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("keydown", onKey);
    };
  }, [place]);

  return (
    <div className="tb">
      <Image className="tb__avatar" src="/assets/pfp-new.jpg" alt="" width={56} height={56} />
      <button
        type="button"
        className="tb__label"
        style={{ width: widths[i] ? widths[i] + 15 : "9.6em" }}
        onClick={() => setI((v) => (v + 1) % LABELS.length)}
        aria-live="polite"
      >
        <span className="tb__dot" data-on={i === 0} aria-hidden="true" />
        {LABELS.map((t, k) => (
          <span key={t} className="tb__text" data-on={i === k} aria-hidden={i !== k}>
            {t}
          </span>
        ))}
      </button>
      <span className="tb__measure" aria-hidden="true">
        {LABELS.map((t, k) => (
          <span key={t} ref={(el) => void (measure.current[k] = el)}>
            {t}
          </span>
        ))}
      </span>
      <span
        className="cta-hover"
        ref={wrap}
        data-dismissed={dismissed ? "1" : undefined}
        onPointerEnter={place}
        onFocus={place}
        onPointerLeave={() => setDismissed(false)}
        onBlur={() => setDismissed(false)}
      >
        <button type="button" className="bubble--out tb__go" aria-haspopup="true">
          work with me
        </button>
        <span className="xcard-wrap" role="group" aria-label="Contact card">
          <XCard />
        </span>
      </span>
    </div>
  );
}
