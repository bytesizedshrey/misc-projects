"use client";

import React from "react";
import Image from "next/image";
import { playAudio } from "@/lib/audio";

interface FrameData {
  label: string;
  image: string;
  alt: string;
  style: {
    r: number;
    y: number;
    sx: number;
    z: number;
  };
}

const frames: FrameData[] = [
  {
    label: "My cloud of fluff",
    image: "/assets/dog.jpg",
    alt: "Dog",
    style: { r: -14, y: 8, sx: -24, z: 1 },
  },
  {
    label: "London GOATED view",
    image: "/assets/london.jpg",
    alt: "London",
    style: { r: -9.3, y: 3.5, sx: -16, z: 2 },
  },
  {
    label: "that's me",
    image: "/assets/pfp-new.jpg",
    alt: "Shrey",
    style: { r: -4.6, y: 0.9, sx: -8, z: 3 },
  },
  {
    label: "favourite meme",
    image: "/assets/theL.gif",
    alt: "Meme",
    style: { r: 0, y: 0, sx: 0, z: 4 },
  },
  {
    label: "random pic of the sun",
    image: "/assets/sun.jpg",
    alt: "Sun",
    style: { r: 4.6, y: 0.9, sx: 8, z: 5 },
  },
  {
    label: "sunset in Tuscany",
    image: "/assets/sunset.jpg",
    alt: "Sunset",
    style: { r: 9.3, y: 3.5, sx: 16, z: 6 },
  },
  {
    label: "beautiful sea view",
    image: "/assets/water.jpg",
    alt: "Water",
    style: { r: 14, y: 8, sx: 24, z: 7 },
  },
];

export default function PhotoShelf() {
  return (
    <section className="v2-shelf" aria-label="Photos" data-astro-cid-yks6mgkh>
      <h2 data-astro-cid-yks6mgkh>Off screen</h2>
      <div className="v2-shelf__row" data-astro-cid-yks6mgkh>
        {frames.map((frame, index) => {
          const inlineStyle = {
            "--r": `${frame.style.r}deg`,
            "--y": `${frame.style.y}px`,
            "--sx": `${frame.style.sx}px`,
            "--z": frame.style.z,
          } as React.CSSProperties;

          return (
            <button
              key={index}
              type="button"
              className="v2-frame"
              style={inlineStyle}
              onPointerEnter={() => playAudio("tick")}
              onPointerDown={() => playAudio("press")}
              aria-label={frame.alt}
              data-astro-cid-da7pukvc
            >
              <span
                className="bubble v2-frame__bubble"
                data-astro-cid-da7pukvc="true"
                data-astro-cid-erjq6yp3
              >
                {Array.from(frame.label).map((char, cIndex) => (
                  <span
                    key={cIndex}
                    style={{ "--i": cIndex } as React.CSSProperties}
                    data-astro-cid-erjq6yp3
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </span>
              <span className="v2-frame__paper" data-astro-cid-da7pukvc>
                <Image
                  src={frame.image}
                  alt={frame.alt}
                  width={150}
                  height={180}
                  loading="eager"
                  className="w-[100px] h-[120px] max-[480px]:w-[72px] max-[480px]:h-[88px] object-cover"
                  data-astro-cid-da7pukvc
                />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
