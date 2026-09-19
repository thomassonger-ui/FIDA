import type { Block, Post, TagSlug } from "./types";
import { radiographyCertification } from "./posts/radiography-certification";
import { efdaGuide } from "./posts/efda-guide";
import { efdaVsRadiography } from "./posts/efda-vs-radiography";
import { whatCanAnEfdaDo } from "./posts/what-can-an-efda-do";
import { chooseAProgram } from "./posts/choose-a-program";

export const SITE_URL = "https://fldentalassisting.com";

/** Publishing order = display order on /blog. Add new posts at the top. */
export const POSTS: Post[] = [
  radiographyCertification,
  efdaGuide,
  efdaVsRadiography,
  whatCanAnEfdaDo,
  chooseAProgram,
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}

// ------------------------------------------------------------
// Topic hubs. Each tag is a permanent hub page (/blog/tag/<slug>) that ties
// the articles to the matching course page and the regulator's own pages —
// the topical structure we want search engines to see:
//   FIDA → Florida Radiography → EFDA → Florida Dental Regulations
// ------------------------------------------------------------

export type Tag = {
  slug: TagSlug;
  label: string;
  title: string;
  intro: string;
  /** Course or site page this hub should send readers to. */
  cta?: { href: string; label: string };
  /** Keys into SOURCES — the official pages for this topic. */
  official: string[];
};

export const TAGS: Tag[] = [
  {
    slug: "florida-radiography",
    label: "Florida Radiography",
    title: "Florida Dental Radiography",
    intro:
      "Everything FIDA has published on dental radiographer certification in Florida: who needs it, the three-month on-the-job training requirement, Board-approved coursework under Rule 64B5-9.011, the application, and how employers verify it.",
    cta: { href: "/programs/dental-radiography-certification", label: "Radiography for Dental Personnel course" },
    official: ["rule-9011", "board-radiographer", "board-app", "stat-466017"],
  },
  {
    slug: "efda",
    label: "Expanded Functions (EFDA)",
    title: "Expanded Functions Dental Assisting in Florida",
    intro:
      "What an Expanded Functions Dental Assistant is under Florida law, the duties that require formal training, the supervision each task needs, and how working assistants qualify.",
    cta: { href: "/programs/efda-certification-florida", label: "Expanded Functions (EFDA) course" },
    official: ["stat-466024", "chapter-16", "rule-16002", "rule-16005"],
  },
  {
    slug: "florida-dental-regulations",
    label: "Florida Dental Regulations",
    title: "Florida Dental Assisting Regulations, Explained",
    intro:
      "Plain-English explanations of the Florida statutes and Board of Dentistry rules that govern what dental assistants may do — Chapter 466, Rule 64B5-9.011 and Chapter 64B5-16 — each linked to the primary source.",
    official: ["stat-466024", "stat-466017", "rule-9011", "chapter-16", "board-resources"],
  },
  {
    slug: "for-dentists",
    label: "For Dentists",
    title: "For Florida Dentists and Office Managers",
    intro:
      "Delegation, supervision and documentation: what a Florida dentist needs to know before assigning radiographs or expanded duties to a dental assistant, and what to keep on file.",
    cta: { href: "/contact", label: "Enroll a staff member" },
    official: ["stat-466024", "stat-466028", "rule-16001", "doh-verify"],
  },
  {
    slug: "choosing-a-program",
    label: "Choosing a Program",
    title: "Choosing a Dental Assisting Program in Florida",
    intro:
      "How to tell whether a Florida radiography or expanded-functions course will actually count: Board approval, state licensure, accreditation, and the questions to ask before paying tuition.",
    cta: { href: "/programs", label: "See FIDA's programs" },
    official: ["board-resources", "rule-16002", "cie"],
  },
];

export function getTag(slug: string): Tag | undefined {
  return TAGS.find((t) => t.slug === slug);
}

export function postsForTag(slug: TagSlug): Post[] {
  return POSTS.filter((p) => p.tags.includes(slug));
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

/** Strips the inline syntax — for word counts, JSON-LD and meta text. */
export function plain(text: string): string {
  return text
    .replace(/\{\{[a-z0-9-]+\}\}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
}

function blockText(b: Block): string {
  switch (b.type) {
    case "p":
    case "h2":
    case "h3":
      return b.text;
    case "callout":
      return `${b.title ?? ""} ${b.text}`;
    case "ul":
    case "ol":
      return b.items.join(" ");
    case "table":
      return [b.head.join(" "), ...b.rows.map((r) => r.join(" "))].join(" ");
  }
}

export function wordCount(p: Post): number {
  const all = [
    p.summary,
    ...p.keyTakeaways,
    ...p.body.map(blockText),
    ...p.faqs.flatMap((f) => [f.q, f.a]),
  ].join(" ");
  return plain(all).split(/\s+/).filter(Boolean).length;
}

export function readMinutes(p: Post): number {
  return Math.max(1, Math.round(wordCount(p) / 230));
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
