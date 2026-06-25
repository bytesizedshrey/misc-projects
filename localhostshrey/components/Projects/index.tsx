import { Cog } from "lucide-react";
import React from "react";
import Ripple from "../magicui/ripple";

const Projects = () => {
  return (
    <div className="flex flex-col justify-start items-start relative group w-full h-full p-2 max-sm:p-5 max-sm:bg-transparent rounded-lg max-sm:h-[350px] overflow-hidden dark:bg-blue-500/70">
      <Ripple />
      <Cog className="size-12 max-sm:size-20 lg:size-14 my-2 animate-spin-slow text-dark-4 stroke-[2.5]" />
      <h2 className="sm:text-[1.9rem] max-sm:text-6xl overflow-hidden lg:text-[2.2rem] leading-7 lg:leading-10 font-bold w-full text-wrap font-glancyr700 text-dark-4 z-20">
        PROJECT
        <br />
        SSS
      </h2>
      <div className="flex flex-col absolute bottom-4 right-4 text-xl leading-snug">
      <p className="text-black font-extrabold">工</p>
      <p className="text-black font-extrabold">芸</p>
      </div>
    </div>
  );
};

export default Projects;
