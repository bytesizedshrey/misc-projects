import Clock from "@/components/Clock";
import InlineImage from "@/components/InlineImage";
import ContactCTA from "@/components/ContactCTA";
import OffScreen from "@/components/OffScreen";
import PreviewLink from "@/components/PreviewLink";
import ProfilePhoto from "@/components/ProfilePhoto";
import ThemeToggle from "@/components/ThemeToggle";

const delay = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default function Home() {
  return (
    <>
      <header className="who enter">
        <ProfilePhoto />
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
            <PreviewLink
              href="https://velora-one-rouge.vercel.app"
              src="/assets/preview-velora.jpg"
            >
              Velora
            </PreviewLink>{" "}
            and{" "}
            <PreviewLink
              href="https://usual-ui.vercel.app/"
              src="/assets/preview-usual-ui.jpg"
            >
              usual-ui
            </PreviewLink>
            .
          </p>
          <p className="enter" style={delay(3)}>
            Most days you&apos;ll find me writing{" "}
            <span className="nowrap">
              code{" "}
              <InlineImage
                src="/assets/inline-code.jpg"
                label="Margaret Hamilton next to the Apollo guidance software printouts"
                position="50% 22%"
                width={700}
                height={871}
              />
            </span>
            , designing{" "}
            <span className="nowrap">
              things{" "}
              <InlineImage
                src="/assets/inline-design.jpg"
                label="Goethe's 1809 hand-painted colour wheel"
                position="50% 50%"
                width={600}
                height={913}
              />
            </span>
            , or fixing something that was perfectly fine five minutes{" "}
            <span className="nowrap">
              ago{" "}
              <InlineImage
                src="/assets/inline-bug.jpg"
                label="The first computer bug: a moth taped into a 1947 logbook"
                position="18% 62%"
                width={900}
                height={712}
              />
              .
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
