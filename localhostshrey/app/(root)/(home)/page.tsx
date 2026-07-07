"use client";

import React, { useEffect, useRef } from "react";
import PhotoShelf from "@/components/PhotoShelf";
import PetCat from "@/components/PetCat";
import { playAudio } from "@/lib/audio";
import { slotText } from "@/lib/slotText";

interface TagProps {
  label: string;
  color: string;
}

const Tag: React.FC<TagProps> = ({ label, color }) => (
  <span
    className="tag"
    style={{ "--tag-color": color } as React.CSSProperties}
    aria-label={label}
    data-astro-cid-joucddzy
  >
    <span className="tag__sweep" data-astro-cid-joucddzy></span>
    <span className="tag__label" data-astro-cid-joucddzy>{label}</span>
  </span>
);

interface ProjectItem {
  year?: string;
  title: string;
  description: string;
  meta: string;
  link?: string;
  tag?: {
    label: string;
    color: string;
  };
}

const PROJECTS: ProjectItem[] = [
  {
    year: "2026",
    title: "snitch",
    description: "Real-time communication app built with Socket.io",
    meta: "React, Node.js, Socket.io",
    link: "https://github.com/bytesizedshrey/snitch",
    tag: { label: "Starred", color: "#2563eb" },
  },
  {
    title: "perplexity",
    description: "AI-powered search engine wrapper using Perplexity API",
    meta: "Fullstack + GenAI",
    link: "https://github.com/bytesizedshrey/perplexity",
    tag: { label: "Starred", color: "#b45309" },
  },
  {
    year: "2025",
    title: "battle-arena",
    description: "Retro 2D battle arena game using HTML5 Canvas",
    meta: "HTML5 Canvas, JavaScript",
    link: "https://github.com/bytesizedshrey/battle-arena",
    tag: { label: "Starred", color: "#b45309" },
  },
];

export default function Home() {
  const emailRef = useRef<HTMLButtonElement>(null);
  const emailSlotRef = useRef<any>(null);

  useEffect(() => {
    if (emailRef.current) {
      emailSlotRef.current = slotText(emailRef.current, "email", {
        direction: "up",
      });
    }
    return () => {
      emailSlotRef.current?.destroy();
    };
  }, []);

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard?.writeText("thisisitshrey@gmail.com");
    playAudio("success");
    if (emailSlotRef.current) {
      emailSlotRef.current.flash("copied!", {
        revertAfter: 1600,
        enter: { direction: "up", color: "#15803d" },
        exit: { direction: "down" },
      });
    }
  };

  const getFormattedDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleString("en-US", { month: "short" });
    const year = today.getFullYear();
    return `Updated ${day} ${month} ${year}`;
  };

  return (
    <main className="v2" data-astro-cid-j7pv25f6>
      <h3 data-astro-cid-j7pv25f6 className="text-xl font-bold tracking-tight text-neutral-900">
        localhostshrey
      </h3>
      <p className="v2-updated" data-astro-cid-j7pv25f6>
        {getFormattedDate()}
      </p>

      <div className="v2-prose" data-astro-cid-j7pv25f6>
        <p data-astro-cid-j7pv25f6>
          I'm a full stack developer based in India. full stack dev · mern · cooked 24/7.
        </p>
        <p data-astro-cid-j7pv25f6>
          In the open I've shipped{" "}
          <a
            className="basic-link"
            href="https://github.com/bytesizedshrey/snitch"
            target="_blank"
            rel="noopener noreferrer"
            onPointerEnter={() => playAudio("tick")}
            onPointerDown={() => playAudio("press")}
            data-astro-cid-j7pv25f6="true"
            data-astro-cid-rq52bn6l
          >
            snitch
          </a>
          ,{" "}
          <a
            className="basic-link"
            href="https://github.com/bytesizedshrey/perplexity"
            target="_blank"
            rel="noopener noreferrer"
            onPointerEnter={() => playAudio("tick")}
            onPointerDown={() => playAudio("press")}
            data-astro-cid-j7pv25f6="true"
            data-astro-cid-rq52bn6l
          >
            perplexity
          </a>
          , and{" "}
          <a
            className="basic-link"
            href="https://github.com/bytesizedshrey/battle-arena"
            target="_blank"
            rel="noopener noreferrer"
            onPointerEnter={() => playAudio("tick")}
            onPointerDown={() => playAudio("press")}
            data-astro-cid-j7pv25f6="true"
            data-astro-cid-rq52bn6l
          >
            battle-arena
          </a>
          . By day I experiment with system design and full-stack architecture.
        </p>
        <p data-astro-cid-j7pv25f6>
          Say hi on{" "}
          <a
            className="basic-link"
            href="https://github.com/bytesizedshrey"
            target="_blank"
            rel="me noopener noreferrer"
            onPointerEnter={() => playAudio("tick")}
            onPointerDown={() => playAudio("press")}
            data-astro-cid-j7pv25f6="true"
            data-astro-cid-rq52bn6l
          >
            GitHub
          </a>
          ,{" "}
          <a
            className="basic-link"
            href="https://www.linkedin.com/in/localhostshrey/"
            target="_blank"
            rel="me noopener noreferrer"
            onPointerEnter={() => playAudio("tick")}
            onPointerDown={() => playAudio("press")}
            data-astro-cid-j7pv25f6="true"
            data-astro-cid-rq52bn6l
          >
            LinkedIn
          </a>
          , or{" "}
          <button
            className="basic-link inline-flex cursor-pointer"
            onClick={handleEmailClick}
            onPointerEnter={() => playAudio("tick")}
            onPointerDown={() => playAudio("press")}
            data-astro-cid-j7pv25f6="true"
            data-astro-cid-rq52bn6l
            ref={emailRef}
          >
            email
          </button>{" "}
          if you want to talk.
        </p>
      </div>

      <section className="v2-index" aria-labelledby="v2-work-heading" data-astro-cid-q257azvz>
        <h2 id="v2-work-heading" data-astro-cid-q257azvz>
          Projects
        </h2>
        <div className="v2-index__table" data-astro-cid-q257azvz>
          {PROJECTS.map((project, index) => {
            const rowStyle = { "--row-i": index } as React.CSSProperties;
            const isYearStart = !!project.year;

            return (
              <a
                key={index}
                style={rowStyle}
                onPointerEnter={() => playAudio("tick")}
                onPointerDown={() => playAudio("press")}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                data-astro-cid-xurrqhsc="true"
                className={`v2-row ${isYearStart ? "v2-row--year-start" : ""}`}
              >
                <span className="v2-row__year" data-astro-cid-xurrqhsc>
                  {project.year || ""}
                </span>
                <span className="v2-row__title" data-astro-cid-xurrqhsc>
                  {project.title} — {project.description}
                  {project.tag && <Tag label={project.tag.label} color={project.tag.color} />}
                </span>
                <span className="v2-row__meta" data-astro-cid-xurrqhsc>
                  {project.meta}
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <PhotoShelf />
      <PetCat />
    </main>
  );
}
