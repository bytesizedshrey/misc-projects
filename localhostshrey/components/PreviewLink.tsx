"use client";

import Image from "next/image";
import { usePeek } from "./usePeek";

type Props = {
  href: string;
  /** Hero screenshot of the linked site */
  src: string;
  children: React.ReactNode;
};

/** A text link that shows a small screenshot of its target on hover — same system as InlineImage. */
export default function PreviewLink({ href, src, children }: Props) {
  const { wrap, place } = usePeek();

  return (
    <span className="ii-wrap" ref={wrap} onPointerEnter={place} onFocus={place}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
      <span className="ii-pop ii-pop--wide" aria-hidden="true">
        <Image src={src} alt="" width={800} height={500} sizes="160px" quality={92} />
      </span>
    </span>
  );
}
