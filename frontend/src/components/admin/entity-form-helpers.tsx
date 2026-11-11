import type { EntityFormData } from "@/schemas/admin.schema";

/** Build the `FormData` payload to send to the API. */
export function buildEntityFormData(
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

/**
 * Displays the current image preview — either a chosen file (blob URL),
 * a typed URL, or the entity's existing saved image.
 */
export function ImagePreview({
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

