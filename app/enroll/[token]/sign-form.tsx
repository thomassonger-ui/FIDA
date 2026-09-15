"use client";

import { useMemo, useState } from "react";
import * as T from "@/lib/enrollment-agreement-text";
import { scheduleFor } from "@/lib/enrollment-schedule";
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-bold text-navy uppercase tracking-wide mb-3">{title}</h2>
      <div className="text-sm text-ink leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export function SignForm({
  token, defaults, cohorts,
}: {
  token: string;
  defaults: Defaults;
  cohorts: string[];
  depositUrl: string | null;
}) {
  const [f, setF] = useState({
    legal_name: defaults.legal_name,
    dob: "",
    email: defaults.email,
    address: "",
    city_state_zip: "",
    phone_home: "",
    phone_cell: defaults.phone,
    phone_work: "",
    emergency_name: "",
    emergency_relationship: "",
    emergency_phone: "",
    start_date: cohorts.includes(defaults.start_date) ? defaults.start_date : cohorts[0] || "",
    payment_plan: "" as T.PaymentPlan | "",
    military_spouse: false,
    initials: { termination: "", understands: "", catalog: "", employment: "" } as Record<T.InitialKey, string>,
    signer_name: "",
    guardian_name: "",
    consent: false,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<{ depositUrl: string | null } | null>(null);

  const minor = useMemo(() => isMinor(f.dob), [f.dob]);
  const sched = useMemo(() => scheduleFor(f.start_date), [f.start_date]);
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const setInitial = (k: T.InitialKey, v: string) =>
    setF((p) => ({ ...p, initials: { ...p.initials, [k]: v.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4) } }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    if (f.signer_name.trim().toLowerCase() !== f.legal_name.trim().toLowerCase()) {
      setErr("Your typed signature must match your legal name exactly.");
      return;
    }
    for (const k of T.INITIAL_KEYS) {
      if (f.initials[k].length < 2) {
        setErr("Please type your initials in each of the four “Student Initial” boxes.");
        return;
      }
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
          Your enrollment agreement is signed and on file. A copy is on its way to your inbox, and you&rsquo;ll receive the fully executed copy once the school signs.
        </p>
        <div className="mt-6 card bg-paper-subtle p-5 max-w-md mx-auto text-left">
          <div className="font-semibold text-navy text-sm">Last step &mdash; secure your seat</div>
          <p className="text-sm text-muted mt-1">Pay the {SEAT_DEPOSIT_DUE} deposit (applied toward tuition).</p>
          {done.depositUrl ? (
            <a href={done.depositUrl} target="_blank" rel="noreferrer" className="btn-primary inline-block mt-4">Pay the {SEAT_DEPOSIT_DUE} deposit</a>
          ) : (
            <p className="text-sm text-navy mt-3">Watch your inbox &mdash; the {SEAT_DEPOSIT_DUE} invoice will come from our QuickBooks account.</p>
          )}
        </div>
      </div>
    );
  }

  const initialBox = (k: T.InitialKey) => (
    <div className="flex items-center justify-end gap-3 pt-1">
      <label htmlFor={`initial_${k}`} className="text-xs font-semibold text-navy">Student Initial</label>
      <input
        id={`initial_${k}`}
        className={`${INPUT} !w-28 text-center font-display text-lg uppercase`}
        value={f.initials[k]}
        onChange={(e) => setInitial(k, e.target.value)}
        placeholder="AB"
        maxLength={4}
        autoComplete="off"
        required
      />
    </div>
  );

  const field = ({ id, label, span = false, ...rest }: { id: keyof typeof f; label: string; span?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className={span ? "sm:col-span-2" : ""}>
      <label className={LABEL} htmlFor={id}>{label}</label>
      <input id={id} className={INPUT} value={String(f[id])} onChange={(e) => set(id, e.target.value)} {...rest} />
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <Section title="Student Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field({ id: "legal_name", label: "Student name (full legal name)", span: true, autoComplete: "name", required: true })}
          {field({ id: "dob", label: "Date of birth", type: "date", required: true })}
          {field({ id: "email", label: "E-mail", type: "email", autoComplete: "email", required: true })}
          {field({ id: "address", label: "Address", span: true, autoComplete: "street-address", required: true })}
          {field({ id: "city_state_zip", label: "City / State / ZIP", span: true, placeholder: "Jacksonville, FL 32216", required: true })}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {field({ id: "phone_home", label: "Telephone — Home", type: "tel" })}
            {field({ id: "phone_cell", label: "Telephone — Cell", type: "tel", autoComplete: "tel", required: true })}
            {field({ id: "phone_work", label: "Telephone — Work", type: "tel" })}
          </div>
          <p className="sm:col-span-2 text-xs text-subtle">Social Security number is collected in person at orientation &mdash; never on this form.</p>
          {field({ id: "emergency_name", label: "Emergency contact", span: true, required: true })}
          {field({ id: "emergency_relationship", label: "Relationship", required: true })}
          {field({ id: "emergency_phone", label: "Emergency contact telephone", type: "tel", required: true })}
        </div>
      </Section>

      <Section title="Program Information">
        <div>
          <label className={LABEL} htmlFor="start_date">Class you&rsquo;re enrolling in</label>
          <select id="start_date" className={INPUT} value={f.start_date} onChange={(e) => set("start_date", e.target.value)} required>
            {cohorts.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-x-4 gap-y-1.5 mt-2">
          <dt className="font-semibold">Date of admission</dt><dd>Date you sign below</dd>
          <dt className="font-semibold">Program</dt><dd>{T.PROGRAM.title}</dd>
          <dt className="font-semibold">Program start date</dt><dd>{sched?.start_date ?? "—"}</dd>
          <dt className="font-semibold">Anticipated end date</dt><dd>{sched?.anticipated_end ?? "—"}</dd>
          <dt className="font-semibold">Class time</dt><dd>{sched?.class_time ?? "—"}</dd>
          <dt className="font-semibold">Days class meets</dt><dd>{sched?.days ?? "—"}</dd>
          <dt className="font-semibold">Time of day class begins</dt><dd>{sched?.begins ?? "—"}</dd>
          <dt className="font-semibold">Time of day class ends</dt><dd>{sched?.ends ?? "—"}</dd>
          <dt className="font-semibold">Program length</dt><dd>{T.PROGRAM.length}.</dd>
          <dt className="font-semibold">Total clock hours</dt><dd>{T.PROGRAM.clockHours}</dd>
          <dt className="font-semibold">Class schedule</dt><dd>{T.PROGRAM.schedule}</dd>
        </dl>
      </Section>

      <Section title="Total Program Cost">
        <p className="font-semibold">The total cost of the {T.PROGRAM.title} program</p>
        <table className="w-full text-sm max-w-md">
          <tbody>
            {T.FEES.map((x) => (
              <tr key={x.item} className="border-t border-rule"><td className="py-1.5 pr-4">{x.item}</td><td className="py-1.5 text-right whitespace-nowrap">{x.amount}</td></tr>
            ))}
            <tr className="border-t-2 border-navy font-bold"><td className="py-1.5 pr-4">{T.FEES_TOTAL.item}</td><td className="py-1.5 text-right">{T.FEES_TOTAL.amount}</td></tr>
          </tbody>
        </table>
        <p className="font-semibold mt-4">Tuition fee includes</p>
        <ul className="list-disc pl-6 space-y-1">
          {T.TUITION_INCLUDES.map((l) => <li key={l}>{l}</li>)}
        </ul>
      </Section>

      <Section title="Methods of Payment">
        <p className="font-semibold">In-house payment plans:</p>
        <ol className="list-decimal pl-6 space-y-1">
          {T.IN_HOUSE_PLANS.map((l) => <li key={l}>{l}</li>)}
        </ol>
        <p className="font-semibold">Third party loan program:</p>
        <p>{T.THIRD_PARTY_LOAN}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-rule">
            <thead><tr>{T.TILA_BOX.map((b) => <th key={b.head} className="border border-rule p-2 text-left align-top font-semibold">{b.head}</th>)}</tr></thead>
            <tbody><tr>{T.TILA_BOX.map((b) => <td key={b.head} className="border border-rule p-2 align-top text-muted">{b.body}</td>)}</tr></tbody>
          </table>
        </div>
        <p className="font-semibold">{T.TILA_SCHEDULE_HEAD}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-rule">
            <thead><tr>{T.TILA_SCHEDULE_COLS.map((c) => <th key={c} className="border border-rule p-2 text-left font-semibold">{c}</th>)}</tr></thead>
            <tbody><tr>{T.TILA_SCHEDULE_COLS.map((c) => <td key={c} className="border border-rule p-3">&nbsp;</td>)}</tr></tbody>
          </table>
        </div>
        <p>{T.NO_CARRYING_CHARGES}</p>
        <div className="card bg-paper-subtle p-4 mt-2">
          <div className="font-semibold text-navy mb-2">Choose your payment plan</div>
          <div className="space-y-2">
            {T.PAYMENT_PLANS.map((p) => (
              <label key={p.value} className="flex items-start gap-3 text-sm cursor-pointer">
                <input type="radio" name="payment_plan" className="mt-1" checked={f.payment_plan === p.value} onChange={() => set("payment_plan", p.value)} required />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Non-Discrimination Policy"><p>{T.NON_DISCRIMINATION}</p></Section>

      <Section title={T.MILITARY_HEADING}>
        <p>{T.MILITARY_NOTE}</p>
        <label className="flex items-start gap-3 text-sm cursor-pointer">
          <input type="checkbox" className="mt-1" checked={f.military_spouse} onChange={(e) => set("military_spouse", e.target.checked)} />
          <span>I am the spouse of an active-duty military member or first responder and will provide proof to qualify for the $1,500 reduction.</span>
        </label>
      </Section>

      <Section title="Refund Policy">
        <p>{T.REFUND_INTRO}</p>
        <ol className="list-decimal pl-6 space-y-2">
          {T.REFUND_SCHEDULE.map((l) => <li key={l}>{l}</li>)}
        </ol>
      </Section>

      <Section title="Withdrawal Policy"><p>{T.WITHDRAWAL_POLICY}</p></Section>

      <Section title="Grounds for Termination">
        <p>{T.GROUNDS_FOR_TERMINATION}</p>
        {initialBox("termination")}
      </Section>

      <Section title="The Student Understands">
        <ol className="list-decimal pl-6 space-y-2">
          {T.STUDENT_UNDERSTANDS.map((l) => <li key={l}>{l}</li>)}
        </ol>
        {initialBox("understands")}
      </Section>

      <Section title="Student Acknowledgements">
        <p>{T.CATALOG_ACKNOWLEDGEMENT}</p>
        {initialBox("catalog")}
      </Section>

      <Section title="Employment Assistance">
        <p>{T.EMPLOYMENT_ASSISTANCE}</p>
        {initialBox("employment")}
      </Section>

      <Section title="Contract Acceptance">
        <p>{T.ENTIRE_AGREEMENT}</p>
        <p className="font-bold">{T.NOTICE_TO_PROSPECTIVE_STUDENTS}</p>
        {T.CONTRACT_ACCEPTANCE.map((p) => <p key={p}>{p}</p>)}
      </Section>

      <section className="mt-8">
        <h2 className="text-base font-bold text-navy uppercase tracking-wide mb-3">Signature</h2>
        <p className="text-xs text-subtle mb-4">{T.ESIGN_CONSENT}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="signer_name">Signature of Student &mdash; type your full legal name</label>
            <input id="signer_name" className={`${INPUT} font-display text-xl`} value={f.signer_name} onChange={(e) => set("signer_name", e.target.value)} placeholder={f.legal_name || "Your legal name"} autoComplete="off" required />
          </div>
          {minor && (
            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="guardian_name">Parent or guardian &mdash; type your full name to sign (student is under 18)</label>
              <input id="guardian_name" className={`${INPUT} font-display text-xl`} value={f.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} autoComplete="off" required />
            </div>
          )}
          <label className="sm:col-span-2 flex items-start gap-3 text-sm cursor-pointer">
            <input type="checkbox" className="mt-1" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} required />
            <span>I have read this agreement and the school catalog, and I agree to sign electronically.</span>
          </label>
        </div>
        {err && <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{err}</div>}
        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full sm:w-auto disabled:opacity-50">
          {busy ? "Signing…" : "Sign enrollment agreement"}
        </button>
        <p className="mt-3 text-xs text-subtle">The date and time are recorded when you click Sign. The School Official signs after you, and you&rsquo;ll be emailed the fully executed copy.</p>
      </section>
    </form>
  );
}
