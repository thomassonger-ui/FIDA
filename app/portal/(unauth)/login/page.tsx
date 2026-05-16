"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const sp = useSearchParams();
  const error = sp.get("error");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      await fetch("/api/portal/login", { method: "POST", body: fd });
    } catch {
      /* swallow */
    }
    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="card p-6 border-teal/40 bg-teal/5 text-center">
        <div className="eyebrow mb-2">Check your email</div>
        <h3 className="font-display text-xl text-navy mb-2">Link sent.</h3>
        <p className="text-sm text-muted">
          We sent a sign-in link to your inbox. Click it to land in your portal.
          The link is good for one click.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error === "supabase-not-configured" && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          The portal isn&rsquo;t fully wired yet. Contact{" "}
          <a className="underline" href="mailto:success@fldentalassisting.com">
            success@fldentalassisting.com
          </a>{" "}
          to get set up.
        </div>
      )}
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
        {submitting ? "Sending…" : "Send me a sign-in link"}
      </button>
      <p className="text-xs text-subtle text-center">
        No password needed. We&rsquo;ll email you a one-click link.
      </p>
    </form>
  );
}

export default function PortalLoginPage() {
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
          <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
            <LoginForm />
          </Suspense>
        </div>
        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-muted transition-colors hover:text-teal">
            ← Back to fldentalassisting.com
          </a>
        </div>
      </div>
    </div>
  );
}
