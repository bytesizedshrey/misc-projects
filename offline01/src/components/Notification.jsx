import React, { useState } from "react";

function Notification() {
  const [notification, setnotification] = useState(0);

  function incrementNotification() {
    setnotification(notification + 1);
  }

  return (
    <div>
      <button className="h-10 w-19 bg-pink-500 rounded-2xl"
        onClick={() => {
          incrementNotification();
        }}
      >
        Smash Me
      </button>

      <h1>{notification}</h1>
    </div>
  );
}

export default Notification;
