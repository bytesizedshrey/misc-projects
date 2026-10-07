"use client";

import Image from "next/image";
import { usePeek } from "./usePeek";

/** The profile photo, unchanged, with a small hover preview beside it (same system as the inline images). */
export default function ProfilePhoto() {
  const { wrap, place } = usePeek();

  return (
    <span className="who__photowrap ii-wrap" ref={wrap} onPointerEnter={place} onFocus={place}>
      <Image
        className="who__photo"
        src="/assets/pfp-new.jpg"
        alt="Shrey"
        width={80}
        height={80}
        priority
        tabIndex={0}
      />
      <span className="ii-pop ii-pop--beside" aria-hidden="true">
        <Image src="/assets/preview-pin.jpg" alt="" width={793} height={793} sizes="150px" quality={92} />
      </span>
    </span>
  );
}
