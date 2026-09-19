import Link from "next/link";
import type { ReactNode } from "react";

const TOKEN =
  /(\{\{[a-z0-9-]+\}\}|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;

/**
 * Renders the blog's inline syntax (see lib/blog/types.ts): links, **bold**,
 * *italic* and {{source-key}} citations. `sources` is the article's ordered
 * source-key list, which fixes each citation's number.
 */
export function Inline({ text, sources = [] }: { text: string; sources?: string[] }) {
  const parts = text.split(TOKEN).filter((s) => s !== "");
  return (
    <>
      {parts.map((part, i): ReactNode => {
        const cite = /^\{\{([a-z0-9-]+)\}\}$/.exec(part);
        if (cite) {
          const n = sources.indexOf(cite[1]) + 1;
          if (n === 0) return null;
          return (
            <sup key={i} className="text-[0.7em] font-medium">
              <a
                href={`#source-${n}`}
                className="text-teal hover:text-teal-deep no-underline px-0.5"
                aria-label={`Source ${n}`}
              >
                [{n}]
              </a>
            </sup>
          );
        }
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link) {
          const [, label, href] = link;
          const cls = "text-teal underline underline-offset-2 hover:text-teal-deep";
          return href.startsWith("/") ? (
            <Link key={i} href={href} className={cls}>
              {label}
            </Link>
          ) : (
            <a key={i} href={href} className={cls} rel="noopener">
              {label}
            </a>
          );
        }
        const bold = /^\*\*([^*]+)\*\*$/.exec(part);
        if (bold)
          return (
            <strong key={i} className="font-semibold text-navy">
              {bold[1]}
            </strong>
          );
        const em = /^\*([^*]+)\*$/.exec(part);
        if (em) return <em key={i}>{em[1]}</em>;
        return part;
      })}
    </>
  );
}
