import Image from "next/image";
import React from "react";
import MorphingText from "./morphing-text";
import Time from "./Time";
import { availableForWork } from "@/constants";
import ThemeToggler from "../theme/theme-toggler";

const Profile = () => {
  const texts = ["WebApps", "Backends", "APIs"];

  return (
    <div className="flex flex-col overflow-hidden size-full relative z-10 p-5 items-start justify-start gap-8 max-sm:h-[275px] max-sm:gap-4 text-white rounded-xl">
      <div className="w-full flex justify-between items-start">
        <div className="flex gap-3">
          <Image
            src={`/assets/pfp-new.jpg`}
            alt="profile"
            width={1024}
            height={1024}
            className="size-16 rounded-3xl opacity-90 dark:opacity-100 [box-shadow:2px_2px_85px_0px_#ffffff]/90 dark:[box-shadow:0px_0px_65px_45px_#ffffff40]"
          />
          <div className="">
            <p className="font-bold text-lg">Shrey.</p>
            <p className="text-md font-mono text-white/60">@bytesizedshrey</p>
          </div>
        </div>
        <ThemeToggler />
      </div>
      <div className="flex flex-col gap-1 overflow-hidden ">
        <div className="font-bold  w-full  flex items-center justify-start gap-1">
          <p className="inline text-lg">I build </p>
          {"   "}
          <div className="min-w-[5.5rem]">
            <MorphingText texts={texts} />
          </div>
          <p>.</p>
        </div>
        <div className="w-full">
          <p className="text-sm">
            Hey, I&apos;m Shrey! a full stack dev based in India — cooked 24/7.
          </p>
        </div>
      </div>
      <div className="absolute bottom-5 right-5 b">
        <div className="font-mono flex justify-end items-center gap-1 text-sm text-white/60">
          <div
            className={`size-1.5 rounded-full ${
              availableForWork ? "bg-green" : "bg-red"
            } `}
          ></div>
          <p className="text-xs">Available for work</p>
        </div>
        <Time />
      </div>
      <div className="absolute bottom-5 left-5 max-sm:hidden">
        <div className="w-full">
          <p className="text-xs font-mono text-white/60">
            &ldquo;npm install && pray&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
