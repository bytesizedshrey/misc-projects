import Image from "next/image";
import Clock from "@/components/Clock";
import Kitten from "@/components/Kitten";
import ContactCTA from "@/components/ContactCTA";
import OffScreen from "@/components/OffScreen";
import ThemeToggle from "@/components/ThemeToggle";

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
        <div className="who__text">
          <h1 className="who__name">Shreyash Gajbhiye</h1>
          <Clock />
        </div>
        <ThemeToggle />
      </header>

      <div className="mid">
        <div className="prose">
          <p className="enter" style={delay(1)}>
            <strong>I&apos;m Shrey.</strong> I&apos;m a{" "}
            <span className="mark">Design Engineer</span>. I make interfaces,
            write code, and spend an unreasonable amount of time making small
            things feel right.
          </p>
          <p className="enter" style={delay(2)}>
            Currently at <strong>VoltLink</strong>. I&apos;ve also built{" "}
            <a href="https://velora-one-rouge.vercel.app" {...ext}>
              Velora
            </a>{" "}
            and{" "}
            <a href="https://usual-ui.vercel.app/" {...ext}>
              usual-ui
            </a>
            .
          </p>
          <p className="enter" style={delay(3)}>
            I like good design, smooth interactions, computers, and{" "}
            <span className="nowrap">
              cats <Kitten />.
            </span>
          </p>
          <p className="enter" style={delay(4)}>
            <strong>Open to work. ~ probably at my desk...</strong>
          </p>
        </div>
        <div className="enter" style={delay(5)}>
          <ContactCTA />
        </div>
      </div>

      <div className="base enter" style={delay(4)}>
        <OffScreen />
      </div>
    </>
  );
}
