import Image from "next/image";
import Clock from "@/components/Clock";
import OffScreen from "@/components/OffScreen";
import { availableForWork, currentlyLearning } from "@/constants";

const EMAIL = "thisisitshrey@gmail.com";

const ELSEWHERE = [
  { label: "GitHub", href: "https://github.com/bytesizedshrey" },
  { label: "X", href: "https://x.com/bytesizedshrey" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/localhostshrey/" },
  { label: "Discord", href: "https://discord.com/users/bytesizedshrey" },
  { label: EMAIL, href: `mailto:${EMAIL}`, internal: true },
];

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const delay = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default function Home() {
  return (
    <>
      <header className="who enter">
        <Image
          className="who__photo"
          src="/assets/pfp-new.jpg"
          alt="Shrey"
          width={80}
          height={80}
          priority
        />
        <div>
          <h1 className="who__name">Shreyash Gajbhiye</h1>
          <Clock />
        </div>
      </header>

      <div className="prose">
        <p className="enter" style={delay(1)}>
          <strong>Hey, I&apos;m Shrey.</strong> I&apos;m a{" "}
          <span className="mark">design engineer</span> building interfaces and
          full-stack products. I care about the details, from pixels to
          architecture. Since Aug 2026 I&apos;ve been a design engineer at{" "}
          <strong>VoltLink</strong>.
        </p>
        <p className="enter" style={delay(2)}>
          I made{" "}
          <a href="https://velora-one-rouge.vercel.app" {...ext}>
            Velora
          </a>
          , a fashion e-commerce, and{" "}
          <a href="https://usual-ui.vercel.app/" {...ext}>
            usual-ui
          </a>
          , a UI component library. Right now I&apos;m learning{" "}
          {currentlyLearning.join(" and ")}.
          {availableForWork && " I'm available for work."}
        </p>
      </div>

      <div className="enter" style={delay(3)}>
        <OffScreen />
      </div>

      <nav className="enter" style={delay(4)} aria-label="Elsewhere">
        <ul className="links">
          {ELSEWHERE.map((l) => (
            <li key={l.label}>
              <a href={l.href} {...(l.internal ? {} : ext)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
