import Link from "next/link";
import { AtticusCopyrightBar } from "@/components/AtticusCopyrightBar";

export function Footer() {
  return (
    <footer className="bg-navy-deep text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/fida-shield.png"
                alt="FIDA"
                className="w-9 h-9 object-contain"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-display text-lg tracking-tight">
                  FIDA
                </span>
                <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-teal-soft -mt-0.5">
                  Institute
                </span>
              </span>
            </div>
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
              Support
            </div>
            <ul className="space-y-3 text-navy-100">
              <li><Link href="/tickets" className="hover:text-teal transition-colors">Submit a Ticket</Link></li>
              <li><Link href="/admin" className="hover:text-teal transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs text-navy-200">
          <div>
            &copy; {new Date().getFullYear()} Florida Institute of Dental Assisting. All rights reserved.
          </div>
          <AtticusCopyrightBar variant="light" />
        </div>
      </div>
    </footer>
  );
}
