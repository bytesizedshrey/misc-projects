"use client";

import { useRef } from "react";

const EMAIL = "thisisitshrey@gmail.com";

const CONTACTS = [
  { name: "GitHub", handle: "bytesizedshrey", href: "https://github.com/bytesizedshrey" },
  { name: "X", handle: "@bytesizedshrey", href: "https://x.com/bytesizedshrey" },
  { name: "LinkedIn", handle: "in/localhostshrey", href: "https://www.linkedin.com/in/localhostshrey/" },
  { name: "Discord", handle: "bytesizedshrey", href: "https://discord.com/users/bytesizedshrey" },
  { name: "Email", handle: EMAIL, href: `mailto:${EMAIL}`, mail: true },
];

export default function ContactCTA() {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <p className="cta">
        got something in mind?
        <br />
        <button
          type="button"
          className="cta__btn"
          aria-haspopup="dialog"
          onClick={() => ref.current?.showModal()}
        >
          work with me
        </button>
      </p>

      <dialog
        ref={ref}
        className="card"
        aria-labelledby="card-title"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="card__head">
          <h2 id="card-title">Shreyash Gajbhiye</h2>
          <button
            type="button"
            className="card__close"
            onClick={() => ref.current?.close()}
            aria-label="Close contact card"
          >
            esc
          </button>
        </div>
        <ul className="card__list">
          {CONTACTS.map((c) => (
            <li key={c.name}>
              <a
                href={c.href}
                {...(c.mail ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              >
                <span className="card__name">{c.name}</span>
                <span className="card__handle">{c.handle}</span>
                <span className="card__arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
