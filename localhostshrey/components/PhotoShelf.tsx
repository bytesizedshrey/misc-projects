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
      className="v2-frame"
      style={style}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      aria-label={`View photo of ${alt}`}
    >
      <span className="v2-frame__paper">
        <Image
          src={src}
          alt={alt}
          width={100}
          height={120}
          className="object-cover"
          unoptimized
        />
      </span>
      <span className={`bubble ${hovered ? "is-visible" : ""}`}>
        {bubbleText.split("").map((char, index) => (
          <span key={index} style={{ "--i": index } as React.CSSProperties}>
            {char}
          </span>
        ))}
      </span>
    </button>
  );
};

export default function PhotoShelf() {
  const photos = [
    {
      src: "/assets/sadie.jpg?v=2",
      alt: "Sadie Sink",
      bubble: "sadie sink",
      style: {
        "--sx": "-2px",
        "--y": "1px",
        "--r": "-4deg",
        "--z": 1,
      } as React.CSSProperties,
    },
    {
      src: "/assets/taylor.jpg?v=2",
      alt: "Taylor Swift",
      bubble: "taylor swift",
      style: {
        "--sx": "-1px",
        "--y": "-3px",
        "--r": "2deg",
        "--z": 2,
      } as React.CSSProperties,
    },
    {
      src: "/assets/pfp-new.jpg?v=2",
      alt: "Shrey",
      bubble: "that's me",
      style: {
        "--sx": "0px",
        "--y": "0px",
        "--r": "-1deg",
        "--z": 6, // Make that's me stack on top when initialized
      } as React.CSSProperties,
    },
    {
      src: "/assets/ferrari.jpg?v=2",
      alt: "Ferrari meme",
      bubble: "must be the water",
      style: {
        "--sx": "1px",
        "--y": "4px",
        "--r": "-3deg",
        "--z": 3,
      } as React.CSSProperties,
    },
    {
      src: "/assets/hamilton.jpg?v=2",
      alt: "Lewis Hamilton",
      bubble: "remember who you are",
      style: {
        "--sx": "2px",
        "--y": "-2px",
        "--r": "3deg",
        "--z": 4,
      } as React.CSSProperties,
    },
    {
      src: "/assets/spiderman.jpg?v=2",
      alt: "Spiderman",
      bubble: "spiderman",
      style: {
        "--sx": "3px",
        "--y": "-4px",
        "--r": "-2deg",
        "--z": 5,
      } as React.CSSProperties,
    },
  ];

  return (
    <section className="v2-shelf" aria-label="Photo gallery">
      <h2>Off screen</h2>
      <div className="v2-shelf__row">
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
