"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const sp = useSearchParams();
  const error = sp.get("error");
  const notice = sp.get("notice");
  const [submitting, setSubmitting] = useState(false);

  // The form posts directly to /api/portal/login which responds with a 303
  // redirect. We use a native form submission (not fetch) so the browser
  // follows the redirect chain through Supabase's verify endpoint to
  // /auth/callback, where the session lands.

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fida-shield.png"
            alt="FIDA"
            className="mb-4 inline-block h-12 w-12 object-contain"
          />
          <div className="font-display text-2xl text-navy">Student Portal</div>
          <div className="eyebrow mt-1">FIDA</div>
        </div>

        <div className="card bg-white p-6">
          <p className="mb-5 text-center text-sm text-muted">
            Sign in to view your tickets, messages, and documents.
          </p>

          {error === "supabase-not-configured" && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              The portal isn&rsquo;t fully wired yet. Contact{" "}
              <a
                className="underline"
                href="mailto:success@fldentalassisting.com"
              >
                success@fldentalassisting.com
              </a>
              .
            </div>
          )}
          {error === "not-active" && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Your portal access isn&rsquo;t active. Contact{" "}
              <a
                className="underline"
                href="mailto:success@fldentalassisting.com"
              >
                success@fldentalassisting.com
              </a>
              .
            </div>
          )}
          {error === "auth-failed" && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Sign-in didn&rsquo;t complete. Enter your email below to try again.
            </div>
          )}
          {error === "link-failed" && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
              Something went wrong on our side. Try again, or email{" "}
              <a
                className="underline"
                href="mailto:success@fldentalassisting.com"
              >
                success@fldentalassisting.com
              </a>
              .
            </div>
          )}
          {error === "unexpected" && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
              Unexpected error. Refresh and try again.
            </div>
          )}
          {notice === "submitted" && !error && (
            <div className="mb-4 rounded-md border border-teal/30 bg-teal/5 px-3 py-2 text-xs text-navy">
              If that email is on file as a FIDA student, you&rsquo;ll be signed
              in. If not, email{" "}
              <a
                className="underline"
                href="mailto:success@fldentalassisting.com"
              >
                success@fldentalassisting.com
              </a>{" "}
              and we&rsquo;ll get you set up.
            </div>
          )}

          <Suspense
            fallback={<div className="text-sm text-muted">Loading…</div>}
          >
            <form
              method="POST"
              action="/api/portal/login"
              onSubmit={() => setSubmitting(true)}
              className="space-y-4"
            >
              <div className="rounded-md border border-teal/30 bg-teal/5 px-3 py-2.5 text-xs text-navy">
                <div className="font-semibold mb-0.5">
                  Sign in with your email
                </div>
                <div className="text-muted">
                  Use the email FIDA has on file. No password.
                </div>
              </div>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="your.email@example.com"
                className="w-full rounded-md border border-rule bg-white px-3 py-2.5 text-sm text-navy outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full disabled:opacity-50"
              >
                {submitting ? "Signing you in…" : "Sign In"}
              </button>
              <p className="text-xs text-subtle text-center">
                No code, no password &mdash; just the email FIDA has on file.
              </p>
            </form>
          </Suspense>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-muted transition-colors hover:text-teal"
          >
            ← Back to fldentalassisting.com
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <div className="text-muted text-sm">Loading…</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
