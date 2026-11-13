import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash2, X } from "lucide-react";

/** Thumbnail for an existing saved URL or a newly typed URL. */
export function ImageThumb({
  src,
  alt,
  onRemove,
  removeAriaLabel,
  pending,
}: {
  src: string;
  alt: string;
  onRemove: () => void;
  removeAriaLabel: string;
  pending?: boolean;
}) {
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);
  const errored = erroredSrc === src;

  return (
    <div className="relative">
      <div className="relative h-24 w-28 overflow-hidden rounded-lg border border-line bg-canvas">
        {errored ? (
          <div className="grid size-full place-items-center gap-1.5 bg-band/20 px-2 text-center">
            <ImagePlus aria-hidden="true" className="size-4 text-muted-foreground" />
            <p className="text-[10px] font-medium leading-tight text-muted-foreground">
              Couldn&apos;t load image — is the URL valid?
            </p>
          </div>
        ) : (
          <div className="relative size-full">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="112px"
              unoptimized
              className="object-contain"
              onError={() => setErroredSrc(src)}
            />
          </div>
        )}
        {pending && (
          <span className="absolute bottom-1 left-1 rounded-sm bg-primary/80 px-1 py-0.5 text-[10px] font-semibold text-primary-foreground">
            New URL
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeAriaLabel}
        className="absolute right-1 top-1 grid size-11 place-items-center rounded-full bg-ink/70 text-white hover:bg-ink"
      >
        <Trash2 aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  );
}

/** Thumbnail for a newly selected local file — creates and revokes a blob URL. */
export function NewFileThumbnail({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!file.type.startsWith("image/")) return;
    const objectUrl = URL.createObjectURL(file);
    const el = imageRef.current;
    el?.setAttribute("src", objectUrl);
    return () => {
      if (el?.getAttribute("src") === objectUrl) el.removeAttribute("src");
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <div className="relative">
      <div className="relative h-24 w-28 overflow-hidden rounded-lg border border-primary bg-canvas">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imageRef} alt="" className="size-full object-contain" />
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove this image"
        className="absolute right-1 top-1 grid size-11 place-items-center rounded-full bg-ink/70 text-white hover:bg-ink"
      >
        <X aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  );
}

