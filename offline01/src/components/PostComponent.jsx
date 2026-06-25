import React from "react";
import ToggleMessage from "./ToggleMessage";

const PostComponent = ({name, subtitle, time, image, description}) => {
  
  return (
    <div className="flex justify-center p-2">
      <div className="overflow-hidden bg-amber-700 w-80 h-39 rounded-2xl">
        <div className="flex gap-2 p-3">
          <img
            className="w-20 h-20 rounded-3xl bg-cover"
            src="https://images.unsplash.com/photo-1527736947477-2790e28f3443?q=80&w=1524&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt=""
          />
          <div className="flex-col">
            <b>{name}</b>

          {/* time */}
            <div>{subtitle}</div>
            { time != undefined && 
            <div className="flex w-5 h-5 text-s text-nowrap">
              <img src="https://images.unsplash.com/photo-1633421878925-ac220d8f6e4f?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29ybGQlMjBwbmd8ZW58MHx8MHx8fDA%3D" alt="" />
              {time}</div> }

          </div>
        </div>

        <div className="px-2">
          {description}
        </div>
      </div>
    </div>
  );
};


export default PostComponent;
