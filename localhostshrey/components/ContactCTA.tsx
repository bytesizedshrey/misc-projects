"use client";

import { useEffect, useState } from "react";

const EMAIL = "thisisitshrey@gmail.com";

const CONTACTS = [
  { name: "GitHub", handle: "bytesizedshrey", href: "https://github.com/bytesizedshrey" },
  { name: "X", handle: "@bytesizedshrey", href: "https://x.com/bytesizedshrey" },
  { name: "LinkedIn", handle: "in/localhostshrey", href: "https://www.linkedin.com/in/localhostshrey/" },
  { name: "Discord", handle: "bytesizedshrey", href: "https://discord.com/users/bytesizedshrey" },
  { name: "Email", handle: EMAIL, href: `mailto:${EMAIL}`, mail: true },
];

export default function ContactCTA() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="cta">
      <p className="cta__line">
        got something in mind?
        <br />
        <button
          type="button"
          className="cta__btn"
          aria-expanded={open}
          aria-controls="contact"
          onClick={() => setOpen((o) => !o)}
        >
          work with me
        </button>
      </p>

      <div id="contact" className="contact" data-open={open}>
        <ul className="contact__list">
          {CONTACTS.map((c) => (
            <li key={c.name}>
              <a
                href={c.href}
                {...(c.mail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              >
                <span className="contact__name">{c.name}</span>
                <span className="contact__handle">{c.handle}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
