import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { unsubscribeTokenValid } from "@/lib/drip";
import { MAILING_ADDRESS } from "@/lib/prospects-shared";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

/**
 * Public unsubscribe page, linked from the footer of every drip email.
 *
 * The link itself does NOT unsubscribe (link scanners and previewers open
 * URLs all day). The person presses one button, which POSTs to
 * /api/unsubscribe with the same signed token. Mail clients that support
 * one-click unsubscribe skip this page entirely.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; t?: string; done?: string }>;
}) {
  const sp = await searchParams;
  const email = (sp.e ?? "").trim().toLowerCase();
  const token = sp.t ?? "";
  const valid = Boolean(email) && unsubscribeTokenValid(email, token);
  const done = sp.done === "1" && valid;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main id="main" className="flex-1">
        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16 md:py-24">
          <div className="max-w-xl">
            <div className="eyebrow">Email preferences</div>
            {done ? (
              <>
                <h1 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight leading-[1.05]">
                  You&rsquo;re unsubscribed.
                </h1>
                <p className="mt-5 text-muted text-lg leading-relaxed">
                  <span className="text-navy">{email}</span> won&rsquo;t receive
                  any more admissions emails from FIDA. If you ever change your
                  mind, just reply to one of our earlier notes or call the school.
                </p>
              </>
            ) : valid ? (
              <>
                <h1 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight leading-[1.05]">
                  Stop admissions emails?
                </h1>
                <p className="mt-5 text-muted text-lg leading-relaxed">
                  Press the button and we&rsquo;ll stop emailing{" "}
                  <span className="text-navy">{email}</span>. It takes effect
                  right away.
                </p>
                <form
                  method="POST"
                  action={`/api/unsubscribe?e=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}`}
                  className="mt-8"
                >
                  <button type="submit" className="btn-primary">
                    Unsubscribe me
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight leading-[1.05]">
                  That link didn&rsquo;t work.
                </h1>
                <p className="mt-5 text-muted text-lg leading-relaxed">
                  The unsubscribe link looks incomplete. Open the email again
                  and use the link at the very bottom, or simply reply to it with
                  the word &ldquo;unsubscribe&rdquo; and we&rsquo;ll take care of
                  it by hand.
                </p>
              </>
            )}
            <p className="mt-10 text-xs text-subtle">{MAILING_ADDRESS}</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
