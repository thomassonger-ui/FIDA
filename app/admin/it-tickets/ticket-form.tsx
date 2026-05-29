"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** 5 sample prompts the school can click → populates the textarea, then edit. */
const SCHOOL_PROMPTS: { label: string; subject: string; body: string }[] = [
  {
    label: "Page won't load",
    subject: "Page won't load",
    body:
      "When I open [URL], the page never finishes loading / shows an error. I've tried refreshing and signing out and back in. Steps to reproduce: 1) ... 2) ... 3) ...",
  },
  {
    label: "Wrong data showing",
    subject: "Wrong data on a page",
    body:
      "On [page], I'm seeing [what you see]. I expected to see [what should show]. The student/cohort affected is [name].",
  },
  {
    label: "Can't upload a file",
    subject: "File upload not working",
    body:
      "Trying to attach [filename, size] on [page] but the upload fails / nothing happens. File type: [.pdf / .docx / etc].",
  },
  {
    label: "Email / notification missing",
    subject: "Notification didn't arrive",
    body:
      "A notification that should have gone out didn't arrive. Expected: [what / to whom / when]. Affected user: [name / email].",
  },
  {
    label: "Feature request",
    subject: "Feature request",
    body:
      "It would help if FIDA could [describe what you want]. The reason: [why this matters / what it solves]. Priority on our end: [nice-to-have / blocker].",
  },
];

export function ITTicketForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [dictationSupported, setDictationSupported] = useState(false);
  const [attachedFilename, setAttachedFilename] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Web Speech API for dictation (browser-native, no API keys).
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

  function applyPrompt(p: (typeof SCHOOL_PROMPTS)[number]) {
    if (subjectRef.current) {
      subjectRef.current.value = p.subject;
    }
    const ta = textareaRef.current;
    if (!ta) return;
    ta.value = p.body;
    ta.focus();
    const len = ta.value.length;
    ta.setSelectionRange(len, len);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/admin/it-tickets", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Could not submit. Try again.");
        setSubmitting(false);
        return;
      }
      const emailNote = json.emailSent
        ? "Email sent to Tom@TryAtticus.com."
        : json.emailError
        ? `Saved, but email notification failed: ${json.emailError}. Tom will still see this on his side.`
        : "Saved. Tom will see this on his side.";
      setSuccess("Ticket submitted. " + emailNote);
      form.reset();
      setAttachedFilename(null);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <div className="eyebrow">Submit a ticket</div>

      {/* Sample prompts */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-subtle self-center mr-1">
          Sample prompts:
        </span>
        {SCHOOL_PROMPTS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPrompt(p)}
            className="text-xs px-2.5 py-1 rounded-full border border-rule bg-paper-subtle hover:bg-teal/10 hover:border-teal hover:text-teal-deep transition-colors"
            title={p.body}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Reminder dropdown */}
      <details
        open={showReminder}
        onToggle={(e) => setShowReminder((e.target as HTMLDetailsElement).open)}
        className="border border-rule rounded-sm bg-paper-subtle"
      >
        <summary className="cursor-pointer px-4 py-2 text-xs font-semibold uppercase tracking-wider text-teal-deep select-none">
          What to include in your ticket
        </summary>
        <ul className="px-4 pb-3 pt-1 text-sm text-muted space-y-1 list-disc list-inside">
          <li>
            <span className="text-ink font-medium">What page</span> you were on
            (paste the URL).
          </li>
          <li>
            <span className="text-ink font-medium">What you were doing</span>{" "}
            when it happened.
          </li>
          <li>
            <span className="text-ink font-medium">What you expected</span> vs.
            what actually happened.
          </li>
          <li>
            <span className="text-ink font-medium">Any error messages</span> the
            screen showed.
          </li>
          <li>
            <span className="text-ink font-medium">When it happened</span> (date
            / time).
          </li>
          <li>
            <span className="text-ink font-medium">A screenshot</span> if you
            can grab one — attach below.
          </li>
        </ul>
      </details>

      {/* Subject */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted">
          Subject
        </label>
        <input
          ref={subjectRef}
          type="text"
          name="subject"
          required
          maxLength={200}
          placeholder="Short summary of the problem"
          className="mt-1 w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-teal"
        />
      </div>

      {/* Body */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted">
          Message
        </label>
        <textarea
          ref={textareaRef}
          name="body"
          rows={8}
          required
          maxLength={8000}
          placeholder="Tell Tom what's going on. The dropdown above has a quick reminder of what to include."
          className="mt-1 w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-teal resize-y"
        />
      </div>

      {/* Optional submitter name */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted">
          Your name (optional)
        </label>
        <input
          type="text"
          name="submitted_by_name"
          maxLength={120}
          placeholder="Debbie, Ashley, etc."
          className="mt-1 w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-teal"
        />
      </div>

      {/* Attach + dictate + submit row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            name="attachment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setAttachedFilename(f ? f.name : null);
            }}
          />
          {attachedFilename ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-teal bg-teal/10 text-sm text-teal-deep">
              <span className="font-medium">📎 {attachedFilename}</span>
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  setAttachedFilename(null);
                }}
                className="text-xs underline hover:text-ink"
                title="Remove attachment"
              >
                remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-rule hover:border-teal hover:text-teal-deep text-sm text-muted transition-colors"
            >
              📎 Attach a file (max 10 MB)
            </button>
          )}
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
          {submitting ? "Sending…" : "Send to Tom"}
        </button>
      </div>

      <div className="text-xs text-subtle">
        Tickets save here AND get emailed to Tom@TryAtticus.com so he can
        respond fast.
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {success}
        </div>
      )}
    </form>
  );
}

// Local types for the Web Speech API.
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
