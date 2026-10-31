"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ImagePicker, type ImagePickerValue } from "@/components/admin/image-input";
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
import type {
  AdminContinent,
  Attraction,
  Destination,
} from "@/lib/api";


const CATEGORIES = [
  "beach",
  "mountain",
  "city",
  "historical",
  "adventure",
  "wildlife",
] as const;

const ATTRACTION_CATEGORIES = [
  "monument",
  "museum",
  "market",
  "nature",
  "viewpoint",
  "day-trip",
  "activity",
  "religious",
  "entertainment",
] as const;

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
    location: { city: string; state?: string; countryId?: string; country?: string };
    imageUrls: string[];
    attractions?: Attraction[];
    bestTimeToVisit?: string;
    openingHours?: string;
    ticketPrice?: string;
    website?: string;
  } | null;
  /** Country name to preselect when creating from a country drill-down page. */
  presetCountry?: string;
  onSaved: () => void;
}

export type DestinationFormInitial = NonNullable<DestinationFormProps["initial"]>;

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

/** Generate a simple stable id for attraction drafts. */
function makeId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

function toDraft(initial: NonNullable<DestinationFormProps["initial"]>): {
  name: string;
  description: string;
  category: string;
  city: string;
  state: string;
  country: string;
  bestTimeToVisit: string;
  openingHours: string;
  ticketPrice: string;
  website: string;
} {
  return {
    name: initial.name,
    description: initial.description,
    category: initial.category,
    city: initial.location.city,
    state: initial.location.state ?? "",
    // countryId is set directly on the initial object by the parent before passing in
    country: initial.location.countryId ?? "",
    bestTimeToVisit: initial.bestTimeToVisit ?? "",
    openingHours: initial.openingHours ?? "",
    ticketPrice: initial.ticketPrice ?? "",
    website: initial.website ?? "",
  };
}

export function DestinationForm({
  continents,
  initial,
  presetCountry,
  onSaved,
}: DestinationFormProps) {
  const isEdit = !!initial;
  const [values, setValues] = useState(() =>
    initial
      ? toDraft(initial)
      : {
          name: "",
          description: "",
          category: "historical",
          city: "",
          state: "",
          country: presetCountry ?? "",
          bestTimeToVisit: "",
          openingHours: "",
          ticketPrice: "",
          website: "",
        },
  );
  const [attractions, setAttractions] = useState<AttractionDraft[]>(
    // Start with an empty list — admin can click "Add attraction" as needed.
    initial?.attractions?.map((a) => ({
      id: makeId(),
      name: a.name,
      category: a.category,
      ticketPrice: a.ticketPrice,
      suggestedDuration: a.suggestedDuration,
      openingHours: a.openingHours,
      description: a.description,
    })) ?? [],
  );
  const [images, setImages] = useState<ImagePickerValue>({
    existingUrls: initial?.imageUrls ?? [],
    newUrls: [],
    newFiles: [],
    removedUrls: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const setAttraction = (index: number, field: keyof AttractionDraft, value: string) =>
    setAttractions((current) =>
      current.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );

  const addAttraction = () =>
    setAttractions((current) => [...current, { id: makeId(), name: "" }]);

  const removeAttraction = (index: number) =>
    setAttractions((current) => current.filter((_, i) => i !== index));

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append("name", values.name.trim());
    fd.append("description", values.description.trim());
    fd.append("category", values.category);

    fd.append("location[city]", values.city.trim());
    if (values.state.trim()) fd.append("location[state]", values.state.trim());
    fd.append("location[country]", values.country);

    if (values.bestTimeToVisit.trim()) fd.append("bestTimeToVisit", values.bestTimeToVisit.trim());
    if (values.openingHours.trim()) fd.append("openingHours", values.openingHours.trim());
    if (values.ticketPrice.trim()) fd.append("ticketPrice", values.ticketPrice.trim());
    if (values.website.trim()) fd.append("website", values.website.trim());

    const keptAttractions = attractions.filter((a) => a.name.trim());
    keptAttractions.forEach((a, i) => {
      fd.append(`attractions[${i}][name]`, a.name.trim());
      if (a.category) fd.append(`attractions[${i}][category]`, a.category);
      if (a.ticketPrice) fd.append(`attractions[${i}][ticketPrice]`, a.ticketPrice.trim());
      if (a.suggestedDuration) fd.append(`attractions[${i}][suggestedDuration]`, a.suggestedDuration.trim());
      if (a.openingHours) fd.append(`attractions[${i}][openingHours]`, a.openingHours.trim());
      if (a.description) fd.append(`attractions[${i}][description]`, a.description.trim());
    });

    // Existing (kept) image URLs are sent as string fields; removed ones are dropped.
    images.existingUrls.forEach((url) => fd.append("images", url));
    // New image URLs entered by the admin are sent exactly like existing URLs.
    images.newUrls.forEach((url) => fd.append("images", url));
    images.newFiles.forEach((file) => fd.append("images", file));

    return fd;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (
      !values.name.trim() ||
      !values.description.trim() ||
      !values.city.trim() ||
      !values.country
    ) {
      toast.error("Please fill in name, description, city, and country.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = buildFormData();
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !submitting) onSaved();
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

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Field>
            <FieldLabel htmlFor="dest-name">Name *</FieldLabel>
            <FieldControl
              id="dest-name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Taj Mahal"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="dest-desc">Description *</FieldLabel>
            <FieldTextarea
              id="dest-desc"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe this destination (10–2000 chars)"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="dest-cat">Category</FieldLabel>
              <Select
                value={values.category}
                onValueChange={(value) => set("category", value ?? "")}
              >
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
            </Field>

            <Field>
              <FieldLabel htmlFor="dest-country">Country *</FieldLabel>
              <Select
                value={values.country}
                onValueChange={(value) => set("country", value ?? "")}
              >
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
            </Field>

            <Field>
              <FieldLabel htmlFor="dest-city">City *</FieldLabel>
              <FieldControl
                id="dest-city"
                value={values.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="dest-state">State (optional)</FieldLabel>
              <FieldControl
                id="dest-state"
                value={values.state}
                onChange={(e) => set("state", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="dest-best-time">Best time to visit</FieldLabel>
              <FieldControl
                id="dest-best-time"
                value={values.bestTimeToVisit}
                onChange={(e) => set("bestTimeToVisit", e.target.value)}
                placeholder="e.g. Oct–Mar"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="dest-hours">Opening hours</FieldLabel>
              <FieldControl
                id="dest-hours"
                value={values.openingHours}
                onChange={(e) => set("openingHours", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="dest-ticket">Ticket price</FieldLabel>
              <FieldControl
                id="dest-ticket"
                value={values.ticketPrice}
                onChange={(e) => set("ticketPrice", e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="dest-website">Website</FieldLabel>
              <FieldControl
                id="dest-website"
                value={values.website}
                onChange={(e) => set("website", e.target.value)}
                type="url"
              />
            </Field>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Images (up to 5)</p>
            <ImagePicker
              initialUrls={images.existingUrls}
              max={5}
              onChange={(value) => setImages(value)}
            />
          </div>

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

            {attractions.map((attraction, index) => (
              <div
                key={attraction.id}
                className="flex flex-col gap-3 rounded-lg border border-line bg-canvas p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor={`attr-name-${attraction.id}`}>Name</FieldLabel>
                      <FieldControl
                        id={`attr-name-${attraction.id}`}
                        value={attraction.name}
                        onChange={(e) =>
                          setAttraction(index, "name", e.target.value)
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`attr-cat-${attraction.id}`}>Category</FieldLabel>
                      <Select
                        value={attraction.category ?? ""}
                        onValueChange={(valueValue) =>
                          setAttraction(index, "category", valueValue ?? "")
                        }
                      >
                        <SelectTrigger id={`attr-cat-${attraction.id}`}>
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
                      <FieldLabel htmlFor={`attr-price-${attraction.id}`}>Ticket price</FieldLabel>
                      <FieldControl
                        id={`attr-price-${attraction.id}`}
                        value={attraction.ticketPrice ?? ""}
                        onChange={(e) =>
                          setAttraction(index, "ticketPrice", e.target.value)
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`attr-duration-${attraction.id}`}>Suggested duration</FieldLabel>
                      <FieldControl
                        id={`attr-duration-${attraction.id}`}
                        value={attraction.suggestedDuration ?? ""}
                        onChange={(e) =>
                          setAttraction(index, "suggestedDuration", e.target.value)
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`attr-hours-${attraction.id}`}>Opening hours</FieldLabel>
                      <FieldControl
                        id={`attr-hours-${attraction.id}`}
                        value={attraction.openingHours ?? ""}
                        onChange={(e) =>
                          setAttraction(index, "openingHours", e.target.value)
                        }
                      />
                    </Field>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-danger hover:text-danger"
                    onClick={() => removeAttraction(index)}
                    aria-label="Remove attraction"
                  >
                    <Trash2 aria-hidden="true" className="size-3.5" />
                  </Button>
                </div>
                <Field>
                  <FieldLabel htmlFor={`attr-desc-${attraction.id}`}>Description</FieldLabel>
                  <FieldTextarea
                    id={`attr-desc-${attraction.id}`}
                    value={attraction.description ?? ""}
                    onChange={(e) =>
                      setAttraction(index, "description", e.target.value)
                    }
                  />
                </Field>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onSaved}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && (
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
