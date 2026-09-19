import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { PostCard } from "@/components/blog/PostCard";
import { POSTS, SITE_URL, TAGS } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Florida Dental Assisting Blog — Radiography, EFDA & Board Rules",
  description:
    "Plain-English guides to Florida dental radiography certification, expanded functions (EFDA), and the Board of Dentistry rules behind them — written by a Board-approved Florida school, with citations.",
  alternates: { canonical: "/blog" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": `${SITE_URL}/blog#blog`,
  name: "Florida Institute of Dental Assisting — Blog",
  url: `${SITE_URL}/blog`,
  inLanguage: "en-US",
  publisher: {
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: "Florida Institute of Dental Assisting",
    url: SITE_URL,
  },
  blogPost: POSTS.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    url: `${SITE_URL}/blog/${p.slug}`,
    datePublished: p.published,
    dateModified: p.reviewed,
  })),
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      <main id="main">
        <section className="bg-paper-subtle border-b border-rule">
          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-14 md:py-16">
            <div className="max-w-3xl">
              <div className="eyebrow">FIDA Blog · Florida Dental Assisting</div>
              <h1 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight leading-[1.05]">
                Florida dental radiography and expanded functions, explained.
              </h1>
              <p className="mt-5 text-muted text-lg leading-relaxed">
                Florida regulates what a dental assistant may do task by task, and the
                rules are scattered across statutes, Board of Dentistry rules and
                application forms. These guides put them in one place, in plain English,
                with every claim linked to its source — for assistants planning a career
                and for the dentists who employ them.
              </p>
            </div>

            <nav aria-label="Topics" className="mt-8">
              <ul className="flex flex-wrap gap-2">
                {TAGS.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/blog/tag/${t.slug}`}
                      className="inline-block text-xs font-semibold tracking-[0.08em] uppercase px-3 py-1.5 rounded-sm border border-rule bg-paper text-navy hover:border-teal hover:text-teal transition-colors"
                    >
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
          <ul className="grid gap-6 md:grid-cols-2">
            {POSTS.map((p) => (
              <li key={p.slug}>
                <PostCard p={p} />
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
