/**
 * Blog content model.
 *
 * Articles are plain data so they can be reviewed, diffed and fact-checked
 * like any other copy on the site. Body text supports a tiny inline syntax,
 * rendered by components/blog/Inline.tsx:
 *
 *   [link text](/internal-path)  or  [link text](https://external)
 *   **bold**
 *   {{source-key}}   → numbered superscript citation linking to the
 *                      article's Sources list (key from lib/blog/sources.ts)
 */

export type TagSlug =
  | "florida-radiography"
  | "efda"
  | "florida-dental-regulations"
  | "for-dentists"
  | "choosing-a-program";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; id: string; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; title?: string; text: string }
  | { type: "table"; caption: string; head: string[]; rows: string[][] };

export type Faq = { q: string; a: string };

export type Post = {
  slug: string;
  /** On-page H1. */
  title: string;
  /** <title> / og:title — the SEO angle. */
  seoTitle: string;
  /** Meta description, ≤ 160 chars. */
  description: string;
  eyebrow: string;
  tags: TagSlug[];
  /** ISO dates. `reviewed` is when the legal citations were last checked. */
  published: string;
  reviewed: string;
  /** Two or three sentences shown under the H1 and on the index card. */
  summary: string;
  keyTakeaways: string[];
  body: Block[];
  faqs: Faq[];
  /** Keys into SOURCES, in citation-number order. */
  sources: string[];
  /** Slugs of related articles. */
  related: string[];
};

export type Source = {
  title: string;
  publisher: string;
  url: string;
};
