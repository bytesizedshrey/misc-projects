import Image from "next/image";
import Clock from "@/components/Clock";
import OffScreen from "@/components/OffScreen";
import { availableForWork, backEnd, currentlyLearning, frontEnd, services } from "@/constants";

const EMAIL = "thisisitshrey@gmail.com";

const ELSEWHERE = [
  { k: "g", label: "github.com/bytesizedshrey", href: "https://github.com/bytesizedshrey" },
  { k: "x", label: "x.com/bytesizedshrey", href: "https://x.com/bytesizedshrey" },
  { k: "l", label: "linkedin.com/in/localhostshrey", href: "https://www.linkedin.com/in/localhostshrey/" },
  { k: "d", label: "discord: bytesizedshrey", href: "https://discord.com/users/bytesizedshrey" },
  { k: "e", label: EMAIL, href: `mailto:${EMAIL}` },
];

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function Home() {
  return (
    <>
      <header className="who enter">
        <Image
          className="who__photo"
          src="/assets/pfp-new.jpg"
          alt="Shrey"
          width={128}
          height={128}
          priority
        />
        <h1 className="who__name">Shreyash Gajbhiye</h1>
        <Clock />
      </header>

      <div className="prose">
        <p className="enter" style={{ "--i": 1 } as React.CSSProperties}>
          <strong>Hey, I&apos;m Shrey.</strong> I&apos;m a{" "}
          <span className="mark">design engineer</span> building interfaces and
          full-stack products. I care about the details, from pixels to
          architecture.
        </p>
        <p className="enter" style={{ "--i": 2 } as React.CSSProperties}>
          Since Aug 2026 I&apos;ve been a design engineer at{" "}
          <strong>VoltLink</strong>.
        </p>
        <p className="enter" style={{ "--i": 3 } as React.CSSProperties}>
          I made{" "}
          <a href="https://velora-one-rouge.vercel.app" {...ext}>
            Velora
          </a>
          , a fashion e-commerce, and{" "}
          <a href="https://usual-ui.vercel.app/" {...ext}>
            usual-ui
          </a>
          , a UI component library.
        </p>
        <p className="enter" style={{ "--i": 4 } as React.CSSProperties}>
          Right now I&apos;m learning {currentlyLearning.join(" and ")}.
          {availableForWork && " I'm available for work."}
        </p>
      </div>

      <OffScreen />

      <section className="section" aria-labelledby="elsewhere">
        <h2 id="elsewhere" className="section__label">
          If you want to talk
        </h2>
        <div className="links">
          <dl>
            {ELSEWHERE.map((l) => (
              <div key={l.k} style={{ display: "contents" }}>
                <dt>{l.k}:</dt>
                <dd>
                  <a href={l.href} {...(l.k === "e" ? {} : ext)}>
                    {l.label}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section" aria-labelledby="tools">
        <h2 id="tools" className="section__label">
          Tools
        </h2>
        <p className="small" style={{ margin: 0 }}>
          {[...frontEnd, ...backEnd, ...services].join(", ")}.
        </p>
      </section>
    </>
  );
}
