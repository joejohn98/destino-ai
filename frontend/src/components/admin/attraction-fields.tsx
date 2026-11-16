import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldControl,
  FieldLabel,
  FieldTextarea,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ATTRACTION_CATEGORIES } from "@/schemas/admin.schema";
import type { AttractionDraft, SelectOption } from "./destination-form-helpers";

const CATEGORY_OPTIONS: SelectOption[] = ATTRACTION_CATEGORIES.map(
  (category) => ({
    value: category,
    label: category.replace("-", " "),
  }),
);

export function AttractionRow({
  attraction,
  onChange,
  onRemove,
}: {
  attraction: AttractionDraft;
  onChange: (field: keyof AttractionDraft, value: string) => void;
  onRemove: () => void;
}) {
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
              items={CATEGORY_OPTIONS}
            >
              <SelectTrigger id={`attr-cat-${id}`}>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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

export function AttractionsSection({
  attractions,
  onAdd,
  onUpdate,
  onRemove,
}: {
  attractions: AttractionDraft[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof AttractionDraft, value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Attractions</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
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
            onUpdate(attraction.id, field, value)
          }
          onRemove={() => onRemove(attraction.id)}
        />
      ))}
    </div>
  );
}
