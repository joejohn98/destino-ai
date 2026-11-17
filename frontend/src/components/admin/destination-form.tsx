"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  AdminFormDialog,
  FormFieldError,
} from "@/components/admin/admin-form-dialog";
import {
  ImagePicker,
  type ImagePickerValue,
} from "@/components/admin/image-input";
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldTextarea,
} from "@/components/ui/field";
import { api } from "@/lib/api";
import type { AdminContinent } from "@/lib/api";
import {
  destinationSchema,
  type DestinationFormData,
} from "@/schemas/admin.schema";
import {
  attractionToDraft,
  buildFormData,
  destinationToFormInitial,
  makeId,
  toDefaultValues,
  type AttractionDraft,
  type DestinationFormInitial,
} from "./destination-form-helpers";
import { AttractionsSection } from "./attraction-fields";
import { DestinationDetailsGrid } from "./destination-form-fields";

export { destinationToFormInitial, type DestinationFormInitial };

interface DestinationFormProps {
  continents: AdminContinent[];
  initial?: DestinationFormInitial | null;
  /** Country id to preselect when creating from a country drill-down page. */
  presetCountry?: string;
  onSaved: () => void;
}

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

  return (
    <AdminFormDialog
      open
      title={isEdit ? "Edit destination" : "New destination"}
      description="Add or update a verified destination. Fields marked * are required."
      isSubmitting={isSubmitting}
      submitLabel={isEdit ? "Save changes" : "Create destination"}
      contentClassName="max-h-[85vh] overflow-y-auto sm:max-w-2xl"
      onClose={onSaved}
      onSubmit={handleSubmit(onFormSubmit)}
    >
      {/* Name */}
      <Field>
        <FieldLabel htmlFor="dest-name">Name *</FieldLabel>
        <FieldControl
          id="dest-name"
          {...register("name")}
          placeholder="e.g. Taj Mahal"
        />
        <FormFieldError message={errors.name?.message} />
      </Field>

      {/* Description */}
      <Field>
        <FieldLabel htmlFor="dest-desc">Description *</FieldLabel>
        <FieldTextarea
          id="dest-desc"
          {...register("description")}
          placeholder="Describe this destination (10–2000 chars)"
        />
        <FormFieldError message={errors.description?.message} />
      </Field>

      {/* Grid: Category, Country, City, State, and optional details */}
      <DestinationDetailsGrid
        control={control}
        register={register}
        errors={errors}
        continents={continents}
      />

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
      <AttractionsSection
        attractions={attractions}
        onAdd={addAttraction}
        onUpdate={updateAttraction}
        onRemove={removeAttraction}
      />
    </AdminFormDialog>
  );
}
