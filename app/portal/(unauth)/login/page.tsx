"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function LoginForm() {
  const sp = useSearchParams();
  const error = sp.get("error");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSendError(null);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim().toLowerCase();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      setSendError("Portal not configured. Email success@fldentalassisting.com.");
      setSubmitting(false);
      return;
    }

    // Browser-initiated so the PKCE code_verifier is stored locally.
    // When the user clicks the email link, the callback's
    // exchangeCodeForSession() will be able to find this verifier.
    const supabase = createBrowserClient(url, key);
    const redirectTo = `${window.location.origin}/auth/callback?next=/portal`;

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo,
      },
    });

    if (otpError) {
      // Friendly handling for the most common free-tier error.
      const msg = otpError.message.toLowerCase();
      if (msg.includes("rate") || msg.includes("seconds")) {
        setSendError(
          "Please wait at least 1 minute between sign-in link requests."
        );
      } else {
        setSendError(otpError.message);
      }
      setSubmitting(false);
      return;
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
          Your new sign-in link should arrive within a few minutes. Each link is
          single-use &mdash; if it stops working, come back here and request another.
        </p>
        <p className="text-xs text-subtle mt-3 italic">
          Tip: if you don&rsquo;t see it within 10 minutes, check spam. Please wait
          at least 1 minute before requesting another link.
        </p>
        <p className="text-xs text-subtle mt-3">
          Important: open the email link in <strong>this same browser</strong> so the
          sign-in finishes correctly.
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
      {error === "auth-failed" && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          That sign-in link didn&rsquo;t complete. Request a new one below and
          open the email in the same browser.
        </div>
      )}
      {sendError && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
          {sendError}
        </div>
      )}
      <div className="rounded-md border border-teal/30 bg-teal/5 px-3 py-2.5 text-xs text-navy">
        <div className="font-semibold mb-0.5">
          Forgot your sign-in link or it expired?
        </div>
        <div className="text-muted">
          Enter the email FIDA has on file. We&rsquo;ll email you a fresh one-click link.
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
        {submitting ? "Sending…" : "Send me a sign-in link"}
      </button>
      <p className="text-xs text-subtle text-center">
        <span className="font-semibold text-muted">No password to forget.</span>{" "}
        Type your email anytime to get a new sign-in link.
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
