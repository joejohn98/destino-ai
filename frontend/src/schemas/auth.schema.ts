import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(20, "Password must be at most 20 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%?&]/,
    "Password must contain at least one special character (!@#$%?&)",
  );

export const signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be at most 30 characters long"),
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: passwordSchema,
});

export type SignUpFormData = z.infer<typeof signupSchema>;

export type SignInFormData = z.infer<typeof signInSchema>;

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Invalid email address").min(1, "Email is required"),
});

export const DELETE_ACCOUNT_CONFIRMATION = "delete";
