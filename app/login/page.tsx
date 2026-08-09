"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PasswordSignInForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const error = searchParams.get("error");

  return (
    <form action="/api/admin/login" method="POST" className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      {error === "bad-password" && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          Sign-in failed. Check your email and password and try again.
        </div>
      )}
      <input
        type="email"
        name="email"
        placeholder="Your email (leave blank to use shared admin password)"
        autoComplete="email"
        className="w-full rounded-md border border-rule bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-teal"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        autoComplete="current-password"
        className="w-full rounded-md border border-rule bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-teal"
      />
      <button
        type="submit"
        className="w-full rounded-md bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Sign in
      </button>
      <a
        href="/login/forgot"
        className="mt-1 text-center text-xs text-muted hover:text-teal"
      >
        Forgot password?
      </a>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main
      id="main"
      className="flex min-h-screen items-center justify-center bg-paper px-6"
    >
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fida-shield.png"
            alt="FIDA"
            className="mb-4 inline-block h-12 w-12 object-contain"
          />
          {/* WCAG 1.3.1 / 2.4.6 — page needs a level-one heading. */}
          <h1 className="font-display text-2xl text-navy">FIDA</h1>
          <div className="eyebrow mt-1">Live platform preview</div>
        </div>

        <div className="card bg-white p-6">
          <p className="mb-5 text-center text-sm text-muted">
            Sign in to the FIDA admin dashboard.
          </p>
          <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
            <PasswordSignInForm />
          </Suspense>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-muted transition-colors hover:text-teal"
          >
            ← Back to public site
          </a>
        </div>
      </div>
    </main>
  );
}
