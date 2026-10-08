"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ROLES = ["owner", "registrar", "admissions", "instructor", "read_only"];

/** Owner-only preview: see the record exactly as another staff role would. */
export default function RoleSwitcher({ role }: { role: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="inline-flex items-center gap-2 text-[11px] text-subtle">
      View as
      <select
        value={role}
        onChange={(e) => {
          const q = new URLSearchParams(params.toString());
          if (e.target.value === "owner") q.delete("as");
          else q.set("as", e.target.value);
          router.push(`${pathname}?${q.toString()}`);
        }}
        className="border border-rule bg-paper px-2 py-1 rounded-sm text-[11px] text-ink"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r.replace("_", " ")}</option>
        ))}
      </select>
    </label>
  );
}
