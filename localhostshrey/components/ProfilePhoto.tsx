"use client";

import Image from "next/image";
import { usePeek } from "./usePeek";

/**
 * The profile photo: set into the same raised bezel as the Off screen cards,
 * with the shared hover preview beside it.
 */
export default function ProfilePhoto() {
  const { wrap, place } = usePeek();

  return (
    <span
      className="who__photowrap ii-wrap"
      ref={wrap}
      style={{ "--pos": "50% 14%" } as React.CSSProperties}
      onPointerEnter={place}
      onFocus={place}
    >
      <Image
        className="who__photo"
        src="/assets/pfp-new.jpg"
        alt="Shrey"
        width={80}
        height={80}
        priority
        tabIndex={0}
      />
      <span className="card__inset" aria-hidden="true" />
      <span className="ii-pop ii-pop--beside" aria-hidden="true">
        <Image src="/assets/preview-pin2.jpg" alt="" width={492} height={604} sizes="150px" quality={92} />
      </span>
    </span>
  );
}
