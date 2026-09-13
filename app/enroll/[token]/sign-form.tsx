"use client";

import { useMemo, useState, type ReactNode } from "react";
import { PAYMENT_PLANS, ESIGN_CONSENT, type PaymentPlan } from "@/lib/enrollment-agreement-text";
import { SEAT_DEPOSIT_DUE } from "@/lib/payment";

const INPUT =
  "w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20";
const LABEL = "block text-xs font-semibold text-navy mb-1";

type Defaults = { legal_name: string; email: string; phone: string; start_date: string };

function isMinor(dob: string): boolean {
  const m = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const eighteenth = new Date(+m[1] + 18, +m[2] - 1, +m[3]);
  return new Date() < eighteenth;
}

export function SignForm({
  token, defaults, cohorts, depositUrl, children,
}: {
  token: string;
  defaults: Defaults;
  cohorts: string[];
  depositUrl: string | null;
  children: ReactNode;
}) {
  const [f, setF] = useState({
    legal_name: defaults.legal_name,
    dob: "",
    email: defaults.email,
    phone: defaults.phone,
    address: "",
    emergency_contact: "",
    start_date: defaults.start_date || cohorts[0] || "",
    payment_plan: "" as PaymentPlan | "",
    military: false,
    signer_name: "",
    guardian_name: "",
    consent: false,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ depositUrl: string | null } | null>(null);

  const minor = useMemo(() => isMinor(f.dob), [f.dob]);
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    if (f.signer_name.trim().toLowerCase() !== f.legal_name.trim().toLowerCase()) {
      setErr("Your typed signature must match your legal name exactly.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/enroll/${token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) setErr(json.error || "Something went wrong. Please try again.");
      else {
        setDone({ depositUrl: json.depositUrl ?? null });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setErr("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="eyebrow">Signed</div>
        <h2 className="font-display text-2xl text-navy mt-1">Thank you, {f.legal_name.split(" ")[0]}!</h2>
        <p className="mt-3 text-sm text-muted max-w-md mx-auto">
          Your enrollment agreement is signed and on file. A copy is in your student record, and we&rsquo;ve emailed you the next step.
        </p>
        <div className="mt-6 card bg-paper-subtle p-5 max-w-md mx-auto text-left">
          <div className="font-semibold text-navy text-sm">Last step — secure your seat</div>
          <p className="text-sm text-muted mt-1">Pay the {SEAT_DEPOSIT_DUE} remainder of your seat deposit. Your $150 registration already counts toward it.</p>
          {done.depositUrl ? (
            <a href={done.depositUrl} target="_blank" rel="noreferrer" className="btn-primary inline-block mt-4">Pay the {SEAT_DEPOSIT_DUE} deposit</a>
          ) : (
            <p className="text-sm text-navy mt-3">Watch your inbox — the {SEAT_DEPOSIT_DUE} invoice will come from our QuickBooks account.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-navy mb-3">1. Student Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="legal_name">Full legal name</label>
            <input id="legal_name" className={INPUT} value={f.legal_name} onChange={(e) => set("legal_name", e.target.value)} autoComplete="name" required />
          </div>
          <div>
            <label className={LABEL} htmlFor="dob">Date of birth</label>
            <input id="dob" type="date" className={INPUT} value={f.dob} onChange={(e) => set("dob", e.target.value)} required />
          </div>
          <div>
            <label className={LABEL} htmlFor="phone">Phone</label>
            <input id="phone" type="tel" className={INPUT} value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" required />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="email">Email</label>
            <input id="email" type="email" className={INPUT} value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" required />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="address">Mailing address</label>
            <input id="address" className={INPUT} value={f.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" placeholder="Street, city, state, ZIP" required />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="emergency_contact">Emergency contact (name and phone)</label>
            <input id="emergency_contact" className={INPUT} value={f.emergency_contact} onChange={(e) => set("emergency_contact", e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="start_date">Class you&rsquo;re enrolling in</label>
            <select id="start_date" className={INPUT} value={f.start_date} onChange={(e) => set("start_date", e.target.value)}>
              {!cohorts.includes(f.start_date) && f.start_date && <option value={f.start_date}>{f.start_date}</option>}
              {cohorts.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </section>

      {children}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-navy mb-3">Payment plan</h2>
        <div className="space-y-2">
          {PAYMENT_PLANS.map((p) => (
            <label key={p.value} className="flex items-start gap-3 text-sm cursor-pointer">
              <input type="radio" name="payment_plan" className="mt-1" checked={f.payment_plan === p.value} onChange={() => set("payment_plan", p.value)} required />
              <span>{f.military ? p.military : p.label}</span>
            </label>
          ))}
          <label className="flex items-start gap-3 text-sm cursor-pointer pt-2">
            <input type="checkbox" className="mt-1" checked={f.military} onChange={(e) => set("military", e.target.checked)} />
            <span>I&rsquo;m an eligible military member, veteran, or first responder and will provide a military ID or DD214 (applies the $1,500 tuition incentive).</span>
          </label>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-navy mb-3">9. Signature</h2>
        <p className="text-xs text-subtle mb-4">{ESIGN_CONSENT}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="signer_name">Type your full legal name to sign</label>
            <input id="signer_name" className={`${INPUT} font-display text-xl`} value={f.signer_name} onChange={(e) => set("signer_name", e.target.value)} placeholder={f.legal_name || "Your legal name"} autoComplete="off" required />
          </div>
          {minor && (
            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="guardian_name">Parent or guardian — type your full name to sign (student is under 18)</label>
              <input id="guardian_name" className={`${INPUT} font-display text-xl`} value={f.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} autoComplete="off" required />
            </div>
          )}
          <label className="sm:col-span-2 flex items-start gap-3 text-sm cursor-pointer">
            <input type="checkbox" className="mt-1" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} required />
            <span>I have read this agreement and agree to sign it electronically.</span>
          </label>
        </div>
        {err && <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{err}</div>}
        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full sm:w-auto disabled:opacity-50">
          {busy ? "Signing…" : "Sign enrollment agreement"}
        </button>
        <p className="mt-3 text-xs text-subtle">Date and time are recorded when you click Sign. You&rsquo;ll get a copy of the signed agreement in your student file.</p>
      </section>
    </form>
  );
}
