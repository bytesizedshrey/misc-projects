"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const EMAIL = "thisisitshrey@gmail.com";

const CONTACTS = [
  { name: "GitHub", handle: "bytesizedshrey", href: "https://github.com/bytesizedshrey" },
  { name: "X", handle: "@bytesizedshrey", href: "https://x.com/bytesizedshrey" },
  { name: "LinkedIn", handle: "in/localhostshrey", href: "https://www.linkedin.com/in/localhostshrey/" },
  { name: "Discord", handle: "bytesizedshrey", href: "https://discord.com/users/bytesizedshrey" },
  { name: "Email", handle: EMAIL, href: `mailto:${EMAIL}`, mail: true },
];

const clock = () =>
  new Date()
    .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    .replace(/\s/g, "")
    .toLowerCase();

export default function ContactCTA() {
  const [open, setOpen] = useState(false);
  const [sentAt, setSentAt] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = () => {
    if (!open) setSentAt(clock());
    setOpen((o) => !o);
  };

  return (
    <div className="thread" data-state={open ? "open" : "closed"}>
      <div className="thread__msgs">
        <div className="msg msg--in">
          <Image
            className="msg__avatar"
            src="/assets/pfp-new.jpg"
            alt=""
            width={56}
            height={56}
          />
          <p className="bubble">got something in mind?</p>
        </div>
        <div className="msg msg--out">
          <button
            type="button"
            className="bubble bubble--out"
            aria-expanded={open}
            aria-controls="contact"
            onClick={toggle}
          >
            work with me
          </button>
          <span className="msg__sent" aria-hidden={!open}>
            sent {sentAt}
          </span>
        </div>
      </div>

      <div id="contact" className="replies">
        <ul className="replies__list">
          {CONTACTS.map((c, i) => (
            <li key={c.name} style={{ "--i": i } as React.CSSProperties}>
              <a
                className="bubble bubble--link"
                href={c.href}
                {...(c.mail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              >
                <span className="bubble__name">{c.name}</span>
                <span className="bubble__handle">{c.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
