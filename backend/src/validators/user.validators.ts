import z from "zod";

const updateProfileSchema = z
  .object({
    firstName: z.string().min(1, "First name cannot be empty").trim().optional(),
    lastName: z.string().min(1, "Last name cannot be empty").trim().optional(),
    email: z.email("Invalid email address").trim().toLowerCase().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.email !== undefined,
    { message: "Provide at least one profile field to update" },
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export { updateProfileSchema };
