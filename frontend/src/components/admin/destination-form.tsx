"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  ImagePicker,
  type ImagePickerValue,
} from "@/components/admin/image-input";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldTextarea,
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { AdminContinent, Attraction, Destination } from "@/lib/api";
import {
  destinationSchema,
  CATEGORIES,
  ATTRACTION_CATEGORIES,
  type DestinationFormData,
} from "@/schemas/admin.schema";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AttractionDraft {
  /** Stable id for React reconciliation — never sent to the API. */
  id: string;
  name: string;
  category?: string;
  ticketPrice?: string;
  suggestedDuration?: string;
  openingHours?: string;
  description?: string;
}

interface DestinationFormProps {
  continents: AdminContinent[];
  initial?: {
    _id: string;
    name: string;
    description: string;
    category: string;
    location: {
      city: string;
      state?: string;
      countryId?: string;
      country?: string;
    };
    imageUrls: string[];
    attractions?: Attraction[];
    bestTimeToVisit?: string;
    openingHours?: string;
    ticketPrice?: string;
    website?: string;
  } | null;
  /** Country id to preselect when creating from a country drill-down page. */
  presetCountry?: string;
  onSaved: () => void;
}

export type DestinationFormInitial = NonNullable<
  DestinationFormProps["initial"]
>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalize a public list `Destination` into the form's initial shape. */
export function destinationToFormInitial(
  dest: Destination,
): DestinationFormInitial {
  return {
    _id: dest._id,
    name: dest.name,
    description: dest.description,
    category: dest.category,
    location: {
      city: dest.location?.city ?? "",
      state: dest.location?.state,
      // countryId is resolved in the parent using the countries list
      country: dest.location?.country ?? "",
    },
    imageUrls: dest.imageUrls ?? [],
    attractions: dest.attractions,
    bestTimeToVisit: dest.bestTimeToVisit,
    openingHours: dest.openingHours,
    ticketPrice: dest.ticketPrice,
    website: dest.website,
  };
}

/** Generate a stable id for attraction drafts used as React list keys. */
function makeId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

/** Map a saved `Attraction` to an `AttractionDraft` for local editing state. */
function attractionToDraft(a: Attraction): AttractionDraft {
  return {
    id: a._id ?? makeId(),
    name: a.name,
    category: a.category,
    ticketPrice: a.ticketPrice,
    suggestedDuration: a.suggestedDuration,
    openingHours: a.openingHours,
    description: a.description,
  };
}

/** Build the `defaultValues` object for `useForm` from an existing destination. */
function toDefaultValues(
  initial: DestinationFormInitial,
): DestinationFormData {
  return {
    name: initial.name,
    description: initial.description,
    category: initial.category as DestinationFormData["category"],
    city: initial.location.city,
    state: initial.location.state ?? "",
    // countryId is set by the parent before passing initial in
    country: initial.location.countryId ?? "",
    bestTimeToVisit: initial.bestTimeToVisit ?? "",
    openingHours: initial.openingHours ?? "",
    ticketPrice: initial.ticketPrice ?? "",
    website: initial.website ?? "",
  };
}

/** Build the `FormData` payload to send to the API. */
function buildFormData(
  values: DestinationFormData,
  attractions: AttractionDraft[],
  images: ImagePickerValue,
): FormData {
  const fd = new FormData();

  // Core fields
  fd.append("name", values.name.trim());
  fd.append("description", values.description.trim());
  fd.append("category", values.category);

  // Location
  fd.append("location[city]", values.city.trim());
  if ((values.state ?? "").trim())
    fd.append("location[state]", (values.state ?? "").trim());
  fd.append("location[country]", values.country);

  // Optional text fields — only appended when non-empty
  const optionalFields = [
    ["bestTimeToVisit", values.bestTimeToVisit],
    ["openingHours", values.openingHours],
    ["ticketPrice", values.ticketPrice],
    ["website", values.website],
  ] as const;
  for (const [key, val] of optionalFields) {
    if ((val ?? "").trim()) fd.append(key, (val ?? "").trim());
  }

  // Attractions — only include drafts that have a non-empty name
  attractions
    .filter((a) => a.name.trim())
    .forEach((a, i) => {
      fd.append(`attractions[${i}][id]`, a.id);
      fd.append(`attractions[${i}][name]`, a.name.trim());
      if (a.category) fd.append(`attractions[${i}][category]`, a.category);
      if (a.ticketPrice)
        fd.append(`attractions[${i}][ticketPrice]`, a.ticketPrice.trim());
      if (a.suggestedDuration)
        fd.append(
          `attractions[${i}][suggestedDuration]`,
          a.suggestedDuration.trim(),
        );
      if (a.openingHours)
        fd.append(`attractions[${i}][openingHours]`, a.openingHours.trim());
      if (a.description)
        fd.append(`attractions[${i}][description]`, a.description.trim());
    });

  // Images — existing kept URLs, newly typed URLs, and newly uploaded files
  images.existingUrls.forEach((url) => fd.append("images", url));
  images.newUrls.forEach((url) => fd.append("images", url));
  images.newFiles.forEach((file) => fd.append("images", file));

  return fd;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface AttractionRowProps {
  attraction: AttractionDraft;
  onChange: (field: keyof AttractionDraft, value: string) => void;
  onRemove: () => void;
}

/** A single attraction card rendered inside the attractions list. */
function AttractionRow({ attraction, onChange, onRemove }: AttractionRowProps) {
  const { id } = attraction;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line bg-canvas p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor={`attr-name-${id}`}>Name</FieldLabel>
            <FieldControl
              id={`attr-name-${id}`}
              value={attraction.name}
              onChange={(e) => onChange("name", e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`attr-cat-${id}`}>Category</FieldLabel>
            <Select
              value={attraction.category ?? ""}
              onValueChange={(value) => onChange("category", value ?? "")}
            >
              <SelectTrigger id={`attr-cat-${id}`}>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {ATTRACTION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor={`attr-price-${id}`}>Ticket price</FieldLabel>
            <FieldControl
              id={`attr-price-${id}`}
              value={attraction.ticketPrice ?? ""}
              onChange={(e) => onChange("ticketPrice", e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`attr-duration-${id}`}>
              Suggested duration
            </FieldLabel>
            <FieldControl
              id={`attr-duration-${id}`}
              value={attraction.suggestedDuration ?? ""}
              onChange={(e) => onChange("suggestedDuration", e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`attr-hours-${id}`}>Opening hours</FieldLabel>
            <FieldControl
              id={`attr-hours-${id}`}
              value={attraction.openingHours ?? ""}
              onChange={(e) => onChange("openingHours", e.target.value)}
            />
          </Field>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-danger hover:text-danger"
          onClick={onRemove}
          aria-label="Remove attraction"
        >
          <Trash2 aria-hidden="true" className="size-3.5" />
        </Button>
      </div>

      <Field>
        <FieldLabel htmlFor={`attr-desc-${id}`}>Description</FieldLabel>
        <FieldTextarea
          id={`attr-desc-${id}`}
          value={attraction.description ?? ""}
          onChange={(e) => onChange("description", e.target.value)}
        />
      </Field>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DestinationForm({
  continents,
  initial,
  presetCountry,
  onSaved,
}: DestinationFormProps) {
  const isEdit = !!initial;

  const [attractions, setAttractions] = useState<AttractionDraft[]>(
    () => initial?.attractions?.map(attractionToDraft) ?? [],
  );
  const [images, setImages] = useState<ImagePickerValue>({
    existingUrls: initial?.imageUrls ?? [],
    newUrls: [],
    newFiles: [],
    removedUrls: [],
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema),
    defaultValues: initial
      ? toDefaultValues(initial)
      : {
          name: "",
          description: "",
          category: "historical" as DestinationFormData["category"],
          city: "",
          state: "",
          country: presetCountry ?? "",
          bestTimeToVisit: "",
          openingHours: "",
          ticketPrice: "",
          website: "",
        },
  });

  // --- Attraction helpers ---

  const updateAttraction = (
    id: string,
    field: keyof AttractionDraft,
    value: string,
  ) =>
    setAttractions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    );

  const addAttraction = () =>
    setAttractions((prev) => [...prev, { id: makeId(), name: "" }]);

  const removeAttraction = (id: string) =>
    setAttractions((prev) => prev.filter((a) => a.id !== id));

  // --- Form submit ---

  const onFormSubmit = async (values: DestinationFormData) => {
    const fd = buildFormData(values, attractions, images);

    try {
      if (isEdit && initial) {
        await api.updateDestination(initial._id, fd);
        toast.success("Destination updated");
      } else {
        await api.createDestination(fd);
        toast.success("Destination created");
      }
      onSaved();
    } catch (error) {
      toast.error(
        isEdit ? "Couldn't update destination" : "Couldn't create destination",
        {
          description:
            error instanceof Error
              ? error.message
              : "Check the form and try again.",
        },
      );
    }
  };

  // --- Render ---

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onSaved();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit destination" : "New destination"}
          </DialogTitle>
          <DialogDescription>
            Add or update a verified destination. Fields marked * are required.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          noValidate
          className="flex flex-col gap-5"
        >
          {/* Name */}
          <Field>
            <FieldLabel htmlFor="dest-name">Name *</FieldLabel>
            <FieldControl
              id="dest-name"
              {...register("name")}
              placeholder="e.g. Taj Mahal"
            />
            {errors.name && (
              <p role="alert" className="text-xs text-destructive">
                {errors.name.message}
              </p>
            )}
          </Field>

          {/* Description */}
          <Field>
            <FieldLabel htmlFor="dest-desc">Description *</FieldLabel>
            <FieldTextarea
              id="dest-desc"
              {...register("description")}
              placeholder="Describe this destination (10–2000 chars)"
            />
            {errors.description && (
              <p role="alert" className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </Field>

          {/* Grid: Category, Country, City, State, and optional details */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Category */}
            <Field>
              <FieldLabel htmlFor="dest-cat">Category</FieldLabel>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="dest-cat">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </Field>

            {/* Country */}
            <Field>
              <FieldLabel htmlFor="dest-country">Country *</FieldLabel>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="dest-country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {continents.map((continent) => (
                        <SelectGroup key={continent._id}>
                          <SelectLabel>{continent.name}</SelectLabel>
                          {continent.countries.map((country) => (
                            <SelectItem key={country._id} value={country._id}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.country && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.country.message}
                </p>
              )}
            </Field>

            {/* City */}
            <Field>
              <FieldLabel htmlFor="dest-city">City *</FieldLabel>
              <FieldControl id="dest-city" {...register("city")} />
              {errors.city && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.city.message}
                </p>
              )}
            </Field>

            {/* State */}
            <Field>
              <FieldLabel htmlFor="dest-state">State (optional)</FieldLabel>
              <FieldControl id="dest-state" {...register("state")} />
            </Field>

            {/* Best time to visit */}
            <Field>
              <FieldLabel htmlFor="dest-best-time">Best time to visit</FieldLabel>
              <FieldControl
                id="dest-best-time"
                {...register("bestTimeToVisit")}
                placeholder="e.g. Oct–Mar"
              />
            </Field>

            {/* Opening hours */}
            <Field>
              <FieldLabel htmlFor="dest-hours">Opening hours</FieldLabel>
              <FieldControl id="dest-hours" {...register("openingHours")} />
            </Field>

            {/* Ticket price */}
            <Field>
              <FieldLabel htmlFor="dest-ticket">Ticket price</FieldLabel>
              <FieldControl id="dest-ticket" {...register("ticketPrice")} />
            </Field>

            {/* Website */}
            <Field>
              <FieldLabel htmlFor="dest-website">Website</FieldLabel>
              <FieldControl
                id="dest-website"
                {...register("website")}
                type="url"
              />
            </Field>
          </div>

          {/* Images */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Images (up to 5)</p>
            <ImagePicker
              initialUrls={images.existingUrls}
              max={5}
              onChange={setImages}
            />
          </div>

          {/* Attractions */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Attractions</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAttraction}
              >
                <Plus aria-hidden="true" />
                Add attraction
              </Button>
            </div>

            {attractions.map((attraction) => (
              <AttractionRow
                key={attraction.id}
                attraction={attraction}
                onChange={(field, value) =>
                  updateAttraction(attraction.id, field, value)
                }
                onRemove={() => removeAttraction(attraction.id)}
              />
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onSaved}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 aria-hidden="true" className="animate-spin" />
              )}
              {isEdit ? "Save changes" : "Create destination"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
