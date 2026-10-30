"use client";

import { useId } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  REVIEW_MAX_LENGTH,
  reviewSchema,
  type ReviewFormData,
} from "@/schemas/review.schema";

interface ReviewFormProps {
  initialValues?: Partial<ReviewFormData>;
  submitLabel: string;
  onSubmit: (values: ReviewFormData) => Promise<void>;
  onCancel?: () => void;
}

export function ReviewForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const id = useId();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: initialValues?.rating,
      reviewText: initialValues?.reviewText ?? "",
    },
  });

  const length = useWatch({ control, name: "reviewText" })?.length ?? 0;

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "We couldn't save your review. Try again.",
      });
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <span id={`${id}-rating-label`} className="text-sm font-medium text-ink">
          Your rating
        </span>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <div
              role="radiogroup"
              aria-labelledby={`${id}-rating-label`}
              aria-describedby={errors.rating ? `${id}-rating-error` : undefined}
              className="mt-2 flex items-center gap-1"
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const checked = field.value === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                    tabIndex={
                      checked || (field.value === undefined && value === 1) ? 0 : -1
                    }
                    onClick={() => field.onChange(value)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                        event.preventDefault();
                        field.onChange(Math.min(5, (field.value ?? 0) + 1));
                      } else if (
                        event.key === "ArrowLeft" ||
                        event.key === "ArrowDown"
                      ) {
                        event.preventDefault();
                        field.onChange(Math.max(1, (field.value ?? 2) - 1));
                      }
                    }}
                    className="rounded-sm p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <Star
                      aria-hidden="true"
                      className={cn(
                        "size-7 transition-colors",
                        field.value !== undefined && value <= field.value
                          ? "fill-pastel-peach text-pastel-peach"
                          : "text-line-strong",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.rating && (
          <p id={`${id}-rating-error`} role="alert" className="mt-2 text-sm text-danger">
            {errors.rating.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor={`${id}-text`}>Your review</Label>
        <Textarea
          id={`${id}-text`}
          rows={4}
          maxLength={REVIEW_MAX_LENGTH + 50}
          placeholder="What stood out? Tips for other travelers?"
          aria-invalid={errors.reviewText ? true : undefined}
          aria-describedby={`${id}-text-hint`}
          className="mt-2"
          {...register("reviewText")}
        />
        <div
          id={`${id}-text-hint`}
          className="mt-1.5 flex items-start justify-between gap-3 text-xs"
        >
          <span role={errors.reviewText ? "alert" : undefined} className="text-danger">
            {errors.reviewText?.message}
          </span>
          <span
            className={cn(
              "ml-auto shrink-0 tabular-nums",
              length > REVIEW_MAX_LENGTH ? "text-danger" : "text-muted-foreground",
            )}
          >
            {length}/{REVIEW_MAX_LENGTH}
          </span>
        </div>
      </div>

      {errors.root && (
        <p role="alert" className="text-sm text-danger">
          {errors.root.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 aria-hidden="true" className="animate-spin" />}
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
