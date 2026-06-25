"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image, { ImageProps } from "next/image";
import { useOutsideClick } from "@/hooks/use-outside-click";
import Link from "next/link";
import { ArrowTopRightIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { FlickeringGrid } from "../magicui/flickering-grid";

interface CarouselProps {
  items: JSX.Element[];
  initialScroll?: number;
}

type Card = {
  src: string;
  title: string;
  category: string;
  link: string;
  github?: string;
  tags?: string[];
  content: React.ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => { },
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const checkScrollability = React.useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll, checkScrollability]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384; // (md:w-96)
      const gap = isMobile() ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const isMobile = () => {
    return window && window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full ">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto md:py-5 scroll-smooth [scrollbar-width:none "
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn(
              "absolute right-0  z-[1000] h-auto  w-[5%] overflow-hidden bg-gradient-to-l"
            )}
          ></div>

          <div
            className={cn(
              "flex flex-row justify-start gap-7 pl-4 my-3",
              "max-w-7xl mx-auto" // remove max-w-4xl if you want the carousel to span the full width of its container
            )}
          >
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                    once: true,
                  },
                }}
                key={"card" + index}
                className="last:pr-[5%] md:last:pr-[33%] rounded-3xl"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2  absolute -top-8 max-md:-top-10 right-3 ">
          <button
            className="relative z-0 h-10 w-10 rounded-full bg-gray-100  dark:bg-white flex items-center justify-center disabled:opacity-50 max-sm:size-10"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-6 w-6 text-gray-500 dark:text-dark-1" />
          </button>
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-gray-100 dark:bg-white dark:text-white flex items-center justify-center disabled:opacity-50 max-sm:size-10"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-6 w-6 text-gray-500 dark:text-dark-1" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: Card;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    onCardClose(index);
  }, [index, onCardClose]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  useOutsideClick(containerRef, handleClose);

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <motion.button
      layoutId={layout ? `card-${card.title}` : undefined}
      onClick={handleOpen}
      className="rounded-3xl h-[20rem] z-30 w-64 md:h-[35rem] md:w-[26rem] overflow-hidden flex flex-col items-start justify-start relative transition-all  duration-500 group p-1.5  bg-white/5 dark:bg-white/30"
    >
      <div className="size-full rounded-2xl bg-dark-1 dark:bg-white/80 relative overflow-hidden">
        <FlickeringGrid width={1000} height={2000} className="size-full absolute -z-0" />
        {/* <div className="absolute bg-[radial-gradient(circle_400px_at_center,_var(--tw-gradient-stops))] from-white -top-[40%]  to-white/0 w-full h-[110%] -z-0"></div> */}

        {/* <div className="absolute h-full top-0 inset-x-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-30 pointer-events-none" /> */}
        <Link href={card.link} target="_blank">
          <div className="relative z-10 px-8 pt-8 ">
            <motion.p
              layoutId={layout ? `category-${card.category}` : undefined}
              className="  text-sm md:text-base font-medium max-sm:font-bold font-glancyr text-left"
            >
              {card.category}
            </motion.p>
            <motion.p
              layoutId={layout ? `title-${card.title}` : undefined}
              className=" text-xl md:text-3xl font-semibold max-w-xs text-left [text-wrap:balance] font-glancyr700 mt-2 max-sm:font-bold"
            >
              {card.title}
            </motion.p>
          </div>
        </Link>
          <Link href={card.link} target="_blank">
            <BlurImage
              src={card.src}
              alt={card.title}
              fill
              className="object-cover absolute inset-0 size-full z-0"
            />
          </Link>
        <div className="z-[30] absolute bottom-7  flex w-full items-center justify-start flex-wrap gap-2 px-5 max-sm:px-3">
          {card.tags &&
            card.tags?.length > 0 &&
            card.tags.map((tag, idx) => (
              <div
                key={idx}
                className="bg-white/70 text-black flex items-center justify-center px-2 rounded-lg font-bold border border-dark-4 max-sm:text-xs "
              >
                {tag}
              </div>
            ))}
        </div>
        {card.github && (
          <Link href={card.github} target="_blank" className="z-30  absolute left-8 top-28">
            <div className="w-max px-3 py-1 rounded-full my-2 text-dark-1 bg-white font-bold border border-dark-4 text-lg flex items-center justify-center gap-1 -translate-x-28 group-hover:translate-x-0 opacity-0 scale-[0.2] group-hover:scale-100 group-hover:opacity-100 transition-all duration-500">
              <GitHubLogoIcon className="size-8" />{" "}
              <ArrowTopRightIcon className="hover:rotate-45 size-7 transition-all" />
            </div>
          </Link>
        )}
      </div>
    </motion.button>
  );
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  ...rest
}: ImageProps) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <Image
      className={cn(
        "transition duration-300",
        isLoading ? "blur-sm" : "blur-0",
        className
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      blurDataURL={typeof src === "string" ? src : undefined}
      alt={alt ? alt : "Background of a beautiful view"}
      {...rest}
    />
  );
};
