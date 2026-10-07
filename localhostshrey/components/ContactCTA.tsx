"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import XCard from "./XCard";

export default function ContactCTA() {
  const [open, setOpen] = useState(false);
  const thread = useRef<HTMLDivElement>(null);
  const cardWrap = useRef<HTMLDivElement>(null);

  /* Esc, or a click anywhere outside the thread, closes the card */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!thread.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  /* centre the card above the thread; nudge sideways only if it would leave the screen */
  useEffect(() => {
    const el = cardWrap.current;
    if (!el) return;
    const place = () => {
      const r = el.getBoundingClientRect();
      const w = el.offsetWidth;
      const left = r.left + r.width / 2 - w / 2;
      const dx = Math.max(12 - left, Math.min(0, window.innerWidth - 12 - (left + w)));
      el.style.setProperty("--cdx", `${Math.round(dx)}px`);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open]);

  return (
    <div className="thread" ref={thread} data-state={open ? "open" : "closed"}>
      <div className="thread__msgs">
        <div className="xcard-wrap" ref={cardWrap} role="dialog" aria-label="Contact card" aria-hidden={!open}>
          <XCard interactive={open} />
        </div>
        <div className="msg msg--in">
          <Image className="msg__avatar" src="/assets/pfp-new.jpg" alt="" width={56} height={56} />
          <p className="bubble">got something in mind?</p>
        </div>
        <div className="msg msg--out">
          <button
            type="button"
            className="bubble bubble--out"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            work with me
          </button>
        </div>
      </div>
    </div>
  );
}
