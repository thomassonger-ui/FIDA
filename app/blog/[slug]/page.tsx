import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { Inline } from "@/components/blog/Inline";
import { ShareButtons } from "@/components/blog/ShareButtons";
import {
  POSTS,
  SITE_URL,
  formatDate,
  getPost,
  getTag,
  plain,
  readMinutes,
  wordCount,
} from "@/lib/blog";
import { SOURCES } from "@/lib/blog/sources";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  const url = `/blog/${p.slug}`;
  return {
    // Absolute: the site-wide template would push these past ~60 characters.
    title: { absolute: `${p.seoTitle} | FIDA` },
    description: p.description,
    alternates: { canonical: url },
    keywords: p.tags.map((t) => getTag(t)?.label ?? t),
    openGraph: {
      type: "article",
      title: p.seoTitle,
      description: p.description,
      url,
      publishedTime: p.published,
      modifiedTime: p.reviewed,
      images: [{ url: "/hero-og.jpg", alt: "Florida Institute of Dental Assisting" }],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();

  const url = `${SITE_URL}/blog/${p.slug}`;
  const org = {
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: "Florida Institute of Dental Assisting",
    url: SITE_URL,
    logo: `${SITE_URL}/fida-shield.png`,
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: p.title,
        description: p.description,
        url,
        mainEntityOfPage: url,
        datePublished: p.published,
        dateModified: p.reviewed,
        inLanguage: "en-US",
        wordCount: wordCount(p),
        keywords: p.tags.map((t) => getTag(t)?.label ?? t).join(", "),
        image: `${SITE_URL}/hero-og.jpg`,
        author: org,
        publisher: org,
        citation: p.sources.map((k) => SOURCES[k]?.url).filter(Boolean),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: p.title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: p.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: plain(f.a) },
        })),
      },
    ],
  };

  const toc = p.body.filter((b) => b.type === "h2");
  const related = p.related.map(getPost).filter((r) => r !== undefined);

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />

      <main id="main">
        <article>
          <header className="bg-paper-subtle border-b border-rule">
            <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
              <div className="max-w-3xl">
                <nav aria-label="Breadcrumb" className="text-xs text-subtle">
                  <Link href="/" className="hover:text-teal">Home</Link>
                  <span aria-hidden="true"> / </span>
                  <Link href="/blog" className="hover:text-teal">Blog</Link>
                </nav>
                <div className="eyebrow mt-5">{p.eyebrow}</div>
                <h1 className="mt-3 font-display text-4xl md:text-5xl text-navy tracking-tight leading-[1.08]">
                  {p.title}
                </h1>
                <p className="mt-5 text-muted text-lg leading-relaxed">{p.summary}</p>
                <p className="mt-5 text-sm text-subtle">
                  By Florida Institute of Dental Assisting · Published{" "}
                  <time dateTime={p.published}>{formatDate(p.published)}</time> · Rules
                  reviewed <time dateTime={p.reviewed}>{formatDate(p.reviewed)}</time> ·{" "}
                  {readMinutes(p)} min read
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <li key={t}>
                      <Link
                        href={`/blog/tag/${t}`}
                        className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase px-2.5 py-1 rounded-sm bg-teal-50 text-teal hover:bg-teal hover:text-white transition-colors"
                      >
                        {getTag(t)?.label ?? t}
                      </Link>
                    </li>
                  ))}
                </ul>
                <ShareButtons url={url} title={p.title} summary={p.description} className="mt-6" />
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-12 md:py-16">
            <div className="max-w-3xl">
              <section
                aria-labelledby="takeaways"
                className="border border-rule rounded-sm bg-paper-subtle p-6"
              >
                <h2 id="takeaways" className="eyebrow">
                  Key takeaways
                </h2>
                <ul className="mt-3 list-disc pl-5 space-y-2 text-navy/90 leading-relaxed">
                  {p.keyTakeaways.map((k, i) => (
                    <li key={i}>
                      <Inline text={k} sources={p.sources} />
                    </li>
                  ))}
                </ul>
              </section>

              <nav aria-labelledby="toc" className="mt-8">
                <h2 id="toc" className="eyebrow">
                  In this article
                </h2>
                <ol className="mt-3 list-decimal pl-5 space-y-1.5 text-sm">
                  {toc.map((b) =>
                    b.type === "h2" ? (
                      <li key={b.id}>
                        <a href={`#${b.id}`} className="text-teal underline underline-offset-2 hover:text-teal-deep">
                          {b.text}
                        </a>
                      </li>
                    ) : null
                  )}
                  <li>
                    <a href="#faq" className="text-teal underline underline-offset-2 hover:text-teal-deep">
                      Frequently asked questions
                    </a>
                  </li>
                  <li>
                    <a href="#sources" className="text-teal underline underline-offset-2 hover:text-teal-deep">
                      Sources
                    </a>
                  </li>
                </ol>
              </nav>

              <div className="mt-4">
                {p.body.map((b, i) => {
                  switch (b.type) {
                    case "h2":
                      return (
                        <h2
                          key={i}
                          id={b.id}
                          className="mt-12 scroll-mt-24 font-display text-2xl md:text-3xl text-navy tracking-tight"
                        >
                          {b.text}
                        </h2>
                      );
                    case "h3":
                      return (
                        <h3 key={i} className="mt-8 text-lg font-semibold text-navy">
                          {b.text}
                        </h3>
                      );
                    case "p":
                      return (
                        <p key={i} className="mt-4 text-navy/90 leading-relaxed">
                          <Inline text={b.text} sources={p.sources} />
                        </p>
                      );
                    case "ul":
                    case "ol": {
                      const L = b.type;
                      return (
                        <L
                          key={i}
                          className={`mt-4 pl-6 space-y-3 text-navy/90 leading-relaxed ${
                            b.type === "ol" ? "list-decimal" : "list-disc"
                          }`}
                        >
                          {b.items.map((it, j) => (
                            <li key={j}>
                              <Inline text={it} sources={p.sources} />
                            </li>
                          ))}
                        </L>
                      );
                    }
                    case "callout":
                      return (
                        <aside
                          key={i}
                          className="mt-6 border-l-4 border-teal bg-teal-50 rounded-sm px-5 py-4 text-navy/90 leading-relaxed"
                        >
                          {b.title && (
                            <div className="font-semibold text-navy mb-1">{b.title}</div>
                          )}
                          <Inline text={b.text} sources={p.sources} />
                        </aside>
                      );
                    case "table":
                      return (
                        <div key={i} className="mt-6 overflow-x-auto border border-rule rounded-sm">
                          <table className={`w-full text-sm text-left ${b.head.length > 2 ? "min-w-[640px]" : ""}`}>
                            <caption className="sr-only">{b.caption}</caption>
                            <thead className="bg-paper-subtle text-navy">
                              <tr>
                                {b.head.map((h, j) => (
                                  <th key={j} scope="col" className="px-4 py-3 font-semibold align-bottom">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {b.rows.map((r, j) => (
                                <tr key={j} className="border-t border-rule align-top">
                                  {r.map((c, k) =>
                                    k === 0 ? (
                                      <th key={k} scope="row" className="px-4 py-3 font-semibold text-navy">
                                        <Inline text={c} sources={p.sources} />
                                      </th>
                                    ) : (
                                      <td key={k} className="px-4 py-3 text-navy/90 leading-relaxed">
                                        <Inline text={c} sources={p.sources} />
                                      </td>
                                    )
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                  }
                })}
              </div>

              <section aria-labelledby="faq" className="mt-14">
                <h2 id="faq" className="scroll-mt-24 font-display text-2xl md:text-3xl text-navy tracking-tight">
                  Frequently asked questions
                </h2>
                <dl className="mt-4 divide-y divide-rule border-y border-rule">
                  {p.faqs.map((f) => (
                    <div key={f.q} className="py-5">
                      <dt className="font-semibold text-navy">{f.q}</dt>
                      <dd className="mt-2 text-navy/90 leading-relaxed">
                        <Inline text={f.a} sources={p.sources} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section aria-labelledby="sources" className="mt-14">
                <h2 id="sources" className="scroll-mt-24 font-display text-2xl md:text-3xl text-navy tracking-tight">
                  Sources
                </h2>
                <ol className="mt-4 list-decimal pl-6 space-y-3 text-sm text-navy/90 leading-relaxed">
                  {p.sources.map((k, i) => {
                    const s = SOURCES[k];
                    if (!s) return null;
                    return (
                      <li key={k} id={`source-${i + 1}`} className="scroll-mt-24">
                        <a
                          href={s.url}
                          rel="noopener"
                          className="text-teal underline underline-offset-2 hover:text-teal-deep"
                        >
                          {s.title}
                        </a>
                        . {s.publisher}.
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-6 text-sm text-subtle leading-relaxed">
                  This article is educational and is not legal advice. Florida statutes and
                  Board of Dentistry rules change; the citations above were checked on{" "}
                  {formatDate(p.reviewed)}. For a determination about a specific situation,
                  contact the{" "}
                  <a href="https://floridasdentistry.gov/" rel="noopener" className="underline">
                    Florida Board of Dentistry
                  </a>
                  .
                </p>
              </section>

              <div className="mt-12 pt-6 border-t border-rule">
                <p className="text-sm text-muted">
                  Know an assistant or a dentist who should read this? Send it to them.
                </p>
                <ShareButtons url={url} title={p.title} summary={p.description} className="mt-3" />
              </div>

              {related.length > 0 && (
                <section aria-labelledby="related" className="mt-14">
                  <h2 id="related" className="eyebrow">
                    Keep reading
                  </h2>
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                    {related.map((r) => (
                      <li key={r.slug}>
                        <Link
                          href={`/blog/${r.slug}`}
                          className="block h-full border border-rule rounded-sm p-5 hover:border-teal transition-colors"
                        >
                          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-teal">
                            {r.eyebrow}
                          </div>
                          <div className="mt-2 font-display text-xl text-navy leading-snug">
                            {r.title}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
