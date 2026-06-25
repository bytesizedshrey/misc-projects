"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface ImageObject {
  copyright: string;
  date: string;
  explanation: string;
  hdurl: string;
  url: string;
  media_type: string;
  title: string;
}

const Nasa = () => {
  const [image, setImage] = useState<ImageObject | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchNASA = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;
      if (!apiKey) {
        setHasError(true);
        setIsLoading(false);
        return;
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10_000); // 10s timeout
      const response = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=1`,
        { method: "GET", signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      setImage(data[0]);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.warn("NASA APOD request timed out, using fallback");
      } else {
        console.error("Error fetching NASA image:", error);
      }
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fixUrl = (url: string) => {
    if (url.startsWith("//")) {
      return `https:${url}`;
    }
    return url;
  };

  useEffect(() => {
    fetchNASA();
  }, []);

  return (
    <>
      <div className="sm:col-start-4 sm:col-end-6 sm:row-start-1 sm:row-end-4 relative border border-zinc-700/20 rounded-3xl max-sm:h-[400px]">
        {isLoading ? (
          <div className="absolute p-2 size-full rounded-3xl flex items-center justify-center">
            <p className="font-mono text-center dark:text-dark-1">Fetching from NASA...</p>
          </div>
        ) : (
          image && (
            <Image
              src={
                hasError
                  ? "/assets/orion.jpg"
                  : fixUrl(image.hdurl || image.url)
              }
              alt={image.title || "NASA Image"}
              width={1024}
              height={1024}
              unoptimized={!hasError}
              onLoad={() => setIsLoading(false)}
              onError={() => setHasError(true)}
              className="object-cover size-full rounded-3xl"
            />
          )
        )}
      </div>

      <div className="sm:col-start-4 sm:col-end-6 sm:row-start-4 sm:row-end-5">
        {image && (
          <div className="p-0 flex flex-col justify-start h-full px-1 items-end overflow-hidden">
            <p className="font-mono text-xs line-clamp-1 text-zinc-200 dark:text-dark-4">
              <span className="text-zinc-500 dark:text-zinc-600">
                from NASA:
              </span>{" "}
              {hasError ? "2006-08-15" : image.date}
            </p>
            <p className="font-mono text-[0.6rem] text-end line-clamp-1 text-wrap text-zinc-300 dark:text-dark-4">
              {hasError
                ? "The Sword of Orion"
                : image.copyright && image.copyright}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Nasa;
