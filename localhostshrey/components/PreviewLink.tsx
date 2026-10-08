"use client";

import Image from "next/image";
import { usePeek } from "./usePeek";

type Props = {
  href: string;
  /** Hero screenshot of the linked site */
  src: string;
  children: React.ReactNode;
  /** Render as a small inline tag with a thumbnail (hero line) */
  tag?: "a" | "b";
};

/** A text link that shows a small screenshot of its target on hover — same system as InlineImage. */
export default function PreviewLink({ href, src, children, tag }: Props) {
  const { wrap, place } = usePeek();

  return (
    <span className="ii-wrap" ref={wrap} onPointerEnter={place} onFocus={place}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={tag ? `tag tag--${tag}` : undefined}
      >
        {tag && (
          <Image className="tag__thumb" src={src} alt="" width={64} height={40} sizes="32px" quality={80} />
        )}
        {children}
      </a>
      <span className="ii-pop ii-pop--wide" aria-hidden="true">
        <Image src={src} alt="" width={800} height={500} sizes="160px" quality={92} />
      </span>
    </span>
  );
}
