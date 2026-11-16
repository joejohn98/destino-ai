import type { Attraction, AdminContinent, Destination } from "@/lib/api";
import type { ImagePickerValue } from "@/components/admin/image-input";
import type { DestinationFormData } from "@/schemas/admin.schema";

export interface SelectOption {
  value: string;
  label: string;
}

/** Flatten continents into `{ value, label }` options for the country select. */
export function countryOptions(continents: AdminContinent[]): SelectOption[] {
  return continents.flatMap((continent) =>
    continent.countries.map((country) => ({
      value: country._id,
      label: country.name,
    })),
  );
}

/**
 * Display label for a country value that may be an id, a name, or an empty string.
 * Raw database ids are never shown to the user.
 */
export function countryLabel(
  value: string | null | undefined,
  continents: AdminContinent[],
): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  const country = countryOptions(continents).find(
    (option) =>
      option.value.toLowerCase() === raw.toLowerCase() ||
      option.label.toLowerCase() === raw.toLowerCase(),
  );
  if (country) return country.label;

  return /^[a-f\d]{24}$/i.test(raw) ? "Country unavailable" : raw;
}

/** Resolve a stored country id/name to the canonical country id used by the form. */
export function resolveCountryId(
  countryValue: string | undefined,
  continents: AdminContinent[],
  presetCountry?: string,
): string {
  if (presetCountry) return presetCountry;

  const raw = countryValue?.trim();
  if (!raw) return "";

  const country = countryOptions(continents).find(
    (option) =>
      option.value.toLowerCase() === raw.toLowerCase() ||
      option.label.toLowerCase() === raw.toLowerCase(),
  );
  return country?.value ?? raw;
}

export interface AttractionDraft {
  /** Stable id for React reconciliation — never sent to the API. */
  id: string;
  name: string;
  category?: string;
  ticketPrice?: string;
  suggestedDuration?: string;
  openingHours?: string;
  description?: string;
}

export interface DestinationFormInitial {
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
}

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
export function makeId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());
}

/** Map a saved `Attraction` to an `AttractionDraft` for local editing state. */
export function attractionToDraft(a: Attraction): AttractionDraft {
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
export function toDefaultValues(
  initial: DestinationFormInitial,
): DestinationFormData {
  return {
    name: initial.name,
    description: initial.description,
    category: initial.category as DestinationFormData["category"],
    city: initial.location.city,
    state: initial.location.state ?? "",
    // countryId is set by the parent before passing initial in
    country: initial.location.countryId || initial.location.country || "",
    bestTimeToVisit: initial.bestTimeToVisit ?? "",
    openingHours: initial.openingHours ?? "",
    ticketPrice: initial.ticketPrice ?? "",
    website: initial.website ?? "",
  };
}

/** Build the `FormData` payload to send to the API. */
export function buildFormData(
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

