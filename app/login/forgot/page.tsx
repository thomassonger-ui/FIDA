"use client";

import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setStatus("idle");
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/login/reset`,
        }
      );
      if (error) {
        // We deliberately still show "sent" to avoid leaking which emails exist.
        console.warn("[forgot] resetPasswordForEmail error", error.message);
      }
      setStatus("sent");
    } catch (err) {
      console.error("[forgot] threw", err);
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fida-shield.png"
            alt="FIDA"
            className="mb-4 inline-block h-12 w-12 object-contain"
          />
          <div className="font-display text-2xl text-navy">FIDA</div>
          <div className="eyebrow mt-1">Reset password</div>
        </div>

        <div className="card bg-white p-6">
          {status === "sent" ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
                If an account exists for <strong>{email}</strong>, a password
                reset link has been emailed to that address. Click the link in
                the email to choose a new password.
              </div>
              <p className="text-xs text-muted">
                The link expires in 1 hour. Check your spam folder if you
                don&rsquo;t see it within a few minutes.
              </p>
              <Link
                href="/login"
                className="text-center text-xs text-teal hover:text-teal-deep"
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <p className="mb-2 text-sm text-muted">
                Enter the email address on your FIDA admin account. We&rsquo;ll
                send you a link to set a new password.
              </p>
              {status === "error" && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                  Something went wrong: {errMsg}
                </div>
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                disabled={submitting}
                className="w-full rounded-md border border-rule bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-teal disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="w-full rounded-md bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Sending…" : "Send reset link"}
              </button>
              <Link
                href="/login"
                className="mt-2 text-center text-xs text-muted hover:text-teal"
              >
                ← Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
