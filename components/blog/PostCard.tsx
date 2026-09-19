import Link from "next/link";
import { formatDate, getTag, readMinutes } from "@/lib/blog";
import type { Post } from "@/lib/blog/types";

export function PostCard({ p }: { p: Post }) {
  return (
    <article className="h-full border border-rule rounded-sm bg-paper p-6 flex flex-col">
      <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-teal">
        {p.eyebrow}
      </div>
      <h2 className="mt-3 font-display text-2xl text-navy tracking-tight leading-snug">
        <Link href={`/blog/${p.slug}`} className="hover:text-teal transition-colors">
          {p.title}
        </Link>
      </h2>
      <p className="mt-3 text-muted leading-relaxed">{p.description}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {p.tags.map((t) => (
          <li key={t}>
            <Link
              href={`/blog/tag/${t}`}
              className="inline-block text-[10px] font-semibold tracking-[0.1em] uppercase px-2 py-1 rounded-sm bg-teal-50 text-teal hover:bg-teal hover:text-white transition-colors"
            >
              {getTag(t)?.label ?? t}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-5 flex items-center justify-between text-xs text-subtle">
        <span>
          Reviewed <time dateTime={p.reviewed}>{formatDate(p.reviewed)}</time> ·{" "}
          {readMinutes(p)} min read
        </span>
        <Link
          href={`/blog/${p.slug}`}
          className="font-semibold text-teal hover:text-teal-deep"
          aria-label={`Read: ${p.title}`}
        >
          Read →
        </Link>
      </div>
    </article>
  );
}
