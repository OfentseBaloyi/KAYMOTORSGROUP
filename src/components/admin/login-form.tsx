"use client";

import { useActionState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { signIn, type SignInState } from "@/lib/actions/auth";

const initialState: SignInState = { status: "idle" };

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const message = state.status === "error" ? state.message : notice;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="block">
        <span className="text-sm font-semibold">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          // React resets the form after each attempt; this puts the email back.
          defaultValue={state.status === "error" ? state.email : undefined}
          required
          className="mt-1 block min-h-11 w-full rounded-card border border-line bg-white px-3 text-base"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="mt-1 block min-h-11 w-full rounded-card border border-line bg-white px-3 text-base"
        />
      </label>
      {message && (
        <p role="alert" className="text-sm font-semibold text-status-sold">
          {message}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClasses("dark", "lg", "w-full")}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
