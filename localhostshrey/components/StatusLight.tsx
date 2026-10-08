"use client";

import { useState } from "react";

/** "open to work" as a tiny status indicator: a recessed lens with a breathing light. Clicking flicks it. */
export default function StatusLight() {
  const [tick, setTick] = useState(0);
  return (
    <button type="button" className="status" onClick={() => setTick((t) => t + 1)} aria-label="Open to work">
      <span className="status__lens" aria-hidden="true">
        <i key={tick} className="status__led" />
      </span>
      <span className="status__text">open to work</span>
    </button>
  );
}
