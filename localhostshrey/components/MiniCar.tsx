"use client";

import React, { useEffect, useRef, useState } from "react";
import { playAudio } from "@/lib/audio";
import { slotText } from "@/lib/slotText";

const AMBIENT_DIALOUGES = [
  "v8 engine purring",
  "ready for a drive",
  "premium fuel only",
  "the clock is real, by the way",
  "say hi. he actually replies.",
  "I own this site. he pays hosting.",
  "he sleeps. I commit.",
  "this footer is my territory",
  "I supervised every pixel",
];

const BOOP_DIALOGUES = [
  "honk honk",
  "hey, watch the paint",
  "ready to race?",
  "ok, that was nice",
  "I allow this. once.",
];

const SLEEP_DIALOGUES = [
  "parked in the garage",
  "engine off",
  "come back tomorrow",
];

const FEED_DIALOGUES = [
  "glug glug",
  "full tank",
  "premium only",
  "ready to race",
];

function getFormattedTime() {
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  };
  return new Date()
    .toLocaleTimeString("en-GB", options)
    .replace(" ", "")
    .toLowerCase();
}

function getLocalHour() {
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    hour12: false,
    timeZone: "Asia/Kolkata",
  };
  return parseInt(new Date().toLocaleTimeString("en-GB", options), 10);
}

export default function MiniCar() {
  const clockRef = useRef<HTMLSpanElement>(null);
  const slotTextInstance = useRef<any>(null);

  const [timeStr, setTimeStr] = useState("");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [isParked, setIsParked] = useState(false);
  const [isHonked, setIsHonked] = useState(false);
  const [isRefueling, setIsRefueling] = useState(false);
  const [isFlashingLights, setIsFlashingLights] = useState(false);
  const [isThrown, setIsThrown] = useState(false);

  const bubbleTimeoutRef = useRef<number | null>(null);
  const lastFeedTimeRef = useRef<number>(0);

  const showBubble = (text: string, duration = 2800) => {
    if (bubbleTimeoutRef.current) {
      window.clearTimeout(bubbleTimeoutRef.current);
    }
    setBubbleText(text);
    setBubbleVisible(true);
    bubbleTimeoutRef.current = window.setTimeout(() => {
      setBubbleVisible(false);
    }, duration) as unknown as number;
  };

  // Clock Update & Sleep Check
  useEffect(() => {
    const initialTime = getFormattedTime();
    setTimeStr(initialTime);

    if (clockRef.current) {
      slotTextInstance.current = slotText(clockRef.current, initialTime, {
        direction: "up",
        skipUnchanged: true,
      });
    }

    const checkAsleep = () => {
      const hr = getLocalHour();
      setIsParked(hr >= 23 || hr < 7);
    };
    checkAsleep();

    const interval = window.setInterval(() => {
      const currentFormatted = getFormattedTime();
      setTimeStr(currentFormatted);
      checkAsleep();

      if (slotTextInstance.current) {
        slotTextInstance.current.set(currentFormatted, { direction: "up" });
      }
    }, 10000);

    return () => {
      window.clearInterval(interval);
      slotTextInstance.current?.destroy();
    };
  }, []);

  // Flashing loop (only when not parked)
  useEffect(() => {
    let blinkTimer: number;

    const runBlink = () => {
      if (!isParked) {
        setIsFlashingLights(true);
        window.setTimeout(() => {
          setIsFlashingLights(false);
        }, 160);
      }
      blinkTimer = window.setTimeout(runBlink, 4200 + Math.random() * 2000) as unknown as number;
    };

    blinkTimer = window.setTimeout(runBlink, 4200) as unknown as number;

    return () => {
      window.clearTimeout(blinkTimer);
    };
  }, [isParked]);

  // Ambient Dialogues
  useEffect(() => {
    const ambientInterval = window.setInterval(() => {
      if (isParked || bubbleVisible || Math.random() >= 0.4) return;
      const idx = Math.floor(Math.random() * AMBIENT_DIALOUGES.length);
      showBubble(AMBIENT_DIALOUGES[idx]);
    }, 16000);

    return () => {
      window.clearInterval(ambientInterval);
    };
  }, [isParked, bubbleVisible]);

  // Honk handler
  const handleHonk = () => {
    playAudio("droplet");
    setIsHonked(true);
    window.setTimeout(() => {
      setIsHonked(false);
    }, 400);

    if (isParked) {
      const idx = Math.floor(Math.random() * SLEEP_DIALOGUES.length);
      showBubble(SLEEP_DIALOGUES[idx], 1600);
    } else {
      const idx = Math.floor(Math.random() * BOOP_DIALOGUES.length);
      showBubble(BOOP_DIALOGUES[idx], 1600);
    }
  };

  // Fuel handler
  const handleFuel = () => {
    if (isParked) {
      showBubble("parked. leave it by the door.", 1800);
      return;
    }

    const now = Date.now();
    if (now - lastFeedTimeRef.current < 6000) {
      playAudio("whisper");
      showBubble("tank is full. save it.", 1400);
      return;
    }

    lastFeedTimeRef.current = now;
    playAudio("droplet");
    setIsThrown(true);

    window.setTimeout(() => {
      setIsThrown(false);
      playAudio("success");
      setIsRefueling(true);
      const idx = Math.floor(Math.random() * FEED_DIALOGUES.length);
      showBubble(FEED_DIALOGUES[idx], 2000);

      window.setTimeout(() => {
        setIsRefueling(false);
      }, 800);
    }, 440);
  };

  // Classes combination
  const carClasses = [
    "v2-car",
    isParked ? "is-parked" : "",
    isHonked ? "is-honked" : "",
    isRefueling ? "is-refueling" : "",
    isFlashingLights ? "is-flashing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const feedClasses = ["v2-feed", isThrown ? "is-thrown" : ""].filter(Boolean).join(" ");

  return (
    <footer className="v2-footer" data-astro-cid-f5r2mlfl>
      <span className="v2-footer__line" data-astro-cid-f5r2mlfl>
        <span ref={clockRef} className="v2-clock" data-v2-clock data-astro-cid-f5r2mlfl>
          {timeStr || "12:00am"}
        </span>{" "}
        in Mumbai, India
        <span
          className={carClasses}
          onClick={handleHonk}
          aria-hidden="true"
          data-astro-cid-fevfxcpg
        >
          <span
            className={`bubble v2-car__bubble ${bubbleVisible ? "is-visible" : ""}`}
            data-v2-bubble="true"
            data-astro-cid-fevfxcpg="true"
            data-astro-cid-erjq6yp3
          >
            {Array.from(bubbleText).map((char, index) => (
              <span
                key={index}
                style={{ "--i": index } as React.CSSProperties}
                data-astro-cid-erjq6yp3
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
          <svg className="v2-car__svg" viewBox="0 0 40 32" fill="none" aria-hidden="true">
            <g
              className="car-smoke"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <g className="smoke-1" strokeWidth="1.5">
                <path d="M4 25 Q2 20 6 15"></path>
              </g>
              <g className="smoke-2" strokeWidth="1.3">
                <path d="M8 26 Q12 21 7 16"></path>
              </g>
            </g>
            <g className="car-body">
              {/* Body */}
              <path
                fill="currentColor"
                d="M7 18 L10 12 L20 12 L28 15 L34 16 L35 20 C35 22 34 23 32 23 L31 23 C31 20 27 20 27 23 L15 23 C15 20 11 20 11 23 L8 23 C6 23 5 21 5 19 Z"
              ></path>
              {/* Windows */}
              <path fill="rgb(var(--color-bg))" d="M11 13 L17 13 L17 17 L9 17 Z"></path>
              <path fill="rgb(var(--color-bg))" d="M19 13 L24 13 L26 16 L19 16 Z"></path>
              {/* Headlight */}
              <path className="car-headlight" fill="rgb(var(--color-bg))" d="M33 17 L35 17 L35 19 L33 19 Z"></path>
            </g>
            <g className="car-wheels">
              {/* Wheels */}
              <circle cx="13" cy="23" r="3" fill="currentColor"></circle>
              <circle cx="29" cy="23" r="3" fill="currentColor"></circle>
              <circle cx="13" cy="23" r="1.5" fill="rgb(var(--color-bg))"></circle>
              <circle cx="29" cy="23" r="1.5" fill="rgb(var(--color-bg))"></circle>
            </g>
          </svg>
        </span>
        <button
          type="button"
          className={feedClasses}
          onClick={handleFuel}
          onPointerEnter={() => playAudio("tick")}
          aria-label="Refuel the car"
          data-astro-cid-f5r2mlfl
        >
          <svg className="v2-feed__fuel" viewBox="0 0 16 12" fill="none" aria-hidden="true">
            <path d="M4 2 L4 10 L10 10 L10 2 Z" fill="currentColor"></path>
            <path d="M5 0 L9 0 L9 2 L5 2 Z" fill="currentColor"></path>
            <path d="M10 5 L14 5 L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
            <rect x="5.5" y="4" width="3" height="4" fill="rgb(var(--color-bg))"></rect>
          </svg>
        </button>
      </span>
    </footer>
  );
}
