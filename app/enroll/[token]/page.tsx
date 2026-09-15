import type { Metadata } from "next";
import { getAgreementByToken } from "@/lib/enrollment";
import * as T from "@/lib/enrollment-agreement-text";
import { SEAT_DEPOSIT_DUE } from "@/lib/payment";
import { cohortOptions } from "@/lib/enrollment-schedule";
import { SignForm } from "./sign-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student Enrollment Agreement — FIDA",
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="min-h-screen bg-paper px-4 py-10 md:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fida-logo.png" alt="Florida Institute of Dental Assisting" className="mx-auto h-14 w-auto" />
          <div className="mt-3 text-xs text-subtle">{T.SCHOOL.address}</div>
          <div className="mt-1 text-xs text-subtle">{T.SCHOOL.email} · {T.SCHOOL.phone}</div>
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
            Your enrollment agreement was signed on {new Date(agreement.signed_at!).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} and is on file. A copy was emailed to you.
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
          <div className="eyebrow">Please review, initial and sign</div>
          <h1 className="font-display text-3xl text-navy mt-1">Student Enrollment Agreement</h1>
          <div className="mt-1 text-sm text-muted">&ldquo;{T.PROGRAM.title}&rdquo;</div>
        </div>

        <SignForm
          token={token}
          defaults={{
            legal_name: student.full_name ?? "",
            email: student.email,
            phone: student.phone ?? "",
            start_date: student.start_date ?? "",
          }}
          cohorts={cohortOptions()}
          depositUrl={depositUrl}
        />
      </div>
    </Shell>
  );
}
