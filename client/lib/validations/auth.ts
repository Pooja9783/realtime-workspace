import { z } from "zod";

export const signUpSchema = z
  .object({
    username: z
      .string({ message: "Username is required" })
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username cannot exceed 30 characters"),

    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least 1 Uppercase")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[!@#$%]/, "Must contain 1 special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and Confirm Password should be same",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
