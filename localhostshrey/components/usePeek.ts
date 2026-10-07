import { useCallback, useEffect, useRef } from "react";

/**
 * Shared behaviour for hover previews. The preview sits centred above its
 * trigger (the wrapper's first child); --dx nudges it sideways only when it
 * would leave the screen. The "beside" variant opens to the left or right instead. Clamped from mount and on resize so a hidden
 * preview never widens the page.
 */
export function usePeek() {
  const wrap = useRef<HTMLSpanElement>(null);

  const place = useCallback(() => {
    const el = wrap.current;
    const trig = el?.firstElementChild as HTMLElement | null;
    const pop = el?.querySelector<HTMLElement>(".ii-pop");
    if (!el || !trig || !pop) return;
    /* previews are display:none until first placed, so an unclamped one can never widen the page */
    if (!el.dataset.ready) {
      el.dataset.ready = "1";
    }
    const t = trig.getBoundingClientRect();
    const w = pop.offsetWidth;
    if (pop.classList.contains("ii-pop--beside")) {
      /* beside the trigger: left if there is room, otherwise right */
      el.dataset.side = t.left - w - 12 < 8 ? "right" : "left";
      return;
    }
    const left = t.left + t.width / 2 - w / 2;
    const dx = Math.max(8 - left, Math.min(0, window.innerWidth - 8 - (left + w)));
    el.style.setProperty("--dx", `${Math.round(dx)}px`);
  }, []);

  useEffect(() => {
    place();
    document.fonts?.ready.then(place);
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [place]);

  return { wrap, place };
}
