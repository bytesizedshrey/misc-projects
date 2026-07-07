"use client";

import React, { useState } from "react";
import Image from "next/image";
import { playAudio } from "@/lib/audio";

interface PhotoFrameProps {
  src: string;
  alt: string;
  bubbleText: string;
  style: React.CSSProperties;
}

const PhotoFrame: React.FC<PhotoFrameProps> = ({ src, alt, bubbleText, style }) => {
  const [hovered, setHovered] = useState(false);

  const handlePointerEnter = () => {
    setHovered(true);
    playAudio("tick");
  };

  const handlePointerLeave = () => {
    setHovered(false);
  };

  const handlePointerDown = () => {
    playAudio("press");
  };

  return (
    <button
      type="button"
      className="v2-frame"
      style={style}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      aria-label={`View photo of ${alt}`}
      data-astro-cid-da7pukvc
    >
      <span
        className={`bubble v2-frame__bubble ${hovered ? "is-visible" : ""}`}
        data-astro-cid-da7pukvc="true"
        data-astro-cid-erjq6yp3
      >
        {bubbleText.split("").map((char, index) => (
          <span
            key={index}
            style={{ "--i": index } as React.CSSProperties}
            data-astro-cid-erjq6yp3
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
      <span className="v2-frame__paper" data-astro-cid-da7pukvc>
        <Image
          src={src}
          alt={alt}
          width={150}
          height={180}
          loading="eager"
          className="w-[100px] h-[120px] max-[480px]:w-[72px] max-[480px]:h-[88px] object-cover"
          unoptimized
          data-astro-cid-da7pukvc
        />
      </span>
    </button>
  );
};

export default function PhotoShelf() {
  const photos = [
    {
      src: "/assets/sadie.jpg?v=4",
      alt: "Sadie Sink",
      bubble: "fav actress",
      style: {
        "--r": "-14deg",
        "--y": "8px",
        "--sx": "-24px",
        "--z": 1,
      } as React.CSSProperties,
    },
    {
      src: "/assets/taylor.jpg?v=4",
      alt: "Taylor Swift",
      bubble: "fav singer",
      style: {
        "--r": "-9.3deg",
        "--y": "3.5px",
        "--sx": "-16px",
        "--z": 2,
      } as React.CSSProperties,
    },
    {
      src: "/assets/pfp-new.jpg?v=3",
      alt: "Shrey",
      bubble: "that's me",
      style: {
        "--r": "-4.6deg",
        "--y": "0.9px",
        "--sx": "-8px",
        "--z": 6, // Top priority stack
      } as React.CSSProperties,
    },
    {
      src: "/assets/ferrari.jpg?v=3",
      alt: "Ferrari meme",
      bubble: "must be the water",
      style: {
        "--r": "0deg",
        "--y": "0px",
        "--sx": "0px",
        "--z": 3,
      } as React.CSSProperties,
    },
    {
      src: "/assets/hamilton.jpg?v=3",
      alt: "Lewis Hamilton",
      bubble: "remember who you are",
      style: {
        "--r": "4.6deg",
        "--y": "0.9px",
        "--sx": "8px",
        "--z": 4,
      } as React.CSSProperties,
    },
    {
      src: "/assets/spiderman.jpg?v=3",
      alt: "Spiderman",
      bubble: "with great powers comes great responsibilities",
      style: {
        "--r": "9.3deg",
        "--y": "3.5px",
        "--sx": "16px",
        "--z": 5,
      } as React.CSSProperties,
    },
  ];

  return (
    <section className="v2-shelf" aria-label="Photos" data-astro-cid-yks6mgkh>
      <h2 data-astro-cid-yks6mgkh>Off screen</h2>
      <div className="v2-shelf__row" data-astro-cid-yks6mgkh>
        {photos.map((photo, i) => (
          <PhotoFrame
            key={i}
            src={photo.src}
            alt={photo.alt}
            bubbleText={photo.bubble}
            style={photo.style}
          />
        ))}
      </div>
    </section>
  );
}
