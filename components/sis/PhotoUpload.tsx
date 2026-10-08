"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** "Change photo" control. Posts multipart `file` to `endpoint`. */
export default function PhotoUpload({ endpoint, label = "Change photo" }: { endpoint: string; label?: string }) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="text-center">
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        className="text-[11px] text-teal hover:underline"
      >
        {busy ? "Uploading…" : label}
      </button>
      {error && <div className="text-[11px] text-red-700 mt-1">{error}</div>}
    </div>
  );
}
