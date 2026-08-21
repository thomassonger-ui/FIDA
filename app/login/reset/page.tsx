"use client";

import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Stage = "checking" | "ready" | "submitting" | "success" | "no-session";

/**
 * /login/reset — choose a new admin password.
 *
 * Accepts every link shape Supabase can emit, so the page works regardless of
 * which browser the reset was requested from:
 *
 *   1. ?token_hash=…&type=recovery  — what the email template should send
 *      ({{ .SiteURL }}/login/reset?token_hash={{ .TokenHash }}&type=recovery).
 *      Verified server-side by Supabase; no browser state needed. This is the
 *      one that survives "requested in Chrome, clicked in Safari".
 *   2. ?code=…                       — PKCE flow from {{ .ConfirmationURL }}.
 *      Only works in the SAME browser that requested the reset, because the
 *      code_verifier lives in that browser's storage.
 *   3. #access_token=…&type=recovery — legacy implicit flow.
 *
 * Previously only (3) was handled, plus a 2-second getSession() fallback that
 * raced the PKCE exchange — so (2) failed intermittently and (1) always did.
 */
function ResetPasswordForm() {
  const sp = useSearchParams();
  const [stage, setStage] = useState<Stage>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    let cancelled = false;
    const done = (s: Stage) => {
      if (!cancelled) setStage(s);
    };

    async function establishSession() {
      // (1) token_hash — browser-independent.
      const tokenHash = sp.get("token_hash");
      const type = sp.get("type");
      if (tokenHash && type === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (!error) return done("ready");
        console.warn("[reset] verifyOtp failed:", error.message);
        return done("no-session");
      }

      // (2) PKCE code — same-browser only.
      const code = sp.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return done("ready");
        console.warn("[reset] exchangeCodeForSession failed:", error.message);
        return done("no-session");
      }

      // (3) Implicit hash — supabase-js consumes it on init; wait for the event.
      if (window.location.hash.includes("access_token")) {
        const { data } = supabase.auth.onAuthStateChange((event) => {
          if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
            data.subscription.unsubscribe();
            done("ready");
          }
        });
        // Safety net if the event already fired before we subscribed.
        setTimeout(async () => {
          const { data: sess } = await supabase.auth.getSession();
          done(sess.session ? "ready" : "no-session");
        }, 1500);
        return;
      }

      // No token in the URL at all — maybe a session already exists
      // (e.g. the user refreshed this page after verifying).
      const { data: sess } = await supabase.auth.getSession();
      done(sess.session ? "ready" : "no-session");
    }

    establishSession().catch((err) => {
      console.error("[reset] threw", err);
      done("no-session");
    });
    return () => {
      cancelled = true;
    };
  }, [sp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg("");
    if (password.length < 8) {
      setErrMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErrMsg("Passwords don't match.");
      return;
    }
    setStage("submitting");
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrMsg(error.message);
        setStage("ready");
        return;
      }
      // Sign out of the recovery session so the user has to re-auth fresh.
      await supabase.auth.signOut();
      setStage("success");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Unknown error");
      setStage("ready");
    }
  };

  return (
    <div className="card bg-white p-6">
      {stage === "checking" && (
        <p className="text-center text-sm text-muted">Verifying reset link&hellip;</p>
      )}

      {stage === "no-session" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            This reset link is invalid or has expired. Request a new one to
            continue.
          </div>
          <Link
            href="/login/forgot"
            className="w-full rounded-md bg-navy px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
          >
            Request new reset link
          </Link>
          <Link
            href="/login"
            className="mt-1 text-center text-xs text-muted hover:text-teal"
          >
            ← Back to sign in
          </Link>
        </div>
      )}

      {stage === "success" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
            Password updated. You can now sign in with your new password.
          </div>
          <Link
            href="/login"
            className="w-full rounded-md bg-navy px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
          >
            Sign in
          </Link>
        </div>
      )}

      {(stage === "ready" || stage === "submitting") && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <p className="mb-2 text-sm text-muted">
            Choose a new password for your FIDA admin account. Must be at
            least 8 characters.
          </p>
          {errMsg && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {errMsg}
            </div>
          )}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            required
            autoComplete="new-password"
            disabled={stage === "submitting"}
            className="w-full rounded-md border border-rule bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-teal disabled:opacity-50"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            required
            autoComplete="new-password"
            disabled={stage === "submitting"}
            className="w-full rounded-md border border-rule bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-teal disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={stage === "submitting" || !password || !confirm}
            className="w-full rounded-md bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {stage === "submitting" ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
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
          <div className="eyebrow mt-1">Choose a new password</div>
        </div>
        <Suspense
          fallback={
            <div className="card bg-white p-6">
              <p className="text-center text-sm text-muted">Loading…</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
