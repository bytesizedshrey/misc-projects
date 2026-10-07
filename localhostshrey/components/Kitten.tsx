"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const FULL =
  "https://res.cloudinary.com/dnaqrksdq/image/upload/v1755333555/i1_kg8mg5.png";

export default function Kitten() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span className="kitten-wrap" ref={root} data-open={open}>
      <button
        type="button"
        className="kitten"
        aria-label="kitten"
        aria-expanded={open}
        aria-controls="kitten-full"
        onClick={() => setOpen((o) => !o)}
      >
        <Image
          src="/assets/kitten.png"
          alt=""
          width={245}
          height={245}
          sizes="48px"
          quality={92}
        />
      </button>
      <a
        id="kitten-full"
        className="kitten-pop"
        href={FULL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open the full kitten image"
        tabIndex={open ? 0 : -1}
      >
        <Image
          src="/assets/kitten.png"
          alt="A kitten"
          width={245}
          height={245}
          sizes="240px"
          quality={92}
        />
      </a>
    </span>
  );
}
