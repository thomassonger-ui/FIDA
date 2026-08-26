import Link from "next/link";
import { ImportForm } from "./import-form";

export const metadata = { title: "Import prospects · FIDA Admin" };

export default function ImportProspectsPage() {
  return (
    <div>
      <div className="eyebrow mb-1">Recruiting</div>
      <h1 className="text-3xl md:text-4xl mb-2">Import prospects</h1>
      <p className="text-muted max-w-2xl text-sm">
        Upload a CSV of prospective students. Anyone already on the list is
        matched by email address and updated rather than duplicated, so it is
        safe to re-import a corrected file.{" "}
        <Link href="/admin/prospects" className="text-teal underline">
          Back to Prospects
        </Link>
      </p>

      <ImportForm />

      <div className="mt-10 border border-rule bg-paper-subtle rounded-sm px-5 py-4 max-w-xl text-sm">
        <div className="font-semibold text-ink mb-2">
          Column headings we recognise
        </div>
        <p className="text-muted mb-2">
          Case and spacing don&rsquo;t matter. Extra columns are ignored.
        </p>
        <ul className="text-muted grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
          <li>first name / last name / name</li>
          <li>email</li>
          <li>phone / mobile / cell</li>
          <li>city</li>
          <li>state</li>
          <li>zip</li>
          <li>county</li>
          <li>employer / office / practice</li>
          <li>program / interest</li>
          <li>segment</li>
          <li>score</li>
          <li>notes</li>
        </ul>
        <p className="text-muted mt-3 text-xs">
          A row needs at least one of: name, email, or phone. Everything else
          is optional and can be filled in later.
        </p>
      </div>
    </div>
  );
}
