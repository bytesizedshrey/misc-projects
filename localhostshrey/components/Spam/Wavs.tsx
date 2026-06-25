import Image from "next/image";
import React from "react";
const Wavs = () => {
  return (
    <div className="row-start-7 sm:col-start-2 sm:col-end-4  sm:row-start-3 sm:row-end-4 relative max-sm:hidden">
      <Image
        src="/assets/waves.svg"
        alt="waves"
        width={300}
        height={300}
        className="-inset-0 opacity-90  object-cover  rounded-2xl size-[90%] "
      />
    </div>
  );
};

export default Wavs;
