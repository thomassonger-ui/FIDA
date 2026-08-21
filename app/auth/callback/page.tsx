"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

type OtpType = "magiclink" | "signup" | "email" | "recovery" | "invite";

/**
 * Bridge the freshly-verified Supabase session into the portal's DB-backed
 * session (sets fida_portal_session). Returns where to send the user next:
 * the requested page on success, or /portal/login with a reason on failure.
 */
async function finalize(next: string): Promise<string> {
  try {
    const res = await fetch("/api/auth/finalize", { method: "POST" });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; reason?: string };
    if (res.ok && body.ok) return next;
    const reason = body.reason === "not-active" ? "not-active" : "auth-failed";
    return `/portal/login?error=${reason}`;
  } catch {
    return "/portal/login?error=auth-failed";
  }
}

function isOtpType(v: string | null): v is OtpType {
  return (
    v === "magiclink" ||
    v === "signup" ||
    v === "email" ||
    v === "recovery" ||
    v === "invite"
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/portal";

  useEffect(() => {
    async function run() {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) {
        router.replace("/portal/login?error=supabase-not-configured");
        return;
      }
      const supabase = createBrowserClient(url, key);

      // 1) Implicit flow — Supabase put tokens in the URL fragment
      const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : "";
      if (hash) {
        const params = new URLSearchParams(hash);
        const errorDescription = params.get("error_description");
        if (errorDescription) {
          router.replace(
            `/portal/login?error=${encodeURIComponent(errorDescription)}`
          );
          return;
        }
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (!error) {
            router.replace(await finalize(next));
            return;
          }
        }
      }

      // 2) PKCE flow — Supabase put a code in the query string.
      //    Requires a matching code_verifier in this browser's local storage,
      //    which is set when signInWithOtp() was called from the browser.
      const code = sp.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.replace(await finalize(next));
          return;
        }
      }

      // 3) Email-confirmation flow — Supabase put token_hash + type in the
      //    query string. This is what the modern email templates emit when
      //    using {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type={{ .Type }}.
      const tokenHash = sp.get("token_hash");
      const type = sp.get("type");
      if (tokenHash && isOtpType(type)) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });
        if (!error) {
          router.replace(await finalize(next));
          return;
        }
      }

      // 4) Surfaced error in the query string (e.g. ?error=access_denied)
      const queryError = sp.get("error_description") || sp.get("error");
      if (queryError) {
        router.replace(
          `/portal/login?error=${encodeURIComponent(queryError)}`
        );
        return;
      }

      // 5) Nothing usable — back to login
      router.replace("/portal/login?error=auth-failed");
    }
    run();
  }, [router, sp, next]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="text-center">
        <div className="font-display text-2xl text-navy mb-2">Signing you in…</div>
        <div className="text-xs text-muted">This should only take a second.</div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <div className="text-muted text-sm">Loading…</div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
