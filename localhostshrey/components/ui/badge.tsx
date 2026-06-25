import React, { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ children }) => {
  return (
    <div className="p-px text-xs dark:text-black font-normal border dark:border-dark-5/60 border-zinc-800 line-clamp-1 overflow-hidden w-max rounded-lg size-max hover:border-white/50 dark:hover:border-dark-4/50 transition-all hover:text-white bg-neutral-800/30 dark:bg-transparent backdrop-blur-xl backdrop-saturate-200">
      <p className="px-2 rounded-md border dark:border-dark-2/65 border-zinc-800 mx-auto">{children}</p>
    </div>
  );
};

export default Badge;
