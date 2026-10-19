"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ADMIN_LOGIN_PATH, isAdminEnabled, isAllowedAdminEmail, safeAdminNext } from "@/lib/admin/access";
import { createAuthClient } from "@/lib/supabase/auth-client";

// The email is echoed back so the form can keep it after a failed attempt.
export type SignInState = { status: "idle" } | { status: "error"; message: string; email?: string };

const signInSchema = z.object({
  email: z.email("Enter your email address."),
  password: z.string().min(1, "Enter your password.").max(200),
});

const GENERIC_ERROR = "Wrong email or password.";

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  if (!isAdminEnabled()) return { status: "error", message: GENERIC_ERROR };

  const typedEmail = String(formData.get("email") ?? "").slice(0, 200);
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message, email: typedEmail };

  // Check the allowlist first, but give the same message either way so the
  // form doesn't reveal which emails are admins.
  if (!isAllowedAdminEmail(parsed.data.email)) return { status: "error", message: GENERIC_ERROR, email: typedEmail };

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // Supabase rate-limits repeated failures; surface that clearly.
    if (error.status === 429) {
      return { status: "error", message: "Too many attempts. Wait a few minutes and try again.", email: typedEmail };
    }
    return { status: "error", message: GENERIC_ERROR, email: typedEmail };
  }

  const next = formData.get("next");
  redirect(safeAdminNext(typeof next === "string" ? next : null));
}

export async function signOut() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect(ADMIN_LOGIN_PATH);
}
