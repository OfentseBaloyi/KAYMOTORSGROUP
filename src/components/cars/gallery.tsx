"use client";

import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface GalleryImage {
  src: string;
  alt: string;
}

/**
 * Swipeable photo gallery. Uses native CSS scroll-snap for swiping (no JS
 * gesture library), thumbnails to jump, and a <dialog> for full screen.
 */
export function Gallery({ images, dimmed = false }: { images: GalleryImage[]; dimmed?: boolean }) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const fullTrackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const count = images.length;

  const scrollTo = useCallback((track: HTMLDivElement | null, i: number, smooth = true) => {
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: smooth ? "smooth" : "instant" });
  }, []);

  const go = (i: number) => {
    const next = (i + count) % count;
    setIndex(next);
    scrollTo(trackRef.current, next);
    scrollTo(fullTrackRef.current, next);
  };

  // Keep the index in sync when the user swipes.
  const onScroll = (track: HTMLDivElement) => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== index && i >= 0 && i < count) setIndex(i);
  };

  const openFullscreen = () => {
    dialogRef.current?.showModal();
    // Wait a frame so the dialog has a width before scrolling.
    requestAnimationFrame(() => scrollTo(fullTrackRef.current, index, false));
  };

  const closeFullscreen = () => {
    dialogRef.current?.close();
    scrollTo(trackRef.current, index, false);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (!dialog.open) return;
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (count === 0) return null;

  return (
    <div>
      <div className="relative overflow-hidden rounded-card bg-sand">
        <div
          ref={trackRef}
          onScroll={(e) => onScroll(e.currentTarget)}
          className="flex aspect-3/2 snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carousel"
          aria-label="Car photos"
        >
          {images.map((img, i) => (
            <div
              key={img.src + i}
              className="relative w-full shrink-0 snap-center"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
            >
              <button
                type="button"
                onClick={openFullscreen}
                className="absolute inset-0 cursor-zoom-in"
                aria-label={`View photo ${i + 1} full screen`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className={cn("object-cover", dimmed && "grayscale")}
                  priority={i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                />
              </button>
            </div>
          ))}
        </div>

        {count > 1 && (
          <>
            <GalleryArrow direction="prev" onClick={() => go(index - 1)} className="left-2 inline-flex" />
            <GalleryArrow direction="next" onClick={() => go(index + 1)} className="right-2 inline-flex" />
          </>
        )}
        <div className="pointer-events-none absolute right-2 bottom-2 flex items-center gap-2">
          <span className="rounded-sm bg-navy-950/80 px-2 py-1 text-sm font-semibold text-white">
            {index + 1} / {count}
          </span>
        </div>
        <button
          type="button"
          onClick={openFullscreen}
          className="absolute top-2 right-2 inline-flex size-11 items-center justify-center rounded-card bg-white/90 text-navy-950 hover:bg-white"
          aria-label="Full screen"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      {count > 1 && (
        <ul className="mt-2 flex gap-2 overflow-x-auto pb-1" aria-label="Choose photo">
          {images.map((img, i) => (
            <li key={img.src + i} className="shrink-0">
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "relative block h-14 w-20 overflow-hidden rounded-sm border-2 md:h-16 md:w-24",
                  i === index ? "border-orange-500" : "border-transparent opacity-80 hover:opacity-100",
                )}
              >
                <Image src={img.src} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        onClose={closeFullscreen}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-navy-950 p-0 text-white backdrop:bg-navy-950"
        aria-label="Photos, full screen"
      >
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="font-semibold">
              {index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={closeFullscreen}
              className="inline-flex size-11 items-center justify-center rounded-card hover:bg-white/10"
              aria-label="Close full screen"
            >
              <X size={26} />
            </button>
          </div>
          <div
            ref={fullTrackRef}
            onScroll={(e) => onScroll(e.currentTarget)}
            className="flex flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((img, i) => (
              <div key={img.src + i} className="relative w-full shrink-0 snap-center">
                <Image src={img.src} alt={img.alt} fill sizes="100vw" className="object-contain" loading="lazy" />
              </div>
            ))}
          </div>
          {count > 1 && (
            <>
              <GalleryArrow direction="prev" onClick={() => go(index - 1)} className="left-3 hidden md:inline-flex" />
              <GalleryArrow direction="next" onClick={() => go(index + 1)} className="right-3 hidden md:inline-flex" />
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}

function GalleryArrow({
  direction,
  onClick,
  className,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  className?: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-950 hover:bg-white",
        className,
      )}
    >
      <Icon size={24} />
    </button>
  );
}
