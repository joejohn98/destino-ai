"use client";

import { useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldTextarea,
} from "@/components/ui/field";
import { validateImageUrl } from "@/components/admin/image-input";

interface EntityFormProps {
  open: boolean;
  title: string;
  description: string;
  initial?: {
    _id: string;
    name: string;
    description?: string;
    imageUrl?: string;
  } | null;
  /** Called when the form is dismissed without saving (Cancel or backdrop/Escape). */
  onClose: () => void;
  /** Called after a successful save. Should close the dialog AND refresh data. */
  onSaved: () => void;
  onSubmit: (formData: FormData) => Promise<unknown>;
}

/**
 * Shared dialog for admin create/edit of a "single-image entity"
 * (continents and countries). The image is optional when editing and
 * the entity already has one — otherwise the backend requires it.
 */
export function EntityForm({
  open,
  title,
  description,
  initial,
  onClose,
  onSaved,
  onSubmit,
}: EntityFormProps) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Stable object URL for the chosen file — avoids a new blob URL on every render.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (next: File | null) => {
    // Revoke any previously created object URL before creating a new one.
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
    if (next) {
      setImageUrl("");
      setImageError(null);
    }
  };

  const handleImageUrlChange = (value: string) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setImageUrl(value);
    setImageError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    const imageValidationError = validateImageUrl(imageUrl);
    if (imageValidationError) {
      setImageError(imageValidationError);
      return;
    }
    if (!isEdit && !file && !imageUrl.trim()) {
      toast.error("Choose an image file or enter an image URL.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      if (desc.trim()) fd.append("description", desc.trim());
      if (file) fd.append("image", file);
      else if (imageUrl.trim()) fd.append("imageUrl", imageUrl.trim());

      await onSubmit(fd);
      toast.success(isEdit ? "Saved changes" : "Created");
      onSaved();
    } catch (error) {
      toast.error(
        isEdit ? "Couldn't save changes" : "Couldn't create",
        {
          description:
            error instanceof Error
              ? error.message
              : "Check the form and try again.",
        },
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Backdrop click / Escape key: just close, don't trigger a data reload.
        if (!next && !submitting) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="entity-name">Name *</FieldLabel>
            <FieldControl
              id="entity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Europe"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="entity-desc">Description</FieldLabel>
            <FieldTextarea
              id="entity-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Optional description (10–1000 chars)"
            />
          </Field>

          <Field data-invalid={imageError ? true : undefined}>
            <FieldLabel htmlFor="entity-image">
              Image{isEdit && initial?.imageUrl ? "" : " *"}
            </FieldLabel>
            {(isEdit && initial?.imageUrl) || previewUrl || imageUrl.trim() ? (
              <div className="relative h-28 w-40 overflow-hidden rounded-lg border border-input bg-canvas">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl ?? (imageUrl.trim() || initial?.imageUrl)}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
            ) : null}
            <FieldControl
              id="entity-image"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="mt-1"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            <FieldLabel htmlFor="entity-image-url">Or use an image URL</FieldLabel>
            <FieldControl
              id="entity-image-url"
              type="url"
              value={imageUrl}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="Or paste an image URL (https://…)"
              aria-invalid={imageError ? true : undefined}
            />
            {imageError ? (
              <p role="alert" className="text-xs text-destructive">
                {imageError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Choose a file or provide an HTTP or HTTPS image URL.
              </p>
            )}
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && (
                <Loader2 aria-hidden="true" className="animate-spin" />
              )}
              {isEdit ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
