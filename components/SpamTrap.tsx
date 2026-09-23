"use client";

import { useEffect, useState } from "react";

/**
 * Invisible anti-bot fields for public forms that post to /api/tickets
 * (checked in lib/spam-guard.ts):
 *   - "website": honeypot. Off-screen, hidden from screen readers and the tab
 *     order; people never fill it, form-filling bots do.
 *   - "_t": when the form appeared (set after hydration). Posts that arrive
 *     < 3 s later, or without it, are bots.
 */
export function SpamTrap() {
  const [started, setStarted] = useState("");
  useEffect(() => setStarted(String(Date.now())), []);
  return (
    <>
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}
      >
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="_t" value={started} readOnly />
    </>
  );
}
