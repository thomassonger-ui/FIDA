"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

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
            // Also set the site-gate cookie so the rest of the app is reachable.
            await fetch("/api/auth/finalize", { method: "POST" }).catch(() => {});
            router.replace(next);
            return;
          }
        }
      }

      // 2) PKCE flow — Supabase put a code in the query string
      const code = sp.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          await fetch("/api/auth/finalize", { method: "POST" }).catch(() => {});
          router.replace(next);
          return;
        }
      }

      // 3) Nothing usable — back to login
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
