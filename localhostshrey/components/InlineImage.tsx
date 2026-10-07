"use client";

import Image from "next/image";
import { usePeek } from "./usePeek";

type Props = {
  src: string;
  label: string;
  /** CSS object-position for the crop, e.g. "50% 20%" */
  position?: string;
  width: number;
  height: number;
};

export default function InlineImage({ src, label, position = "50% 50%", width, height }: Props) {
  const { wrap, place } = usePeek();

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
