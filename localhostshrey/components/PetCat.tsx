"use client";

import React, { useEffect, useRef, useState } from "react";
import { playAudio } from "@/lib/audio";
import { slotText } from "@/lib/slotText";

const AMBIENT_DIALOUGES = [
  "everything here ships by hand",
  "he rebuilt this page twice",
  "details are the whole point",
  "the clock is real, by the way",
  "say hi. he actually replies.",
  "I own this site. he pays hosting.",
  "he sleeps. I commit.",
  "this footer is my territory",
  "I supervised every pixel",
];

const BOOP_DIALOGUES = [
  "noted. continue.",
  "that's one treat you owe",
  "careful, fresh paint",
  "ok, that was nice",
  "I allow this. once.",
];

const SLEEP_DIALOGUES = [
  "asleep. Mumbai time.",
  "five more minutes",
  "come back tomorrow",
];

const FEED_DIALOGUES = [
  "purr. acceptable.",
  "finally. service.",
  "five stars. one fish.",
  "you may stay",
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

export default function PetCat() {
  const clockRef = useRef<HTMLSpanElement>(null);
  const slotTextInstance = useRef<any>(null);

  const [timeStr, setTimeStr] = useState("");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [isAsleep, setIsAsleep] = useState(false);
  const [isBooped, setIsBooped] = useState(false);
  const [isEating, setIsEating] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
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
      setIsAsleep(hr >= 23 || hr < 7);
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

  // Blinking loop (only when awake)
  useEffect(() => {
    let blinkTimer: number;

    const runBlink = () => {
      if (!isAsleep) {
        setIsBlinking(true);
        window.setTimeout(() => {
          setIsBlinking(false);
        }, 160);
      }
      blinkTimer = window.setTimeout(runBlink, 4200 + Math.random() * 2000) as unknown as number;
    };

    blinkTimer = window.setTimeout(runBlink, 4200) as unknown as number;

    return () => {
      window.clearTimeout(blinkTimer);
    };
  }, [isAsleep]);

  // Ambient Dialogues
  useEffect(() => {
    const ambientInterval = window.setInterval(() => {
      if (isAsleep || bubbleVisible || Math.random() >= 0.4) return;
      const idx = Math.floor(Math.random() * AMBIENT_DIALOUGES.length);
      showBubble(AMBIENT_DIALOUGES[idx]);
    }, 16000);

    return () => {
      window.clearInterval(ambientInterval);
    };
  }, [isAsleep, bubbleVisible]);

  // Boop handler
  const handleBoop = () => {
    playAudio("droplet");
    setIsBooped(true);
    window.setTimeout(() => {
      setIsBooped(false);
    }, 400);

    if (isAsleep) {
      const idx = Math.floor(Math.random() * SLEEP_DIALOGUES.length);
      showBubble(SLEEP_DIALOGUES[idx], 1600);
    } else {
      const idx = Math.floor(Math.random() * BOOP_DIALOGUES.length);
      showBubble(BOOP_DIALOGUES[idx], 1600);
    }
  };

  // Feed handler
  const handleFeed = () => {
    if (isAsleep) {
      showBubble("asleep. leave it by the door.", 1800);
      return;
    }

    const now = Date.now();
    if (now - lastFeedTimeRef.current < 6000) {
      playAudio("whisper");
      showBubble("I'm full. save it.", 1400);
      return;
    }

    lastFeedTimeRef.current = now;
    playAudio("droplet");
    setIsThrown(true);

    window.setTimeout(() => {
      setIsThrown(false);
      playAudio("success");
      setIsEating(true);
      const idx = Math.floor(Math.random() * FEED_DIALOGUES.length);
      showBubble(FEED_DIALOGUES[idx], 2000);

      window.setTimeout(() => {
        setIsEating(false);
      }, 800);
    }, 440);
  };

  // Classes combination
  const catClasses = [
    "v2-pet",
    isAsleep ? "is-asleep" : "",
    isBooped ? "is-booped" : "",
    isEating ? "is-eating" : "",
    isBlinking ? "is-blinking" : "",
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
          className={catClasses}
          onClick={handleBoop}
          aria-hidden="true"
          data-astro-cid-fevfxcpg
        >
          <span
            className={`bubble v2-pet__bubble ${bubbleVisible ? "is-visible" : ""}`}
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
          <svg className="v2-pet__svg" viewBox="0 0 40 32" fill="none" aria-hidden="true">
            <g
              className="cat-dreams"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <g className="cat-z-1" strokeWidth="1.5">
                <path d="M34 1 L38 1 L34 5 L38 5"></path>
              </g>
              <g className="cat-z-2" strokeWidth="1.3">
                <path d="M37 -1.2 L40 -1.2 L37 1.8 L40 1.8"></path>
              </g>
            </g>
            <g className="cat-body">
              {/* Whiskers */}
              <g className="cat-whiskers" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none">
                <path d="M8.5 10.5 L2 8.6"></path>
                <path d="M8 12.8 L1.2 12.6"></path>
                <path d="M8.5 15 L2.2 16.8"></path>
                <path d="M25.5 10.5 L32 8.6"></path>
                <path d="M26 12.8 L32.8 12.6"></path>
                <path d="M25.5 15 L31.8 16.8"></path>
              </g>
              {/* Tail */}
              <path
                className="cat-tail"
                d="M26.8 26 C30.2 25 32 21 31.2 16.8"
                stroke="currentColor"
                strokeWidth="2.7"
                strokeLinecap="round"
                fill="none"
              ></path>
              {/* Body */}
              <path
                fill="currentColor"
                d="M10.3 9 L8.6 2.8 L13.6 5 C15.6 4.3 18.4 4.3 20.4 5 L25.4 2.8 L23.7 9 C24.6 10.8 24.9 13 24.2 15 C26.3 17.2 27.4 20.4 27.3 23.6 C27.3 25.8 26 27.6 23.5 28.3 C19.5 29.3 14.5 29.3 11.5 28.2 C8.9 27 7.8 24 8.2 21 C8.5 18.5 9.3 16.4 10.6 14.9 C9.6 12.9 9.7 10.9 10.3 9 Z"
              ></path>
              {/* Eyes */}
              <g className="cat-eyes">
                <circle className="cat-eye" cx="13.9" cy="11.6" r="2.1" fill="rgb(251, 250, 249)"></circle>
                <circle className="cat-eye" cx="20.1" cy="11.6" r="2.1" fill="rgb(251, 250, 249)"></circle>
              </g>
            </g>
          </svg>
        </span>
        <button
          type="button"
          className={feedClasses}
          onClick={handleFeed}
          onPointerEnter={() => playAudio("tick")}
          aria-label="Feed the cat"
          data-astro-cid-f5r2mlfl
        >
          <svg className="v2-feed__fish" viewBox="0 0 16 10" fill="none" aria-hidden="true">
            <path d="M1.5 5 C4 1.5 8 1 11 3.2 L14.5 1 L13.5 5 L14.5 9 L11 6.8 C8 9 4 8.5 1.5 5 Z" fill="currentColor"></path>
            <circle cx="4.5" cy="4.2" r="0.7" fill="rgb(251, 250, 249)"></circle>
          </svg>
        </button>
      </span>
    </footer>
  );
}
