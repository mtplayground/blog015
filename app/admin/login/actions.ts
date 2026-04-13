"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  getSessionMaxAgeSeconds,
  SESSION_COOKIE_NAME,
  verifyAdminPassword,
} from "@/lib/auth";

export async function loginAction(formData: FormData): Promise<void> {
  const rawPassword = formData.get("password");
  const password = typeof rawPassword === "string" ? rawPassword : "";

  if (!password) {
    redirect("/admin/login?error=missing_password");
  }

  let isValidPassword = false;

  try {
    isValidPassword = verifyAdminPassword(password);
  } catch (error) {
    console.error("Failed to verify admin password:", error);
    redirect("/admin/login?error=server_config");
  }

  if (!isValidPassword) {
    redirect("/admin/login?error=invalid_credentials");
  }

  const token = createSessionToken();
  const cookieStore = await cookies();

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getSessionMaxAgeSeconds(),
  });

  redirect("/admin");
}
