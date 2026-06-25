import React from "react";
import Tools from "../Tools";
import Tooltext from "./Tool-text";
import Nasa from "./Nasa";
import Track from "./Track";
import Wavs from "./Wavs";
import Naruto from "./Naruto";

const Spam = () => {
  return (
    <div className=" h-full grid grid-cols-1 sm:grid-cols-5 sm:grid-rows-7 max-sm:py-2 max-sm:gap-2 !shadow-none">
      <div className="row-start-2 row-end-3 sm:col-start-1 sm:col-end-2 sm:row-start-1 sm:row-end-8 ">
        <Tools />
      </div>
      <div className=" sm:col-start-2 sm:col-end-4  sm:row-start-1 sm:row-end-3">
        <Tooltext />
      </div>
      <Nasa />
      <Wavs/>
      <Track />
      <Naruto/>
    </div>
  );
};

export default Spam;
