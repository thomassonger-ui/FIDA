"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { register as r } from "@/lib/i18n/register";
import { cohortOptions } from "@/lib/enrollment-schedule";
import { SignForm } from "@/app/enroll/[token]/sign-form";

/**
 * In-page application + enrollment agreement.
 *
 * The visitor gives four details, we open an agreement for them server-side,
 * and the existing SignForm renders inline — so the whole application and
 * e-signature happen without leaving /register.
 *
 * This is FIDA's own flow, which is why it can live in a modal at all. The
 * QuickBooks payment cannot: Intuit sends x-frame-options SAMEORIGIN, so their
 * page has to open in its own tab (see RegisterContent).
 */
export function ApplicationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLang();
  const m = r.modal;

  const [phase, setPhase] = useState<"intro" | "agreement">("intro");
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({ full_name: "", email: "", phone: "", cohort_id: "", company: "" });

  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const cohorts = cohortOptions();

  /* Lock the page behind the modal and put focus in the first field. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(id);
    };
  }, [open]);

  /* Esc closes, but never silently discards a part-filled agreement. */
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      attemptClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function attemptClose() {
    const dirty = phase === "agreement" || f.full_name !== "" || f.email !== "";
    if (dirty && !window.confirm(t(m.leaveWarning))) return;
    reset();
    onClose();
  }

  function reset() {
    setPhase("intro");
    setToken(null);
    setBusy(false);
    setError(null);
    setF({ full_name: "", email: "", phone: "", cohort_id: "", company: "" });
  }

  async function submitIntro(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (f.full_name.trim().length < 2) return setError(t(m.errorName));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) return setError(t(m.errorEmail));

    setBusy(true);
    try {
      const res = await fetch("/api/register/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = (await res.json()) as { token?: string | null; error?: string };

      if (res.status === 409 || data.error === "already_signed") {
        setError(t(m.alreadySigned));
        return;
      }
      if (!res.ok || !data.token) {
        setError(data.error && res.status === 400 ? data.error : t(m.errorGeneric));
        return;
      }
      setToken(data.token);
      setPhase("agreement");
      panelRef.current?.scrollTo({ top: 0 });
    } catch {
      setError(t(m.errorGeneric));
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const field =
    "mt-1 w-full rounded-md border border-rule bg-white px-3 py-2 text-navy " +
    "focus:outline-none focus:ring-2 focus:ring-teal/50";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/60 px-4 py-6 md:py-10"
      role="dialog"
      aria-modal="true"
      aria-label={t(m.title)}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) attemptClose();
      }}
    >
      <div
        ref={panelRef}
        className="w-full max-w-3xl rounded-lg bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header stays put while the agreement scrolls. */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-lg border-b border-rule bg-white px-5 py-4 md:px-8">
          <h2 className="font-display text-xl text-navy md:text-2xl">{t(m.title)}</h2>
          <button
            type="button"
            onClick={attemptClose}
            className="rounded px-2 py-1 text-sm font-semibold text-muted hover:bg-paper-subtle hover:text-navy"
          >
            {t(m.close)} <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="px-5 py-6 md:px-8 md:py-8">
          {phase === "intro" ? (
            <form onSubmit={submitIntro} noValidate>
              <h3 className="font-display text-2xl text-navy">{t(m.introHeading)}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{t(m.introBody)}</p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2 text-sm font-semibold text-navy">
                  {t(m.fullName)}
                  <input
                    ref={firstFieldRef}
                    className={field}
                    value={f.full_name}
                    onChange={(e) => setF({ ...f, full_name: e.target.value })}
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="block text-sm font-semibold text-navy">
                  {t(m.email)}
                  <input
                    className={field}
                    type="email"
                    value={f.email}
                    onChange={(e) => setF({ ...f, email: e.target.value })}
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="block text-sm font-semibold text-navy">
                  {t(m.phone)}
                  <input
                    className={field}
                    type="tel"
                    value={f.phone}
                    onChange={(e) => setF({ ...f, phone: e.target.value })}
                    autoComplete="tel"
                  />
                </label>

                <label className="block sm:col-span-2 text-sm font-semibold text-navy">
                  {t(m.cohort)}
                  <select
                    className={field}
                    value={f.cohort_id}
                    onChange={(e) => setF({ ...f, cohort_id: e.target.value })}
                  >
                    <option value="">{t(m.cohortAny)}</option>
                    {cohorts.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Honeypot — hidden from people, irresistible to bots. */}
              <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
                <label>
                  Company
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={f.company}
                    onChange={(e) => setF({ ...f, company: e.target.value })}
                  />
                </label>
              </div>

              {error ? (
                <p role="alert" className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </p>
              ) : null}

              <button type="submit" disabled={busy} className="btn-primary mt-6 w-full disabled:opacity-60">
                {busy ? t(m.working) : t(m.submit)} <span aria-hidden="true">→</span>
              </button>
            </form>
          ) : token ? (
            <SignForm
              token={token}
              defaults={{
                legal_name: f.full_name,
                email: f.email,
                phone: f.phone,
                start_date: f.cohort_id,
              }}
              cohorts={cohorts}
              depositUrl={null}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
