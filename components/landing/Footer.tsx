import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-navy-deep text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-teal text-white font-display text-base leading-none pt-0.5"
              >
                A
              </span>
              <span className="flex flex-col leading-tight">
                <span className="font-display text-lg tracking-tight">
                  Blueprint School
                </span>
                <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-teal-soft -mt-0.5">
                  Institute
                </span>
              </span>
            </div>
            <p className="text-navy-100 leading-relaxed max-w-sm">
              A modern allied-health institute powered by Atticus&trade; &mdash; the AI
              platform designed and developed by WorldTeachPathways dba WorldTeachESL LLC,
              deployed in partnership with Cole Middleton Advisors.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-[0.14em] uppercase text-teal mb-4">
              Navigate
            </div>
            <ul className="space-y-3 text-navy-100">
              <li><Link href="/programs" className="hover:text-teal transition-colors">Programs</Link></li>
              <li><Link href="/admissions" className="hover:text-teal transition-colors">Admissions</Link></li>
              <li><Link href="/about" className="hover:text-teal transition-colors">About</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold tracking-[0.14em] uppercase text-teal mb-4">
              Institute
            </div>
            <ul className="space-y-3 text-navy-100">
              <li><Link href="/admin" className="hover:text-teal transition-colors">Admin Dashboard</Link></li>
              <li><a href="mailto:admissions@blueprint.edu" className="hover:text-teal transition-colors">admissions@blueprint.edu</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 text-xs text-navy-200 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            &copy; {new Date().getFullYear()} Blueprint School Institute. All rights reserved.
          </div>
          <div className="md:text-right md:max-w-md">
            Atticus&trade; is an AI platform by WorldTeachPathways dba WorldTeachESL LLC,
            deployed in partnership with Cole Middleton Advisors.
          </div>
        </div>
        <div className="mt-4 text-center text-[11px] text-navy-200">
          Atticus&trade; &copy; 2026 WorldTeachPathways dba WorldTeachESL LLC.
        </div>
      </div>
    </footer>
  );
}
