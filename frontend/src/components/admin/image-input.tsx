"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatImageUrl,
  validateImageUrl,
  MAX_IMAGE_URL_LENGTH,
} from "./image-url-utils";
import { ImageThumb, NewFileThumbnail } from "./image-thumbnail";

export { formatImageUrl, validateImageUrl, MAX_IMAGE_URL_LENGTH };

export interface ImagePickerValue {
  existingUrls: string[];
  /** New image URLs entered by the admin (no file). */
  newUrls: string[];
  newFiles: File[];
  removedUrls: string[];
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
  const [existingUrls, setExistingUrls] = useState<string[]>(
    initialUrls ?? [],
  );
  const [newUrls, setNewUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [urlDraft, setUrlDraft] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  const remaining = max - existingUrls.length - newUrls.length - newFiles.length;
  const limitReached = remaining <= 0;

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).filter((f) =>
      f.type.startsWith("image/"),
    );
    setNewFiles((prev) => {
      const next = [...prev, ...incoming].slice(
        0,
        max - existingUrls.length - newUrls.length,
      );
      onChange({ existingUrls, newUrls, newFiles: next, removedUrls });
      return next;
    });
  };

  const removeFile = (index: number) => {
    setNewFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      onChange({ existingUrls, newUrls, newFiles: next, removedUrls });
      return next;
    });
  };

  const removeExisting = (url: string) => {
    setExistingUrls((prev) => {
      const nextExisting = prev.filter((u) => u !== url);
      const nextRemoved = [...removedUrls, url];
      setRemovedUrls(nextRemoved);
      onChange({
        existingUrls: nextExisting,
        newUrls,
        newFiles,
        removedUrls: nextRemoved,
      });
      return nextExisting;
    });
  };

  const addUrl = () => {
    const error = validateImageUrl(urlDraft);
    if (error) {
      setUrlError(error);
      return;
    }
    const trimmed = formatImageUrl(urlDraft);
    if (!trimmed) return;
    if (existingUrls.includes(trimmed) || newUrls.includes(trimmed)) {
      setUrlError("This image URL has already been added");
      return;
    }
    setNewUrls((prev) => {
      const next = [...prev, trimmed];
      onChange({ existingUrls, newUrls: next, newFiles, removedUrls });
      return next;
    });
    setUrlDraft("");
    setUrlError(null);
  };

  const removeNewUrl = (url: string) => {
    setNewUrls((prev) => {
      const next = prev.filter((u) => u !== url);
      onChange({ existingUrls, newUrls: next, newFiles, removedUrls });
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span aria-live="polite">
          {existingUrls.length + newUrls.length + newFiles.length} of {max}{" "}
          images
        </span>
      </div>

      {/* Thumbnails row */}
      {(existingUrls.length > 0 ||
        newUrls.length > 0 ||
        newFiles.length > 0) && (
        <div className="flex flex-wrap gap-2.5">
          {existingUrls.map((url, i) => (
            <ImageThumb
              key={url}
              src={url}
              alt={`Existing image ${i + 1}`}
              onRemove={() => removeExisting(url)}
              removeAriaLabel={`Remove image ${i + 1}`}
            />
          ))}
          {newUrls.map((url, i) => (
            <ImageThumb
              key={url}
              src={url}
              alt={`New URL image ${i + 1}`}
              onRemove={() => removeNewUrl(url)}
              removeAriaLabel={`Remove new image URL ${i + 1}`}
              pending
            />
          ))}
          {newFiles.map((file, i) => (
            <NewFileThumbnail
              key={`${file.name}-${file.lastModified}-${i}`}
              file={file}
              onRemove={() => removeFile(i)}
            />
          ))}
        </div>
      )}

      {/* Inputs (disabled when max images reached) */}
      {!limitReached && (
        <div className="flex flex-col gap-2">
          {/* File picker */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus aria-hidden="true" />
              Upload image file(s)
            </Button>
          </div>

          {/* URL text input */}
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Input
                ref={urlInputRef}
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
                placeholder="Or paste an image URL (e.g. https://…/photo.jpg)"
                className="text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addUrl}
                disabled={!urlDraft.trim()}
              >
                <Link2 aria-hidden="true" />
                Add URL
              </Button>
            </div>
            {urlError && (
              <p role="alert" className="text-xs text-destructive">
                {urlError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
