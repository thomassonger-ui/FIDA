import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { NewTicketForm } from "./new-ticket-form";

export const metadata = {
  title: "Student Support",
  description:
    "Open a support ticket with FIDA. Submit your question and a FIDA staff member will follow up within one business day.",
};

export default function TicketsLandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* HERO */}
      <section className="bg-paper-subtle border-b border-rule">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="eyebrow">Student Support</div>
            <h1 className="mt-3 font-display text-5xl md:text-6xl text-navy tracking-tight leading-[1.05]">
              Open a <span className="text-teal">ticket.</span>
            </h1>
            <p className="mt-6 text-muted text-lg leading-relaxed max-w-2xl">
              Got a question about your program, professional development
              course, financial aid, scheduling, or tech access? Drop a note
              below and a FIDA staff member will reply within one business day.
            </p>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: open a new ticket */}
          <div className="lg:col-span-3">
            <div className="eyebrow mb-3">Open a new ticket</div>
            <h2 className="font-display text-3xl text-navy mb-2">
              Tell us what&rsquo;s going on
            </h2>
            <p className="text-muted text-sm mb-8 max-w-prose">
              We&rsquo;ll send a confirmation to your email and follow up there.
            </p>
            <NewTicketForm />
          </div>

          {/* Right: how it works + contact */}
          <aside className="lg:col-span-2 space-y-10">
            <div>
              <div className="eyebrow">How this works</div>
              <ol className="mt-5 space-y-5">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-center font-display text-teal">
                    01
                  </div>
                  <div>
                    <div className="font-semibold text-navy">Submit a ticket</div>
                    <p className="mt-1 text-muted text-sm leading-relaxed">
                      Pick a category, tell us what&rsquo;s up, attach a file if
                      it helps.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-center font-display text-teal">
                    02
                  </div>
                  <div>
                    <div className="font-semibold text-navy">We get to work</div>
                    <p className="mt-1 text-muted text-sm leading-relaxed">
                      Your ticket lands in our support queue right away.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-center font-display text-teal">
                    03
                  </div>
                  <div>
                    <div className="font-semibold text-navy">Reply inside the portal</div>
                    <p className="mt-1 text-muted text-sm leading-relaxed">
                      A FIDA staff member replies inside your portal within one
                      business day. Sign in to continue the conversation.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
