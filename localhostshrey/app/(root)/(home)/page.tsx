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

const GmailEnvelope = () => (
  <svg className="w-[1.25em] h-[1.25em] overflow-visible" viewBox="0 0 28 24" fill="none">
    <defs>
      <linearGradient id="envelope-back" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#d1d5db" />
        <stop offset="100%" stopColor="#9ca3af" />
      </linearGradient>
      <linearGradient id="envelope-front" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f3f4f6" />
        <stop offset="100%" stopColor="#e5e7eb" />
      </linearGradient>
      <linearGradient id="envelope-flap" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
      <filter id="flap-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
      </filter>
    </defs>
    <rect x="2" y="8" width="24" height="14" rx="1" fill="url(#envelope-back)" />
    <g className="transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-75 group-hover:-translate-y-2">
      <rect x="4" y="6" width="20" height="14" rx="1" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" />
      <line x1="8" y1="10" x2="20" y2="10" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="13" x2="16" y2="13" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="18" y="14" width="4" height="4" fill="#ef4444" opacity="0.8" rx="0.5" />
    </g>
    <path d="M2 8 L14 15.5 L26 8 L26 21 C26 21.5 25.5 22 25 22 L3 22 C2.5 22 2 21.5 2 21 Z" fill="url(#envelope-front)" stroke="#d1d5db" strokeWidth="0.5" />
    <g className="origin-[center_10px] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:[transform:rotateX(180deg)]">
      <path d="M2 9 L14 16 L26 9 C26 8.5 25.5 8 25 8 L3 8 C2.5 8 2 8.5 2 9 Z" fill="url(#envelope-flap)" filter="url(#flap-shadow)" stroke="#b91c1c" strokeWidth="0.5" strokeLinejoin="round" />
    </g>
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
  const emailRef = useRef<HTMLSpanElement>(null);
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
      <h3 data-astro-cid-j7pv25f6 className="text-[1.35rem] font-medium tracking-tight text-neutral-900" style={{ fontFamily: "var(--font-scholar)" }}>
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
            className="group inline-flex items-center gap-[0.35rem] cursor-pointer bg-gradient-to-b from-[#fdfbfb] to-[#ebedee] text-[#374151] font-semibold px-2 py-0.5 rounded border border-[#d1d5db] border-b-[#9ca3af] shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] active:translate-y-[1px] active:shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(0,0,0,0.1)] transition-all"
            onClick={handleEmailClick}
            onPointerEnter={() => playAudio("tick")}
            onPointerDown={() => playAudio("press")}
            data-astro-cid-j7pv25f6="true"
            data-astro-cid-rq52bn6l
          >
            <GmailEnvelope />
            <span ref={emailRef}>email</span>
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
