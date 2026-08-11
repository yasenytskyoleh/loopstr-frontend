"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

/** Read-only photo gallery for the tool-details view: a large cover with
 *  prev/next controls, a thumbnail strip, and a position counter. */
export function ToolGallery({
  photos,
  name,
}: {
  photos: string[];
  name: string;
}) {
  const [index, setIndex] = useState(0);
  const count = photos.length;
  const step = (delta: number) =>
    setIndex((current) => (current + delta + count) % count);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-canvas">
        <Image
          src={photos[index]}
          alt={`${name} — photo ${index + 1} of ${count}`}
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
          priority
        />
        {count > 1 && (
          <>
            <GalleryButton position="left" onClick={() => step(-1)} label="Previous photo">
              <ChevronLeftIcon className="size-5" />
            </GalleryButton>
            <GalleryButton position="right" onClick={() => step(1)} label="Next photo">
              <ChevronRightIcon className="size-5" />
            </GalleryButton>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            {photos.map((photo, thumbIndex) => (
              <button
                key={photo}
                type="button"
                onClick={() => setIndex(thumbIndex)}
                aria-label={`Show photo ${thumbIndex + 1}`}
                aria-current={thumbIndex === index}
                className={cn(
                  "relative size-16 overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                  thumbIndex === index ? "border-brand-solid" : "border-transparent",
                )}
              >
                <Image src={photo} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
          <span className="shrink-0 text-sm text-content-secondary">
            {index + 1} of {count}
          </span>
        </div>
      )}
    </div>
  );
}

function GalleryButton({
  position,
  onClick,
  label,
  children,
}: {
  position: "left" | "right";
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-content-primary shadow-card transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        position === "left" ? "left-3" : "right-3",
      )}
    >
      {children}
    </button>
  );
}
