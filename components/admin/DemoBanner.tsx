import Link from "next/link";

/**
 * Thin site-wide banner that sits on top of every admin page. Makes it
 * unmistakable that the demo is not a system of record — no screenshot
 * or walkthrough can be mistaken for real compliance evidence.
 *
 * Intentionally plain, not dismissible, and links to the SoR audit page
 * so owners can read exactly what is and isn't real.
 */
export function DemoBanner() {
  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-900">
      <div className="max-w-full px-8 md:px-12 py-2 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold shrink-0"
          >
            !
          </span>
          <span className="truncate">
            <span className="font-medium">Demo environment</span>{" "}
            &middot; not a system of record &middot; no data persists &middot;
            not audit-grade
          </span>
        </div>
        <Link
          href="/admin/compliance"
          className="underline underline-offset-2 hover:text-amber-950 whitespace-nowrap"
        >
          View SoR audit &rarr;
        </Link>
      </div>
    </div>
  );
}
