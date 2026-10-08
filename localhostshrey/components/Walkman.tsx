"use client";

import { useState } from "react";

/** A small physical Walkman: silver shell, graphite plate, speaker grille, LCD, metal buttons.
 *  Static object; the buttons press in when clicked. No audio, no player UI. */
export default function Walkman() {
  const [on, setOn] = useState(false);

  return (
    <div className="wm-stage">
      <div className="wm" data-on={on}>
        <div className="wm__plate">
          <span className="wm__grille" aria-hidden="true" />
          <span className="wm__lcd" aria-hidden="true">
            <i className="wm__art" />
          </span>
          <span className="wm__pair">
            <button type="button" className="wm__btn wm__btn--prev" aria-label="Previous" />
            <button type="button" className="wm__btn wm__btn--next" aria-label="Next" />
          </span>
          <button
            type="button"
            className="wm__play"
            aria-label={on ? "Pause" : "Play"}
            aria-pressed={on}
            onClick={() => setOn((v) => !v)}
          >
            <span className="wm__glyph" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
