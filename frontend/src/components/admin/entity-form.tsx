"use client";

import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { entitySchema, type EntityFormData } from "@/schemas/admin.schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build the `FormData` payload to send to the API. */
function buildEntityFormData(
  values: EntityFormData,
  file: File | null,
): FormData {
  const fd = new FormData();
  fd.append("name", values.name.trim());
  if ((values.description ?? "").trim())
    fd.append("description", (values.description ?? "").trim());
  if (file) fd.append("image", file);
  else if ((values.imageUrl ?? "").trim())
    fd.append("imageUrl", (values.imageUrl ?? "").trim());
  return fd;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Displays the current image preview — either a chosen file (blob URL),
 * a typed URL, or the entity's existing saved image.
 */
function ImagePreview({
  previewUrl,
  imageUrl,
  savedUrl,
}: {
  previewUrl: string | null;
  imageUrl: string | undefined;
  savedUrl: string | undefined;
}) {
  const src = previewUrl ?? ((imageUrl ?? "").trim() || savedUrl);
  if (!src) return null;

  return (
    <div className="relative h-28 w-40 overflow-hidden rounded-lg border border-input bg-canvas">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="size-full object-cover" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

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

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    handleSubmit,
    register,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      imageUrl: initial?.imageUrl ?? "",
    },
  });

  const imageUrl = useWatch({ control, name: "imageUrl" });

  // --- Image input handlers ---

  const handleFileChange = (next: File | null) => {
    // Revoke any previously created object URL before creating a new one.
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
    if (next) {
      setValue("imageUrl", "");
      clearErrors("imageUrl");
    }
  };

  const handleImageUrlChange = (value: string) => {
    // Switching to URL mode: clear any selected file and its blob preview.
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setValue("imageUrl", value);
  };

  // --- Form submit ---

  const onFormSubmit = async (values: EntityFormData) => {
    const imageValidationError = validateImageUrl(values.imageUrl ?? "");
    if (imageValidationError) {
      setError("imageUrl", { message: imageValidationError });
      return;
    }
    if (!isEdit && !file && !(values.imageUrl ?? "").trim()) {
      toast.error("Choose an image file or enter an image URL.");
      return;
    }

    try {
      await onSubmit(buildEntityFormData(values, file));
      toast.success(isEdit ? "Saved changes" : "Created");
      onSaved();
    } catch (error) {
      toast.error(isEdit ? "Couldn't save changes" : "Couldn't create", {
        description:
          error instanceof Error
            ? error.message
            : "Check the form and try again.",
      });
    }
  };

  // --- Render ---

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Backdrop click / Escape key: just close, don't trigger a data reload.
        if (!next && !isSubmitting) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          noValidate
          className="flex flex-col gap-5"
        >
          {/* Name */}
          <Field>
            <FieldLabel htmlFor="entity-name">Name *</FieldLabel>
            <FieldControl
              id="entity-name"
              {...register("name")}
              placeholder="e.g. Europe"
            />
            {errors.name && (
              <p role="alert" className="text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </Field>

          {/* Description */}
          <Field>
            <FieldLabel htmlFor="entity-desc">Description</FieldLabel>
            <FieldTextarea
              id="entity-desc"
              {...register("description")}
              placeholder="Optional description (10–1000 chars)"
            />
          </Field>

          {/* Image — file upload or URL */}
          <Field data-invalid={!!errors.imageUrl}>
            <FieldLabel htmlFor="entity-image">
              Image{isEdit && initial?.imageUrl ? "" : " *"}
            </FieldLabel>

            <ImagePreview
              previewUrl={previewUrl}
              imageUrl={imageUrl}
              savedUrl={initial?.imageUrl}
            />

            <FieldControl
              id="entity-image"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="mt-1"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />

            <FieldLabel htmlFor="entity-image-url">
              Or use an image URL
            </FieldLabel>
            <FieldControl
              id="entity-image-url"
              type="url"
              {...register("imageUrl")}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="Or paste an image URL (https://…)"
              aria-invalid={!!errors.imageUrl}
            />

            {errors.imageUrl ? (
              <p role="alert" className="text-xs text-destructive">
                {errors.imageUrl.message}
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
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
