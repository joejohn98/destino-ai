"use client";

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
import { useSingleImageInput } from "@/hooks/use-single-image-input";
import { validateImageUrl } from "@/components/admin/image-input";
import { entitySchema, type EntityFormData } from "@/schemas/admin.schema";
import { buildEntityFormData, ImagePreview } from "./entity-form-helpers";

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

  const {
    file,
    previewUrl,
    fileInputRef,
    handleFileChange,
    handleImageUrlChange,
  } = useSingleImageInput();

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
              onChange={(e) => {
                handleFileChange(e.target.files?.[0] ?? null);
                if (e.target.files?.[0]) {
                  setValue("imageUrl", "");
                  clearErrors("imageUrl");
                }
              }}
            />

            <FieldLabel htmlFor="entity-image-url">
              Or use an image URL
            </FieldLabel>
            <FieldControl
              id="entity-image-url"
              type="url"
              {...register("imageUrl")}
              onChange={(e) => {
                handleImageUrlChange();
                setValue("imageUrl", e.target.value);
              }}
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
