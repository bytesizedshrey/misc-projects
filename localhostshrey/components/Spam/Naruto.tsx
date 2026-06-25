import Image from "next/image";
import React from "react";

const Naruto = () => {
  return (
    <div className="sm:col-start-4 sm:col-end-6 sm:row-start-5 sm:row-end-8 relative flex flex-col-reverse items-center bg-transparent justify-start p-1">
      <Image
        src="/assets/naruto.jpg"
        alt="naruto"
        width={300}
        height={300}
        className=" object-cover  rounded-2xl size-[80%] max-sm:size-full"
      />
      <p className="text-wrap text-center text-sm max-sm:text-lg font-mono font-semibold max-sm:font-bold text-zinc-300 dark:text-dark-3">
        &ldquo;I&rsquo;m gonna be Hokage one day.&rdquo;
      </p>
    </div>
  );
};

export default Naruto;
