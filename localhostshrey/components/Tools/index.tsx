import Image from "next/image";
import React from "react";

const tools = [
  {
    title: "VS Code",
    className: "p-2.5",
    href: "/icons/vscode.png",
  },
  {
    title: "v0.dev",
    className: " p-1.5  ",
    href: "/icons/v0.svg",
  },
  {
    title: "Dia",
    className: "p-2",
    href: "/icons/dia.svg",
  },
  {
   title: "Motion",
   className: "p-2",
   href: "/icons/motion.svg",
 },
  {
    title: "Figma",
    className: "p-2",
    href: "/icons/figma_logo.svg",
  },
  {
    title: "T3Chat",
    className: "p-[5px] opacity-80",
    href: "/icons/t3.svg",
  },
];

const Tools = () => {
  return (
    <div className="h-full p-px border w-max mx-auto rounded-3xl border-dark-4 dark:border-dark-5/40 bg-transparent">
      <div className="relative w-max border dark:border-dark-5/60 border-dark-3 rounded-3xl flex flex-col items-center justify-center h-full gap-2.5 max-sm:px-3 px-2 py-2 mx-auto max-sm:flex-row flex-wrap max-sm:w-full dark:bg-white bg-zinc-800/10 dark:bg-white/10 backdrop-blur-2xl">
        {tools.map((item) => (
          <div
            key={item.title}
            className={` bg-white dark:bg-white aspect-square w-[3rem] max-sm:max-w-[2.75rem] p-0 rounded-2xl hover:scale-125 transition-all shadow-custom-all duration-300 ease-in-out hover:shadow-white/40 dark:hover:shadow-dark-1/20 opacity-90 `}
          >
            <Image
              src={item.href}
              alt="tools"
              width={20}
              height={20}
              className={` w-full aspect-square ${item.className} `}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tools;
