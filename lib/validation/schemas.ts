import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid").min(1, "Email harus diisi"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(100, "Password terlalu panjang"),
});

export const registerSchema = z.object({
  email: z.string().email("Email tidak valid").min(1, "Email harus diisi"),
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username terlalu panjang")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username hanya boleh huruf, angka, underscore, dan dash",
    ),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(100, "Password terlalu panjang"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
