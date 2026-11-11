"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Manages the state for a single-image input that supports either a file
 * upload or a typed image URL. Revokes object URLs when switching modes to
 * avoid memory leaks.
 *
 * The hook owns `file` and `previewUrl` state. The caller is responsible for
 * wiring the returned handlers to their form library (e.g. react-hook-form's
 * `setValue` / `clearErrors`) since this hook is intentionally form-agnostic.
 */
export interface UseSingleImageInputResult {
  /** Currently selected File, or null when using a URL instead. */
  file: File | null;
  /** Blob URL for the selected file, or null. */
  previewUrl: string | null;
  /** Ref to attach to the native file `<input>` so it can be reset. */
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  /** Call when the user selects a file. */
  handleFileChange: (next: File | null) => void;
  /** Call when the user types/pastes an image URL. */
  handleImageUrlChange: () => void;
}

export function useSingleImageInput(): UseSingleImageInputResult {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = useCallback(
    (next: File | null) => {
      // Revoke any previously created object URL before creating a new one.
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(next);
      setPreviewUrl(next ? URL.createObjectURL(next) : null);
    },
    [previewUrl],
  );

  const handleImageUrlChange = useCallback(() => {
    // Switching to URL mode: clear any selected file and its blob preview.
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [previewUrl]);

  return {
    file,
    previewUrl,
    fileInputRef,
    handleFileChange,
    handleImageUrlChange,
  };
}
