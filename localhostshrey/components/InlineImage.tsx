"use client";

import Image from "next/image";
import { useRef } from "react";

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

  /* open to the left of the trigger; flip right when the left side would leave the screen */
  const place = () => {
    const el = wrap.current;
    const pop = el?.querySelector<HTMLElement>(".ii-pop");
    if (!el || !pop) return;
    const room = el.getBoundingClientRect().left - pop.offsetWidth - 12;
    el.dataset.side = room < 8 ? "right" : "left";
  };

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
        <Image src={src} alt="" width={width} height={height} sizes="200px" quality={92} />
      </span>
    </span>
  );
}
