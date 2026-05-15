"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GoogleSignInButton() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const error = searchParams.get("error");

  const handleSignIn = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          Sign-in failed. Please try again or contact your administrator.
        </div>
      )}
      <button
        onClick={handleSignIn}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-rule bg-white px-4 py-3 text-sm font-medium text-navy shadow-sm transition-colors hover:bg-paper-subtle"
      >
        <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </button>
    </>
  );
}

function PasswordSignInForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  return (
    <form action="/api/admin/login" method="POST" className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <input
        type="password"
        name="password"
        placeholder="Admin password"
        required
        autoComplete="current-password"
        className="w-full rounded-md border border-rule bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-teal"
      />
      <button
        type="submit"
        className="w-full rounded-md bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Sign in with password
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
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
          <div className="eyebrow mt-1">Live platform preview</div>
        </div>

        <div className="card bg-white p-6">
          <p className="mb-5 text-center text-sm text-muted">
            Sign in with your Google account to explore the school dashboard.
          </p>
          <Suspense fallback={
            <div className="flex w-full items-center justify-center gap-3 rounded-md border border-rule bg-white px-4 py-3 text-sm font-medium text-navy opacity-50">
              Loading&hellip;
            </div>
          }>
            <GoogleSignInButton />
          </Suspense>

          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <div className="h-px flex-1 bg-rule" />
            <span className="uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-rule" />
          </div>

          <Suspense fallback={null}>
            <PasswordSignInForm />
          </Suspense>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-muted transition-colors hover:text-teal">
            &larr; Back to public site
          </a>
        </div>
      </div>
    </div>
  );
}
