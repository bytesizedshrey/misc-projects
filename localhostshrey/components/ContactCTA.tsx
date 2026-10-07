"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import XCard from "./XCard";

/**
 * "got something in mind? / work with me". Hovering (or focusing) "work with me"
 * pops the black card out beside it; leaving both the text and the card hides it.
 */
export default function ContactCTA() {
  const wrap = useRef<HTMLSpanElement>(null);
  const [dismissed, setDismissed] = useState(false);

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
    <div className="thread">
      <div className="thread__msgs">
        <div className="msg msg--in">
          <Image className="msg__avatar" src="/assets/pfp-new.jpg" alt="" width={56} height={56} />
          <p className="bubble">got something in mind?</p>
        </div>
        <div className="msg msg--out">
          <span
            className="cta-hover"
            ref={wrap}
            data-dismissed={dismissed ? "1" : undefined}
            onPointerEnter={place}
            onFocus={place}
            onPointerLeave={() => setDismissed(false)}
            onBlur={() => setDismissed(false)}
          >
            <button type="button" className="bubble bubble--out" aria-haspopup="true">
              work with me
            </button>
            <span className="xcard-wrap" role="group" aria-label="Contact card">
              <XCard />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
