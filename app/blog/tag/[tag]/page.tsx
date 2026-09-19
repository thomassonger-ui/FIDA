import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { PostCard } from "@/components/blog/PostCard";
import { SITE_URL, TAGS, getTag, postsForTag } from "@/lib/blog";
import { SOURCES } from "@/lib/blog/sources";

export const dynamicParams = false;

export function generateStaticParams() {
  return TAGS.map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const t = getTag(tag);
  if (!t) return {};
  return {
    title: `${t.title} — Guides & Rules`,
    description: t.intro.slice(0, 158),
    alternates: { canonical: `/blog/tag/${t.slug}` },
  };
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const t = getTag(tag);
  if (!t) notFound();
  const posts = postsForTag(t.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: t.title,
        description: t.intro,
        url: `${SITE_URL}/blog/tag/${t.slug}`,
        isPartOf: { "@id": `${SITE_URL}/blog#blog` },
        hasPart: posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          url: `${SITE_URL}/blog/${p.slug}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: t.title, item: `${SITE_URL}/blog/tag/${t.slug}` },
        ],
      },
    ],
  };

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
              <nav aria-label="Breadcrumb" className="text-xs text-subtle">
                <Link href="/" className="hover:text-teal">Home</Link>
                <span aria-hidden="true"> / </span>
                <Link href="/blog" className="hover:text-teal">Blog</Link>
              </nav>
              <div className="eyebrow mt-5">Topic</div>
              <h1 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight leading-[1.05]">
                {t.title}
              </h1>
              <p className="mt-5 text-muted text-lg leading-relaxed">{t.intro}</p>
              {t.cta && (
                <Link href={t.cta.href} className="btn-primary mt-7 inline-flex">
                  {t.cta.label}
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
          <h2 className="eyebrow">Guides</h2>
          <ul className="mt-5 grid gap-6 md:grid-cols-2">
            {posts.map((p) => (
              <li key={p.slug}>
                <PostCard p={p} />
              </li>
            ))}
          </ul>

          <div className="mt-14 max-w-3xl">
            <h2 className="eyebrow">Official sources</h2>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              The statutes, rules and Board of Dentistry pages these guides are written from.
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed">
              {t.official.map((k) => {
                const s = SOURCES[k];
                if (!s) return null;
                return (
                  <li key={k}>
                    <a
                      href={s.url}
                      rel="noopener"
                      className="text-teal underline underline-offset-2 hover:text-teal-deep"
                    >
                      {s.title}
                    </a>
                    <span className="text-subtle"> — {s.publisher}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <nav aria-label="Other topics" className="mt-14">
            <h2 className="eyebrow">Other topics</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {TAGS.filter((o) => o.slug !== t.slug).map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/blog/tag/${o.slug}`}
                    className="inline-block text-xs font-semibold tracking-[0.08em] uppercase px-3 py-1.5 rounded-sm border border-rule text-navy hover:border-teal hover:text-teal transition-colors"
                  >
                    {o.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>
      </main>

      <Footer />
    </div>
  );
}
