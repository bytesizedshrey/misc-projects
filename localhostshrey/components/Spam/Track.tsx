import Image from "next/image";
import Link from "next/link";

const Track = () => {
  const href = "https://open.spotify.com/track/4yJZP61jBhVTesHBZ0gpQn"
  return (
    <>
      <div className=" sm:col-start-2 sm:col-end-4  sm:row-start-4 sm:row-end-7 border-dark-3 dark:border-dark-5 rounded-3xl bg-transparent group relative">
        <Image
          src={`/assets/fox.png`}
          alt="track"
          width={1024}
          height={1024}
          className="aspect-square size-full object-cover rounded-3xl"
        />
        <Link href={href} className="border border-dark-5/10 absolute size-10 bottom-3 right-3 translate-y-7 scale-50 opacity-0 group-hover:translate-y-0 group-hover:scale-100 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all rounded-full flex items-center justify-center duration-300 max-sm:group-hover:scale-150 max-sm:bottom-7 max-sm:right-7 max-sm:translate-y-12 p-px bg-zinc-800/30 backdrop-blur-2xl backdrop-saturate-200">
          <div className="border p-2.5 rounded-full border-dark-5/30">

            <Image
              src={`/icons/play.svg`}
              alt="play"
              width={30}
              height={30}
              className="size-full aspect-square invert"
            />
          </div>
        </Link>
      </div >

      <div className=" sm:col-start-2 sm:col-end-4 sm:row-start-7 sm:row-end-8 p-1">
        <Link href={href} className="font-bold text-lg font-glancyr leading-6 text-white dark:text-dark-4">Fox on the Run</Link>
        <div className="flex justify-between text-xs text-zinc-500 pointer-events-none">
          <p>By: Sweet</p>
          <p className="font-mono">2016</p>
        </div>
      </div>
    </>
  );
};

export default Track;
