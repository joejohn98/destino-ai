"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  AdminFormDialog,
  FormFieldError,
} from "@/components/admin/admin-form-dialog";
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
    <AdminFormDialog
      open={open}
      title={title}
      description={description}
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save changes" : "Create"}
      onClose={onClose}
      onSubmit={handleSubmit(onFormSubmit)}
    >
      {/* Name */}
      <Field>
        <FieldLabel htmlFor="entity-name">Name *</FieldLabel>
        <FieldControl
          id="entity-name"
          {...register("name")}
          placeholder="e.g. Europe"
        />
        <FormFieldError message={errors.name?.message} />
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
          <FormFieldError message={errors.imageUrl.message} />
        ) : (
          <p className="text-xs text-muted-foreground">
            Choose a file or provide an HTTP or HTTPS image URL.
          </p>
        )}
      </Field>
    </AdminFormDialog>
  );
}
