import { Socials } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Links = () => {
  return (
    <div className="relative h-full p-0.5 gap-0.5 flex flex-col max-sm:flex-row max-sm:justify-center justify-between mr-auto bg-transparent">
      <ul className="flex w-max justify-center gap-0.5 items-center h-1/2">
        <li className="m-0 flex items-center justify-center p-2 max-lg:size-[3.4rem] lg:size-[3.8rem] max-sm:text-[1.7rem] lg:text-[2.2rem] max-lg:text-[1.7rem] font-bold leading-7 lg:leading-8 max-sm:hidden text-white">
          <h2>
            LIN
            <br />
            KS.
          </h2>
        </li>
        {Socials.slice(0, 2).map((item, index) => (
          <li key={item.href} className="group">
            <Link
              href={item.href}
              target="_blank"
              className="border dark:border-0 border-dark-4 rounded-2xl flex items-center justify-center p-0.5 max-lg:size-[3.4rem] lg:size-[3.8rem] max-sm:size-[3.2rem]"
            >
              <div className="border border-white/30 size-full flex items-center justify-center p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Image
                  src={item.logo}
                  alt={`${item.name} logo`}
                  width={20}
                  height={20}
                  className={`w-[80%] ${item.className}`}
                />
              </div>
            </Link>
            <div
              className={`absolute  w-16 left-0 -top-6 origin-right flex max-sm:group-hover:hidden opacity-0 translate-y-5 group-hover:translate-y-0 group-hover:opacity-100 items-center justify-center bg-white dark:bg-dark-4 dark:text-white transition-all duration-500 ease-in-out  text-black font-bold rounded-md text-sm whitespace-nowrap z-50 ${
                index === 0 ? "z-20" : "z-20"
              }`}
            >
              {item.name}
            </div>
          </li>
        ))}
      </ul>
      <ul className="flex w-max justify-center gap-0.5 items-center h-1/2">
        {Socials.slice(2, 5).map((item, index) => (
          <li key={item.href} className="group">
            <Link
              href={item.href}
              target="_blank"
              className="border dark:border-0 bg- border-dark-4 rounded-2xl flex items-center justify-center p-0.5 max-lg:size-[3.4rem] lg:size-[3.8rem] max-sm:size-[3.2rem]"
            >
              <div className="border border-white/30 size-full flex items-center justify-center p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Image
                  src={item.logo}
                  alt={`${item.name} logo`}
                  width={20}
                  height={20}
                  className={`w-[80%] ${item.className}`}
                />
              </div>
            </Link>
            <div
              className={`absolute  w-16 left-0 -top-6 origin-right flex max-sm:group-hover:hidden opacity-0 translate-y-5 group-hover:translate-y-0 group-hover:opacity-100 items-center justify-center bg-white dark:bg-dark-4 dark:text-white transition-all duration-500 ease-in-out  text-black font-bold rounded-md text-sm whitespace-nowrap z-50 ${
                index === 0 ? "z-20" : "z-20"
              }`}
            >
              {item.name}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Links;
