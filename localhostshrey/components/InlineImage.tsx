"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

type Props = {
  src: string;
  label: string;
  /** CSS object-position for the square crop, e.g. "50% 20%" */
  position?: string;
  width: number;
  height: number;
};

export default function InlineImage({ src, label, position = "50% 50%", width, height }: Props) {
  const wrap = useRef<HTMLSpanElement>(null);

  /* preview sits centred above the trigger; nudge sideways only if it would leave the screen */
  const place = useCallback(() => {
    const el = wrap.current;
    const pop = el?.querySelector<HTMLElement>(".ii-pop");
    const trig = el?.querySelector<HTMLElement>(".ii");
    if (!el || !pop || !trig) return;
    const t = trig.getBoundingClientRect();
    const w = pop.offsetWidth;
    const left = t.left + t.width / 2 - w / 2;
    const dx = Math.max(8 - left, Math.min(0, window.innerWidth - 8 - (left + w)));
    el.style.setProperty("--dx", `${Math.round(dx)}px`);
  }, []);

  /* clamp from the start (and on resize) so a hidden preview never widens the page */
  useEffect(() => {
    place();
    document.fonts?.ready.then(place);
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [place]);

  return (
    <span
      className="ii-wrap"
      ref={wrap}
      style={{ "--pos": position } as React.CSSProperties}
      onPointerEnter={place}
      onFocus={place}
    >
      <span className="ii" role="img" aria-label={label} tabIndex={0}>
        <Image src={src} alt="" width={width} height={height} sizes="48px" quality={92} />
      </span>
      <span className="ii-pop" aria-hidden="true">
        <Image src={src} alt="" width={width} height={height} sizes="140px" quality={92} />
      </span>
    </span>
  );
}
