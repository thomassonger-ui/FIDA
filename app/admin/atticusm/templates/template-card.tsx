"use client";

import { useState, useTransition } from "react";
import type { TemplateRow } from "./page";

const CHANNEL_LABEL: Record<TemplateRow["channel"], string> = {
  social: "Social",
  reel: "Reel",
  email: "Email",
  sms: "SMS",
  yard_sign: "Yard sign",
};

const PROGRAM_LABEL: Record<TemplateRow["program"], string> = {
  rdp_ce: "RDP-CE",
  efda: "EFDA",
  both: "Both",
};

function channelClass(c: TemplateRow["channel"]): string {
  switch (c) {
    case "social":
      return "bg-navy-50 text-navy border-navy-100";
    case "reel":
      return "bg-violet-50 text-violet-800 border-violet-200";
    case "email":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "sms":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "yard_sign":
      return "bg-rose-50 text-rose-800 border-rose-200";
    default:
      return "bg-paper-subtle text-muted border-rule";
  }
}

export function TemplateCard({
  template,
  toggleStar,
  archive,
}: {
  template: TemplateRow;
  toggleStar: (fd: FormData) => Promise<void>;
  archive: (fd: FormData) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [, startTransition] = useTransition();

  const fullText = template.subject
    ? `Subject: ${template.subject}\nPreview: ${template.preview_text ?? ""}\n\n${template.body}`
    : template.body;

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  }

  function onToggleStar() {
    const fd = new FormData();
    fd.set("id", template.id);
    fd.set("next", template.starred ? "0" : "1");
    startTransition(() => {
      void toggleStar(fd);
    });
  }

  function onArchive() {
    if (!window.confirm("Archive this template? It'll be hidden but not deleted.")) return;
    const fd = new FormData();
    fd.set("id", template.id);
    startTransition(() => {
      void archive(fd);
    });
  }

  const truncated = template.body.length > 280;
  const shown = expanded || !truncated ? template.body : template.body.slice(0, 280) + "…";

  return (
    <div className="border border-rule rounded-sm p-4 bg-paper flex flex-col">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold border px-1.5 py-0.5 rounded-sm ${channelClass(
              template.channel
            )}`}
          >
            {CHANNEL_LABEL[template.channel]}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-subtle border border-rule px-1.5 py-0.5 rounded-sm">
            {PROGRAM_LABEL[template.program]}
          </span>
          {template.audience && (
            <span className="text-[10px] text-subtle">· {template.audience}</span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleStar}
          className={`text-lg leading-none ${
            template.starred ? "text-amber-500" : "text-subtle hover:text-amber-500"
          }`}
          aria-label={template.starred ? "Unstar" : "Star"}
          title={template.starred ? "Unstar" : "Star"}
        >
          ★
        </button>
      </div>

      <div className="text-xs text-muted mb-2 line-clamp-1">
        Goal: <span className="text-ink">{template.goal}</span>
      </div>

      {template.subject && (
        <div className="mb-2">
          <div className="text-[10px] uppercase tracking-wider text-subtle">Subject</div>
          <div className="text-sm font-semibold text-ink">{template.subject}</div>
        </div>
      )}
      {template.preview_text && (
        <div className="mb-2">
          <div className="text-[10px] uppercase tracking-wider text-subtle">Preview</div>
          <div className="text-xs text-muted italic">{template.preview_text}</div>
        </div>
      )}

      <div className="text-sm text-ink whitespace-pre-wrap leading-snug flex-1">{shown}</div>
      {truncated && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs text-teal-deep hover:text-teal self-start"
        >
          {expanded ? "Show less" : "Show full"}
        </button>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="text-subtle">{template.char_count} chars</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="border border-rule text-ink hover:bg-paper-subtle px-2 py-1 rounded-sm"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            type="button"
            onClick={onArchive}
            className="text-subtle hover:text-rose-700 px-2 py-1 rounded-sm"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}
