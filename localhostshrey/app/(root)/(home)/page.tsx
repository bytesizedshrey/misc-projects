"use client";

import React, { useEffect, useRef, useState } from "react";
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

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

interface FatLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const FatLink: React.FC<FatLinkProps> = ({ href, children, icon, ...props }) => (
  <a
    href={href}
    className="fat-link group"
    onPointerEnter={() => playAudio("tick")}
    onPointerDown={() => playAudio("press")}
    {...props}
  >
    {icon && (
      <span className="mr-[0.35rem] inline-flex origin-bottom transform opacity-80 transition-all duration-300 ease-out group-hover:scale-125 group-hover:-rotate-[8deg] group-hover:opacity-100 group-hover:text-blue-500">
        {icon}
      </span>
    )}
    <span className="fat-link__text">
      <span className="fat-link__hidden">{children}</span>
      <span className="fat-link__visible">{children}</span>
    </span>
  </a>
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
    description: "marketplace to buy or sell anything",
    meta: "React, Node.js, Socket.io",
    link: "https://github.com/bytesizedshrey/snitch",
    tag: { label: "Starred", color: "#2563eb" },
  },
  {
    title: "perplexity",
    description: "ai you can ask anything",
    meta: "Fullstack + GenAI",
    link: "https://github.com/bytesizedshrey/perplexity",
    tag: { label: "Starred", color: "#b45309" },
  },
  {
    title: "battle-arena",
    description: "multi-agent ai monitoring system",
    meta: "HTML5 Canvas, JavaScript",
    link: "https://github.com/bytesizedshrey/battle-arena",
    tag: { label: "Starred", color: "#b45309" },
  },
];

export default function Home() {
  const emailRef = useRef<HTMLButtonElement>(null);
  const emailSlotRef = useRef<any>(null);
  const headerClockRef = useRef<HTMLSpanElement>(null);
  const headerClockSlotRef = useRef<any>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);

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

  useEffect(() => {
    const audio = new Audio("/assets/alltoowell.mp3");
    audio.loop = true;
    audio.volume = 0.18;
    bgMusicRef.current = audio;

    let playAttempted = false;

    const startOnInteraction = () => {
      if (playAttempted) return;
      playAttempted = true;
      
      audio.play().then(() => {
        setMusicPlaying(true);
        window.removeEventListener("click", startOnInteraction);
        window.removeEventListener("keydown", startOnInteraction);
        window.removeEventListener("mousemove", startOnInteraction);
        window.removeEventListener("touchstart", startOnInteraction);
      }).catch(() => {
        playAttempted = false;
      });
    };

    window.addEventListener("click", startOnInteraction);
    window.addEventListener("keydown", startOnInteraction);
    window.addEventListener("mousemove", startOnInteraction);
    window.addEventListener("touchstart", startOnInteraction);

    return () => {
      audio.pause();
      audio.src = "";
      window.removeEventListener("click", startOnInteraction);
      window.removeEventListener("keydown", startOnInteraction);
      window.removeEventListener("mousemove", startOnInteraction);
      window.removeEventListener("touchstart", startOnInteraction);
    };
  }, []);

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = bgMusicRef.current;
    if (!audio) return;
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      audio.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      const kolkataTime = new Intl.DateTimeFormat("en-US", options).format(new Date()).toLowerCase();
      
      if (headerClockSlotRef.current) {
        headerClockSlotRef.current.update(kolkataTime);
      } else if (headerClockRef.current) {
        headerClockSlotRef.current = slotText(headerClockRef.current, kolkataTime);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearInterval(interval);
      headerClockSlotRef.current?.destroy();
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

  return (
    <main className="v2" data-astro-cid-j7pv25f6>
      <h3 data-astro-cid-j7pv25f6 className="text-xl font-bold tracking-tight text-neutral-900">
        localhostshrey
      </h3>
      <p className="v2-updated" data-astro-cid-j7pv25f6>
        <span ref={headerClockRef}>00:00:00 am</span> in Mumbai, India
        <button
          onClick={toggleMusic}
          title={musicPlaying ? "Pause music" : "Play music"}
          style={{
            marginLeft: "0.6rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.75rem",
            opacity: 0.5,
            verticalAlign: "middle",
            padding: 0,
            lineHeight: 1,
          }}
        >
          {musicPlaying ? "⏸" : "♪"}
        </button>
      </p>

      <div className="v2-prose" data-astro-cid-j7pv25f6>
        <p data-astro-cid-j7pv25f6>
          I'm a full stack developer based in India. cooked 24/7.
        </p>
        <p data-astro-cid-j7pv25f6>
          In the open I've shipped{" "}
          <FatLink
            href="https://github.com/bytesizedshrey/snitch"
            target="_blank"
            rel="noopener noreferrer"
          >
            snitch
          </FatLink>
          ,{" "}
          <FatLink
            href="https://github.com/bytesizedshrey/perplexity"
            target="_blank"
            rel="noopener noreferrer"
          >
            perplexity
          </FatLink>
          , and{" "}
          <FatLink
            href="https://github.com/bytesizedshrey/battle-arena"
            target="_blank"
            rel="noopener noreferrer"
          >
            battle-arena
          </FatLink>
          . By day I experiment with system design and full-stack architecture.
        </p>
        <p data-astro-cid-j7pv25f6>
          Say hi on{" "}
          <FatLink
            href="https://github.com/bytesizedshrey"
            target="_blank"
            rel="me noopener noreferrer"
            icon={<GithubIcon />}
          >
            GitHub
          </FatLink>
          ,{" "}
          <FatLink
            href="https://www.linkedin.com/in/localhostshrey/"
            target="_blank"
            rel="me noopener noreferrer"
            icon={<LinkedinIcon />}
          >
            LinkedIn
          </FatLink>
          , or{" "}
          <button
            className="inline-flex cursor-pointer bg-[#ef4444] text-white px-1"
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
                  <span className="font-semibold text-neutral-900 mr-2">{project.title}</span>
                  <span className="text-neutral-400 font-normal">{project.description}</span>
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
