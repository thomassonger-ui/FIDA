"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  ticketId: string;
  // When the ticket isn't linked to an enrolled student, supply these so the
  // form can also open the staff member's mail client to deliver the reply.
  prospectEmail?: string | null;
  prospectName?: string | null;
  subject?: string | null;
};

/** Staff-side quick replies — click a chip to populate the textarea, then edit
 *  before sending. Tuned for Debbie & Ashley's most common reply patterns. */
const STAFF_PROMPTS: { label: string; body: string }[] = [
  {
    label: "Welcome",
    body:
      "Welcome to FIDA — so glad to have you on board. I'm here whenever you have a question. Reply to this message anytime and I'll get back to you within one business day.",
  },
  {
    label: "Request a document",
    body:
      "Could you upload a copy of [document] when you get a chance? You can attach it directly to this message thread, or upload it from your /portal/documents page. Let me know if you have any trouble.",
  },
  {
    label: "Schedule confirmation",
    body:
      "Confirming we have you scheduled for [day, date] at [time]. If anything changes on your end, just reply here and we'll move it. Looking forward to seeing you.",
  },
  {
    label: "Looking into it",
    body:
      "Thanks for flagging this — I'm looking into it now and will get back to you with an answer by end of day. Hang tight.",
  },
  {
    label: "Friendly nudge",
    body:
      "Just a friendly check-in — haven't heard back from you in a few days. Everything okay? Reply when you get a moment and we'll pick up where we left off.",
  },
];

function buildReplyMailto(opts: {
  to: string;
  subject: string;
  prospectName: string | null;
  replyBody: string;
}): string {
  const firstName = opts.prospectName?.split(" ")[0] ?? "";
  const greeting = firstName ? `Hi ${firstName},\n\n` : "Hi,\n\n";
  const body = `${greeting}${opts.replyBody}\n\n— FIDA Support\nsuccess@fldentalassisting.com`;
  return `mailto:${encodeURIComponent(opts.to)}?subject=${encodeURIComponent(
    "Re: " + opts.subject
  )}&body=${encodeURIComponent(body)}`;
}

export function AdminReplyForm({
  ticketId,
  prospectEmail,
  prospectName,
  subject,
}: Props) {
  const router = useRouter();
  const [internal, setInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [dictationSupported, setDictationSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Web Speech API — browser-native, no API keys, free. Chrome/Edge/Safari.
  // Sets up a SpeechRecognition instance once on mount and toggles via button.
  // Falls back gracefully if the API isn't available (Firefox, older browsers).
  // We keep the instance on a ref so the button handlers can stop/start it.
  const recognitionRef = useRef<unknown>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = true;
    r.interimResults = false;
    r.lang = "en-US";
    r.onresult = (e: SpeechRecognitionResultLike) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript + " ";
      }
      const ta = textareaRef.current;
      if (ta && transcript.trim()) {
        const cur = ta.value;
        const sep = cur && !cur.endsWith(" ") ? " " : "";
        ta.value = cur + sep + transcript.trim();
      }
    };
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    recognitionRef.current = r;
    setDictationSupported(true);
  }, []);

  function toggleDictation() {
    const r = recognitionRef.current as SpeechRecognitionLike | null;
    if (!r) return;
    if (isListening) {
      try {
        r.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    } else {
      try {
        r.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  }

  function applyPrompt(body: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.value = body;
    ta.focus();
    // Place caret at the end so the user can start editing immediately.
    const len = ta.value.length;
    ta.setSelectionRange(len, len);
  }

  const isProspect = !!prospectEmail;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("internal", internal ? "1" : "0");
    const replyBody = String(fd.get("body") ?? "").trim();

    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Could not send. Please try again.");
        setSubmitting(false);
        return;
      }
      // For prospects (unlinked tickets), also open the mail client with the
      // saved reply pre-filled. Skip when it's an internal note.
      if (isProspect && !internal && replyBody && prospectEmail && subject) {
        const href = buildReplyMailto({
          to: prospectEmail,
          subject,
          prospectName: prospectName ?? null,
          replyBody,
        });
        window.location.href = href;
      }
      form.reset();
      setInternal(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="eyebrow">
          {internal
            ? "Internal note (not visible to student)"
            : isProspect
            ? "Reply to submitter"
            : "Reply to student"}
        </div>
        <label className="text-xs text-muted inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={internal}
            onChange={(e) => setInternal(e.target.checked)}
          />
          Internal note
        </label>
      </div>

      {/* Sample prompts — click to populate the textarea, then edit before sending. */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-subtle self-center mr-1">
          Quick replies:
        </span>
        {STAFF_PROMPTS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPrompt(p.body)}
            className="text-xs px-2.5 py-1 rounded-full border border-rule bg-paper-subtle hover:bg-teal/10 hover:border-teal hover:text-teal-deep transition-colors"
            title={p.body}
          >
            {p.label}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        name="body"
        rows={6}
        maxLength={8000}
        placeholder={
          internal
            ? "Add a private note for the team…"
            : isProspect
            ? "Reply — saves to the ticket thread and opens your mail client with this text pre-filled…"
            : "Reply to the student…"
        }
        className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-teal resize-y"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-muted cursor-pointer hover:text-teal transition-colors">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-rule hover:border-teal">
              📎 Attach a file (max 10 MB)
            </span>
            <input type="file" name="attachment" className="hidden" />
          </label>
          {dictationSupported && (
            <button
              type="button"
              onClick={toggleDictation}
              aria-pressed={isListening}
              className={
                isListening
                  ? "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-red-50 border-red-300 text-red-800 text-sm animate-pulse"
                  : "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-rule hover:border-teal hover:text-teal-deep text-sm text-muted transition-colors"
              }
              title={
                isListening
                  ? "Click to stop dictation"
                  : "Click to start dictation (browser speech-to-text)"
              }
            >
              {isListening ? "🔴 Listening… click to stop" : "🎤 Dictate"}
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:opacity-50"
        >
          {submitting
            ? "Saving…"
            : internal
            ? "Save note"
            : isProspect
            ? "Save & open email"
            : "Send reply"}
        </button>
      </div>

      <div className="text-xs text-subtle">
        {internal
          ? "Internal notes stay in the admin queue — students never see them."
          : isProspect
          ? "Prospect messages aren't connected to a portal yet, so we'll save your reply to the thread for the record AND open your mail client to send it directly. Convert them to a student to switch to portal-only replies."
          : "Replies post into the student's portal at /portal/tickets. The student sees it next time they sign in."}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
    </form>
  );
}

// Minimal local typings for the Web Speech API so we don't depend on the
// experimental DOM lib. Only the bits we actually call are modelled.
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionResultLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
type SpeechRecognitionResultLike = {
  resultIndex: number;
  results: { [i: number]: { [j: number]: { transcript: string } }; length: number };
};
