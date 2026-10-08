"use client";

import Image from "next/image";
import { useState } from "react";
import Dial from "./Dial";

const PHOTOS = [
  { src: "/assets/joey.jpg", alt: "Joey", caption: "how u doin??", r: -14, y: 8, z: 1 },
  { src: "/assets/taylor.jpg", alt: "Taylor Swift", caption: "all too well", r: -9, y: 4, z: 2 },
  { src: "/assets/me-gym.jpg", alt: "Shrey", caption: "that's me", r: -4, y: 1, z: 6 },
  { src: "/assets/ferrari.jpg", alt: "Ferrari meme", caption: "must be the water", r: 0, y: 0, z: 3 },
  { src: "/assets/hamilton.jpg", alt: "Lewis Hamilton", caption: "remember who you are", r: 5, y: 1, z: 4 },
  { src: "/assets/spiderman.jpg", alt: "Spiderman", caption: "with great powers comes great responsibilities", r: 9, y: 4, z: 5 },
];

export default function OffScreen() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="offscreen" aria-labelledby="off-screen">
      <Dial />
      <h2 id="off-screen" className="section__label">
        Off screen
      </h2>
      <div className="shelf-wrap">
      <div className="shelf" onPointerLeave={() => setActive(null)}>
        {PHOTOS.map((p, i) => (
          <button
            key={p.src}
            type="button"
            className="shelf__item"
            data-on={active === i}
            aria-label={`${p.alt}: ${p.caption}`}
            style={
              {
                "--r": `${p.r}deg`,
                "--y": `${p.y}px`,
                "--z": p.z,
              } as React.CSSProperties
            }
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(i)}
          >
            <Image
              src={p.src}
              alt=""
              width={400}
              height={500}
              sizes="(max-width: 560px) 120px, 200px"
              quality={92}
            />
            <span className="card__inset" aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="shelf__caption" aria-live="polite">
        {active === null ? "" : PHOTOS[active].caption}
      </p>
      </div>
    </section>
  );
}
