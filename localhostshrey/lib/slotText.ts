const DEFAULT_OPTIONS = {
  direction: "down" as "up" | "down",
  stagger: 45,
  duration: 300,
  exitOffset: 50,
  easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  bounce: 0.6,
  colorFade: 280,
  skipUnchanged: true,
  interrupt: true,
};

const SPACE_CHAR = "\u00A0"; // non-breaking space
const formatChar = (c: string) => (c === " " ? SPACE_CHAR : c);

const activeTimers = new WeakMap<HTMLElement, { timers: number[]; target: string; pending?: { text: string; options?: any } }>();

function clearSlotText(element: HTMLElement) {
  const active = activeTimers.get(element);
  if (active) {
    active.timers.forEach((t) => window.clearTimeout(t));
    activeTimers.delete(element);
  }
}

function createFace(char: string): HTMLSpanElement {
  const face = document.createElement("span");
  face.className = "char-face";
  face.textContent = formatChar(char);
  return face;
}

function createSlot(char: string): HTMLSpanElement {
  const slot = document.createElement("span");
  slot.className = "char-slot";
  slot.dataset.char = char;

  const sizer = document.createElement("span");
  sizer.className = "char-sizer";
  sizer.textContent = formatChar(char);

  slot.appendChild(sizer);
  slot.appendChild(createFace(char));
  return slot;
}

export function buildSlotText(element: HTMLElement, text: string) {
  element.classList.add("slot-text");
  element.replaceChildren(...Array.from(text, createSlot));
}

export function animateSlotText(element: HTMLElement, targetText: string, options: any = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const active = activeTimers.get(element);

  if (active && !settings.interrupt) {
    active.pending = { text: targetText, options };
    return;
  }

  clearSlotText(element);

  if (!element.querySelector(".char-slot")) {
    buildSlotText(element, targetText);
    return;
  }

  const slots = Array.from(element.querySelectorAll(".char-slot")) as HTMLSpanElement[];
  const currentText = slots.map((s) => s.dataset.char ?? "").join("");

  if (!settings.interrupt && currentText === targetText) return;

  const maxLength = Math.max(currentText.length, targetText.length);
  const firstSlot = slots.find((s) => (s.dataset.char ?? "") !== "") ?? slots[0];
  const sizerHeight = firstSlot?.offsetHeight || element.offsetHeight || 18;

  // Extend slots array to fit target length
  for (let i = slots.length; i < maxLength; i++) {
    const slot = createSlot("");
    element.appendChild(slot);
    slots.push(slot);
  }

  const timers: number[] = [];
  activeTimers.set(element, { timers, target: targetText });

  const startY = settings.direction === "down" ? sizerHeight : -sizerHeight;
  const endY = settings.direction === "down" ? -sizerHeight : sizerHeight;

  let maxDuration = 0;

  for (let i = 0; i < maxLength; i++) {
    const fromChar = currentText[i] || "";
    const toChar = targetText[i] || "";

    if (fromChar === toChar && (settings.skipUnchanged || fromChar === "")) {
      continue;
    }

    const slot = slots[i];
    const sizer = slot.querySelector(".char-sizer") as HTMLSpanElement;
    const face = slot.querySelector(".char-face") as HTMLSpanElement;
    const currentWidth = slot.getBoundingClientRect().width;

    sizer.textContent = formatChar(toChar);
    const targetWidth = sizer.getBoundingClientRect().width;
    const widthChanged = Math.abs(targetWidth - currentWidth) > 0.5;

    if (widthChanged) {
      slot.style.width = `${currentWidth}px`;
    }
    if (fromChar === "" || toChar === "") {
      slot.classList.add("is-resizing");
    }

    const transitionProp = `transform ${settings.duration}ms ${settings.easing}`;
    const newFace = createFace(toChar);
    newFace.style.transformOrigin = "50% 50%";
    newFace.style.transform = `translateY(${startY}px)`;
    slot.appendChild(newFace);

    // Trigger reflow
    slot.offsetWidth;

    if (widthChanged) {
      const delay = settings.stagger * i;
      const duration = settings.duration;
      timers.push(
        window.setTimeout(() => {
          slot.style.transition = `width ${duration}ms cubic-bezier(0.2, 0, 0, 1)`;
          slot.style.width = `${targetWidth}px`;
        }, delay)
      );
      maxDuration = Math.max(maxDuration, delay + duration);
    }

    if (face) {
      timers.push(
        window.setTimeout(() => {
          face.style.transition = transitionProp;
          face.style.transform = `translateY(${endY}px)`;
        }, settings.stagger * i)
      );
    }

    timers.push(
      window.setTimeout(() => {
        newFace.style.transition = transitionProp;
        newFace.style.transform = "translateY(0)";

        const cleanUp = (e: TransitionEvent) => {
          if (e.propertyName === "transform") {
            newFace.removeEventListener("transitionend", cleanUp);
            slot.dataset.char = toChar;
            slot.style.removeProperty("transition");
            slot.style.removeProperty("width");
            slot.classList.remove("is-resizing");
            Array.from(slot.querySelectorAll(".char-face")).forEach((f) => {
              if (f !== newFace) f.remove();
            });
          }
        };
        newFace.addEventListener("transitionend", cleanUp);
      }, settings.stagger * i + settings.exitOffset)
    );
  }

  const totalWait = maxDuration + 80;
  timers.push(
    window.setTimeout(() => {
      const activeObj = activeTimers.get(element);
      activeTimers.delete(element);
      buildSlotText(element, targetText);
      if (activeObj?.pending) {
        animateSlotText(element, activeObj.pending.text, activeObj.pending.options);
      }
    }, totalWait)
  );
}

export function slotText(element: HTMLElement, initialText: string, options: any = {}) {
  let currentValue = initialText;
  let resetTimer: number | undefined;
  let originalValue: string | undefined;

  buildSlotText(element, initialText);

  return {
    element,
    get value() {
      return currentValue;
    },
    set(newText: string, setOptions: any = {}) {
      window.clearTimeout(resetTimer);
      originalValue = undefined;
      currentValue = newText;
      animateSlotText(element, newText, { ...options, ...setOptions });
    },
    flash(flashText: string, flashOptions: any = {}) {
      if (originalValue === undefined) {
        originalValue = currentValue;
      }
      currentValue = flashText;
      animateSlotText(element, flashText, { ...options, interrupt: false, ...flashOptions.enter });

      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        const revertVal = originalValue!;
        originalValue = undefined;
        currentValue = revertVal;
        animateSlotText(element, revertVal, { ...options, interrupt: false, ...flashOptions.exit });
      }, flashOptions.revertAfter ?? 1400);
    },
    destroy() {
      window.clearTimeout(resetTimer);
      clearSlotText(element);
      element.classList.remove("slot-text");
      element.textContent = currentValue;
    },
  };
}
