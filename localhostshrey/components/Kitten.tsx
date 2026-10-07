"use client";

import Image from "next/image";
import { useState } from "react";

export default function Kitten() {
  const [hop, setHop] = useState(0);

  return (
    <button
      type="button"
      className="kitten"
      aria-label="kitten"
      data-hop={hop % 2}
      onClick={() => setHop((n) => n + 1)}
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
  );
}
