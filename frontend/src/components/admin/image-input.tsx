"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Link2, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ImagePickerValue {
  existingUrls: string[];
  /** New image URLs entered by the admin (no file). */
  newUrls: string[];
  newFiles: File[];
  removedUrls: string[];
}

const MAX_IMAGE_URL_LENGTH = 2000;

/** A URL pointing at an image, or an empty string when the input is empty. */
export function formatImageUrl(value: string): string {
  return value.trim();
}

/** Validates a user-supplied image URL. Returns an error message or null. */
export function validateImageUrl(value: string): string | null {
  const url = formatImageUrl(value);
  if (!url) return null;
  if (url.length > MAX_IMAGE_URL_LENGTH)
    return `URL must be at most ${MAX_IMAGE_URL_LENGTH} characters`;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "Image URL must start with http:// or https://";
    }
    if (!parsed.hostname) return "Image URL must be a valid web address";
    if (/\.(?:jpe?g|png|gif|webp|avif|bmp)$/i.test(parsed.pathname)) {
      return null;
    }
    // No file extension — only reject clearly non-image hosts.
    const host = parsed.hostname.toLowerCase();
    if (
      host === "example.com" ||
      host.endsWith(".example.com") ||
      host.endsWith(".test")
    ) {
      return "Image URL must point to an image host";
    }
    return null;
  } catch {
    return "Enter a valid image URL (e.g. https://…/photo.jpg)";
  }
}

/**
 * Image thumbnail shared by uploaded-file and URL-based images.
 */
function ImageThumb({
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
            <ImagePlus
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
            <p className="text-[10px] font-medium leading-tight text-muted-foreground">
              Couldn’t load image — is the URL valid?
            </p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setErroredSrc(src)}
            className="size-full object-cover"
          />
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
        className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/70 text-white hover:bg-ink"
      >
        <Trash2 aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  );
}

function FilePreview({ file }: { file: File }) {
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!file.type.startsWith("image/")) return;
    const objectUrl = URL.createObjectURL(file);
    const imageElement = imageRef.current;
    imageElement?.setAttribute("src", objectUrl);
    return () => {
      if (imageElement?.getAttribute("src") === objectUrl) {
        imageElement.removeAttribute("src");
      }
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={imageRef} alt="" className="size-full object-cover" />;
}

export function ImagePicker({
  initialUrls,
  onChange,
  max = 5,
  label = "Images",
}: {
  initialUrls?: string[];
  onChange: (value: ImagePickerValue) => void;
  max?: number;
  label?: string;
}) {
  const [existingUrls, setExistingUrls] = useState<string[]>(initialUrls ?? []);
  const [newUrls, setNewUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [urlDraft, setUrlDraft] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  const remaining = max - existingUrls.length - newUrls.length - newFiles.length;
  const limitReached = remaining <= 0;

  const emit = (next: {
    existingUrls: string[];
    newUrls: string[];
    newFiles: File[];
    removedUrls: string[];
  }) => onChange(next);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).filter((file) =>
      file.type.startsWith("image/"),
    );
    setNewFiles((current) => {
      const next = [...current, ...incoming].slice(
        0,
        Math.max(0, max - existingUrls.length - newUrls.length),
      );
      emit({ existingUrls, newUrls, newFiles: next, removedUrls });
      return next;
    });
  };
  const removeExisting = (url: string) => {
    const nextExisting = existingUrls.filter((u) => u !== url);
    const nextRemoved = [...removedUrls, url];
    setExistingUrls(nextExisting);
    setRemovedUrls(nextRemoved);
    emit({
      existingUrls: nextExisting,
      newUrls,
      newFiles,
      removedUrls: nextRemoved,
    });
  };

  const removeNewUrl = (url: string) => {
    const next = newUrls.filter((u) => u !== url);
    setNewUrls(next);
    emit({ existingUrls, newUrls: next, newFiles, removedUrls });
  };

  const removeNewFile = (index: number) => {
    const next = newFiles.filter((_, i) => i !== index);
    setNewFiles(next);
    emit({ existingUrls, newUrls, newFiles: next, removedUrls });
  };

  const addUrl = () => {
    const error = validateImageUrl(urlDraft);
    setUrlError(error);
    if (error || !urlDraft.trim() || limitReached) return;
    const url = formatImageUrl(urlDraft);
    if (newUrls.includes(url) || existingUrls.includes(url)) {
      setUrlError("This image URL is already in the list");
      return;
    }
    const next = [...newUrls, url];
    setNewUrls(next);
    setUrlDraft("");
    setUrlError(null);
    // Keep focus in the URL field for quick multi-entry.
    urlInputRef.current?.focus();
    emit({ existingUrls, newUrls: next, newFiles, removedUrls });
  };

  return (
    <div role="group" aria-label={label} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {existingUrls.map((url) => (
          <ImageThumb
            key={`existing-${url}`}
            src={url}
            alt=""
            onRemove={() => removeExisting(url)}
            removeAriaLabel="Remove this image"
          />
        ))}

        {newUrls.map((url) => (
          <ImageThumb
            key={`new-url-${url}`}
            src={url}
            alt=""
            pending
            onRemove={() => removeNewUrl(url)}
            removeAriaLabel="Remove this new image URL"
          />
        ))}

        {newFiles.map((file, index) => (
          <div key={`${file.name}-${index}`} className="relative">
            <div className="relative h-24 w-28 overflow-hidden rounded-lg border border-primary bg-canvas">
              <FilePreview file={file} />
            </div>
            <button
              type="button"
              onClick={() => removeNewFile(index)}
              aria-label="Remove this image"
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-ink/70 text-white hover:bg-ink"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          </div>
        ))}

        {!limitReached && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="grid size-24 place-items-center rounded-lg border border-dashed border-ink/30 text-ink transition-colors hover:bg-accent/60"
            aria-label={`Add up to ${remaining} more image${remaining === 1 ? "" : "s"} from your computer`}
          >
            <ImagePlus aria-hidden="true" className="size-5" />
          </button>
        )}
      </div>

      {!limitReached && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Input
              ref={urlInputRef}
              type="url"
              value={urlDraft}
              onChange={(e) => {
                setUrlDraft(e.target.value);
                if (urlError) setUrlError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addUrl();
                }
              }}
              placeholder="…or paste an image URL"
              aria-label={`Paste an image URL to add up to ${remaining} more`}
              aria-invalid={urlError ? true : undefined}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addUrl}
              disabled={!urlDraft.trim() || limitReached}
            >
              <Link2 aria-hidden="true" />
              Add URL
            </Button>
          </div>
          {urlError ? (
            <p role="alert" className="text-xs text-destructive">
              {urlError}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Paste a direct link to an image (https://…​.jpg, .png, .webp).
              Upload stays available from your computer too.
            </p>
          )}
        </div>
      )}

      {limitReached && (
        <p className="text-xs text-muted-foreground">
          Image limit reached ({max}).
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
