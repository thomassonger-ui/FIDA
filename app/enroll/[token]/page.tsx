import type { Metadata } from "next";
import { getAgreementByToken } from "@/lib/enrollment";
import * as T from "@/lib/enrollment-agreement-text";
import { SEAT_DEPOSIT_DUE } from "@/lib/payment";
import { COHORTS } from "@/lib/cohort";
import { SignForm } from "./sign-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Enrollment Agreement — FIDA",
  robots: { index: false, follow: false },
};

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-navy mb-3">{n}. {title}</h2>
      <div className="text-sm text-ink leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="min-h-screen bg-paper px-4 py-10 md:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fida-logo.png" alt="Florida Institute of Dental Assisting" className="mx-auto h-14 w-auto" />
          <div className="mt-3 text-xs text-subtle">{T.SCHOOL.address} · {T.SCHOOL.phone} · {T.SCHOOL.email}</div>
          <div className="mt-1 text-xs text-subtle">{T.SCHOOL.license}</div>
        </div>
        {children}
      </div>
    </main>
  );
}

export default async function EnrollPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await getAgreementByToken(token);

  if (!found) {
    return (
      <Shell>
        <div className="card bg-white p-8 text-center">
          <h1 className="font-display text-2xl text-navy">This link isn&rsquo;t valid</h1>
          <p className="mt-3 text-sm text-muted">Check the link in your email, or contact us at {T.SCHOOL.email} and we&rsquo;ll send a fresh one.</p>
        </div>
      </Shell>
    );
  }

  const { agreement, student } = found;
  const depositUrl = process.env.QBO_DEPOSIT_URL?.trim() || null;

  if (agreement.status === "signed") {
    return (
      <Shell>
        <div className="card bg-white p-8 text-center">
          <h1 className="font-display text-2xl text-navy">Already signed — thank you</h1>
          <p className="mt-3 text-sm text-muted">
            Your enrollment agreement was signed on {new Date(agreement.signed_at!).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} and is on file.
          </p>
          {depositUrl ? (
            <a href={depositUrl} target="_blank" rel="noreferrer" className="btn-primary inline-block mt-6">Pay the {SEAT_DEPOSIT_DUE} seat deposit</a>
          ) : (
            <p className="mt-4 text-sm text-muted">Watch your email for the {SEAT_DEPOSIT_DUE} deposit invoice.</p>
          )}
        </div>
      </Shell>
    );
  }

  const expired = agreement.status === "void" || new Date(agreement.expires_at) < new Date();
  if (expired) {
    return (
      <Shell>
        <div className="card bg-white p-8 text-center">
          <h1 className="font-display text-2xl text-navy">This link has expired</h1>
          <p className="mt-3 text-sm text-muted">Email {T.SCHOOL.email} or call {T.SCHOOL.phone} and we&rsquo;ll send you a new signing link.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="card bg-white p-6 md:p-10">
        <div className="text-center">
          <div className="eyebrow">Please review and sign</div>
          <h1 className="font-display text-3xl text-navy mt-1">Enrollment Agreement</h1>
          <div className="mt-1 text-sm text-muted">{T.PROGRAM.title}</div>
        </div>

        <SignForm
          token={token}
          defaults={{
            legal_name: student.full_name ?? "",
            email: student.email,
            phone: student.phone ?? "",
            start_date: student.start_date ?? "",
          }}
          cohorts={COHORTS.map((c) => `${c.date.en} — ${c.label.en} (${c.schedule.en})`)}
          depositUrl={depositUrl}
        >
        <Section n={2} title="Program Information">
          <dl className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-x-4 gap-y-2">
            <dt className="font-semibold">Program</dt><dd>{T.PROGRAM.title}</dd>
            <dt className="font-semibold">Credential awarded</dt><dd>{T.PROGRAM.credential}</dd>
            <dt className="font-semibold">Program length</dt><dd>{T.PROGRAM.length}</dd>
            <dt className="font-semibold">Delivery</dt><dd>{T.PROGRAM.delivery}</dd>
          </dl>
        </Section>

        <Section n={3} title="Tuition and Fees">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-paper-subtle text-left">
                  <th className="p-2 font-semibold">Item</th>
                  <th className="p-2 font-semibold">Amount</th>
                  <th className="p-2 font-semibold">When due</th>
                </tr>
              </thead>
              <tbody>
                {T.FEES.map((f) => (
                  <tr key={f.item} className="border-t border-rule align-top">
                    <td className="p-2">{f.item}</td>
                    <td className="p-2 whitespace-nowrap">{f.amount}</td>
                    <td className="p-2 text-muted">{f.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-subtle">{T.FEES_NOTE}</p>
          <p><span className="font-semibold">Military / first responder incentive:</span> {T.MILITARY_NOTE}</p>
          <p>{T.PAYMENT_METHODS}</p>
        </Section>

        <Section n={4} title="Cancellation and Refund Policy">
          <p>{T.REFUND_INTRO}</p>
          <ol className="list-decimal pl-6 space-y-2">
            {T.REFUND_SCHEDULE.map((l) => <li key={l}>{l}</li>)}
          </ol>
          <p>{T.REFUND_NOTICE}</p>
        </Section>

        <Section n={5} title="Student Acknowledgments">
          <p>By signing below, I confirm that:</p>
          <ul className="list-disc pl-6 space-y-2">
            {T.ACKNOWLEDGMENTS.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </Section>

        <Section n={6} title="Non-Discrimination"><p>{T.NON_DISCRIMINATION}</p></Section>
        <Section n={7} title="Licensure and Complaints"><p>{T.LICENSURE}</p></Section>
        <Section n={8} title="Entire Agreement"><p>{T.ENTIRE_AGREEMENT}</p></Section>

        </SignForm>
      </div>
    </Shell>
  );
}
