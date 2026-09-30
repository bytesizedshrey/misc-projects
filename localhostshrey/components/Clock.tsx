"use client";

import { useEffect, useState } from "react";

const format = () =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(new Date())
    .replace(" ", "")
    .toLowerCase();

export default function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(format());
    const id = setInterval(() => setTime(format()), 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="who__place">
      {time ? `${time} in ` : ""}Mumbai, India
    </p>
  );
}
