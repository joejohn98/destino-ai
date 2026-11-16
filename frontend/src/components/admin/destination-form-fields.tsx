import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Field, FieldControl, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminContinent } from "@/lib/api";
import { CATEGORIES, type DestinationFormData } from "@/schemas/admin.schema";
import {
  countryLabel,
  countryOptions,
  type SelectOption,
} from "./destination-form-helpers";

const CATEGORY_OPTIONS: SelectOption[] = CATEGORIES.map((category) => ({
  value: category,
  label: category.charAt(0).toUpperCase() + category.slice(1),
}));

export function DestinationDetailsGrid({
  control,
  register,
  errors,
  continents,
}: {
  control: Control<DestinationFormData>;
  register: UseFormRegister<DestinationFormData>;
  errors: FieldErrors<DestinationFormData>;
  continents: AdminContinent[];
}) {
  const countryItems = countryOptions(continents);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {/* Category */}
      <Field>
        <FieldLabel htmlFor="dest-cat">Category</FieldLabel>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={CATEGORY_OPTIONS}
            >
              <SelectTrigger id="dest-cat">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
            <Select
              value={field.value}
              onValueChange={field.onChange}
              items={countryItems}
              itemToStringLabel={(value: string) =>
                countryLabel(value, continents) ?? ""
              }
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
  );
}

