"use client";
import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import { Button } from "@/components/ui/button";
import { useRouter, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ProjectDisplay() {
  notFound();
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  const router = useRouter();

  const navigate = () => {
    router.push("/");
  };

  return (
    <div className="w-full  relative z-50 ">
      <Button
        onClick={() => navigate()}
        className="mx-3 bg-white dark:bg-white hover:bg-white/70"
      >
        <ArrowLeft className="text-zinc-700 dark:text-dark-1 " />
      </Button>
      <Carousel items={cards} />
    </div>
  );
}

const data = [
  {
    category: "Real-time Communication App",
    title: "Snitch",
    src: "/assets/project1.png",
    link: "https://snitch-two.vercel.app",
    github: "https://github.com/bytesizedshrey/snitch",
    tags: ["Nextjs", "Tailwindcss", "Shadcn", "MongoDB", "Socket.io"],
    content: <></>,
  },
  {
    category: "Interactive Battle Game",
    title: "Battle Arena",
    src: "/assets/project2.png",
    link: "https://github.com/bytesizedshrey/battle-arena",
    github: "https://github.com/bytesizedshrey/battle-arena",
    tags: ["JavaScript", "HTML5", "CSS3", "Canvas API"],
    content: <></>,
  },
  {
    category: "State Management Playground",
    title: "Redux Toolkit",
    src: "/assets/griddyy.png",
    link: "https://github.com/bytesizedshrey/redux",
    github: "https://github.com/bytesizedshrey/redux",
    tags: ["React", "Redux Toolkit", "JavaScript", "Vite"],
    content: <></>,
  },
  {
    category: "UI Component Exploration",
    title: "ShadCN Basics",
    src: "/assets/nxttp.webp",
    link: "https://github.com/bytesizedshrey/shadCN-basics",
    github: "https://github.com/bytesizedshrey/shadCN-basics",
    tags: ["Nextjs", "TypeScript", "Tailwindcss", "Shadcn"],
    content: <></>,
  },
  {
    category: "OAuth Integration",
    title: "Google OAuth",
    src: "/assets/socialzz.png",
    link: "https://github.com/bytesizedshrey/google-oauth",
    github: "https://github.com/bytesizedshrey/google-oauth",
    tags: ["Nodejs", "Expressjs", "Passport.js", "OAuth2"],
    content: <></>,
  },
  {
    category: "Containerized App Setup",
    title: "Docker",
    src: "/assets/chart.png",
    link: "https://github.com/bytesizedshrey/docker",
    github: "https://github.com/bytesizedshrey/docker",
    tags: ["Docker", "Nodejs", "JavaScript", "DevOps"],
    content: <></>,
  },
  {
    category: "Express Backend Fundamentals",
    title: "Basics Backend",
    src: "/assets/show.png",
    link: "https://github.com/bytesizedshrey/basicsBackend",
    github: "https://github.com/bytesizedshrey/basicsBackend",
    tags: ["Nodejs", "Expressjs", "MongoDB", "REST API"],
    content: <></>,
  },
  {
    category: "Tailwind UI Experiments",
    title: "Tailwind",
    src: "/assets/template.png",
    link: "https://github.com/bytesizedshrey/tailwind",
    github: "https://github.com/bytesizedshrey/tailwind",
    tags: ["Tailwindcss", "HTML", "CSS", "JavaScript"],
    content: <></>,
  },
];
