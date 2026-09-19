"use client";

import { useState } from "react";

/**
 * Share row for blog articles. Plain links wherever possible (no third-party
 * scripts, no tracking pixels) — each opens the network's own share dialog
 * with the article URL filled in. "Copy link" is the only part that needs JS.
 */
export function ShareButtons({
  url,
  title,
  summary,
  className = "",
}: {
  url: string;
  title: string;
  summary: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const links = [
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
  ];
  const mailto = `mailto:?subject=${t}&body=${encodeURIComponent(
    `${summary}\n\nRead it here: ${url}\n\n— Florida Institute of Dental Assisting`
  )}`;

  const btn =
    "inline-flex items-center text-xs font-semibold px-3 py-2 rounded-sm border border-rule bg-paper text-navy hover:border-teal hover:text-teal transition-colors";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-subtle mr-1">
        Share
      </span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
          aria-label={`Share on ${l.label}`}
        >
          {l.label}
        </a>
      ))}
      <a href={mailto} className={btn} aria-label="Share by email">
        Email
      </a>
      <button
        type="button"
        className={btn}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } catch {
            // Clipboard blocked (older browser / insecure context) — no-op;
            // the address bar still has the link.
          }
        }}
      >
        <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
      </button>
    </div>
  );
}
