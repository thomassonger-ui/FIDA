import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { AtticusChat } from "@/components/admissions/AtticusChat";

export const metadata = {
  title: "Admissions",
  description:
    "Talk to Atticus, our AI admissions advisor. No forms, no pressure — just a conversation about where you want to go.",
};

const steps = [
  {
    n: "01",
    title: "Have a conversation",
    body: "Tell Atticus about your background, schedule, and what matters to you. Five minutes, no paperwork.",
  },
  {
    n: "02",
    title: "Meet a real human",
    body: "An Apex advisor follows up within one business day to walk you through financial aid, scheduling, and any questions.",
  },
  {
    n: "03",
    title: "Start your program",
    body: "Complete enrollment steps and join your cohort. Summer starts June 3, 2026.",
  },
];

const faqs = [
  {
    q: "Is this actually an AI?",
    a: "Yes &mdash; Atticus is a real AI admissions advisor built on Claude. It answers questions, helps you compare programs, and hands off to a human Apex advisor when you&rsquo;re ready to enroll.",
  },
  {
    q: "Do I have to decide anything right now?",
    a: "No. You can talk to Atticus, explore programs, and walk away. There&rsquo;s no pressure and no commitment.",
  },
  {
    q: "What about financial aid?",
    a: "Financial aid is available for eligible students. A human advisor will walk you through specific options once we understand your situation.",
  },
  {
    q: "Can I talk to a real person instead?",
    a: "Absolutely. Email admissions@blueprint.edu and we&rsquo;ll schedule a call. But most people find Atticus faster for initial questions.",
  },
];

export default async function AdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ program?: string }>;
}) {
  const params = await searchParams;
  const initialProgram = params?.program;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* HERO */}
      <section className="bg-paper-subtle border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="eyebrow">Admissions</div>
            <h1 className="mt-3 font-display text-5xl md:text-6xl text-navy tracking-tight leading-[1.05]">
              Skip the form. Talk to <span className="text-teal">Atticus.</span>
            </h1>
            <p className="mt-6 text-muted text-lg leading-relaxed max-w-2xl">
              Atticus is our AI admissions advisor. It knows every program, every deadline,
              and every next step &mdash; and it&rsquo;s available right now. Tell it where
              you are, and it&rsquo;ll help you figure out where to go.
            </p>
          </div>
        </div>
      </section>

      {/* CHAT + SIDEBAR */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-3">
            <AtticusChat initialProgram={initialProgram} />
          </div>

          <aside className="lg:col-span-2 space-y-8">
            <div>
              <div className="eyebrow">How this works</div>
              <ol className="mt-5 space-y-5">
                {steps.map((s) => (
                  <li key={s.n} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-center font-display text-teal">
                      {s.n}
                    </div>
                    <div>
                      <div className="font-semibold text-navy">{s.title}</div>
                      <p className="mt-1 text-muted text-sm leading-relaxed">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card p-6 bg-navy text-white">
              <div className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-soft">
                Upcoming cohort
              </div>
              <div className="mt-2 font-display text-3xl">Summer 2026</div>
              <div className="mt-1 text-navy-100 text-sm">Starts June 3, 2026 &middot; Orlando</div>
              <div className="mt-5 pt-5 border-t border-white/10 text-sm text-navy-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Priority deadline</span>
                  <span className="text-white font-semibold">May 15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Seats remaining</span>
                  <span className="text-white font-semibold">24 / 60</span>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-white">
              <div className="eyebrow">Prefer a human right now?</div>
              <p className="mt-3 text-muted text-sm leading-relaxed">
                Email us at{" "}
                <a
                  href="mailto:admissions@blueprint.edu"
                  className="text-navy font-semibold underline decoration-teal underline-offset-4 hover:text-teal"
                >
                  admissions@blueprint.edu
                </a>{" "}
                and we&rsquo;ll schedule a call.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-paper-subtle border-t border-rule">
        <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-20">
          <div className="eyebrow">Common questions</div>
          <h2 className="mt-3 font-display text-4xl text-navy tracking-tight">
            What people ask Atticus first.
          </h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((f) => (
              <div key={f.q} className="card p-6 bg-white">
                <h3 className="font-display text-lg text-navy leading-tight">{f.q}</h3>
                <p
                  className="mt-3 text-muted text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-12 py-16 text-center">
          <h2 className="font-display text-3xl md:text-4xl">Ready when you are.</h2>
          <p className="mt-3 text-navy-100 max-w-xl mx-auto">
            Atticus is standing by. Start the conversation whenever it works for you.
          </p>
          <Link href="/programs" className="inline-block mt-6 text-teal-soft hover:text-teal underline underline-offset-4 text-sm">
            Still exploring? See all programs →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
