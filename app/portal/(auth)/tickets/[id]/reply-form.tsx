"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Student-side quick replies — click a chip to populate the textarea, then
 *  edit before sending. Tuned for the things students actually message about. */
const STUDENT_PROMPTS: { label: string; body: string }[] = [
  {
    label: "Thanks",
    body:
      "Thank you! That answers my question — really appreciate the quick response.",
  },
  {
    label: "Question about a lesson",
    body:
      "I have a question about [lesson / topic]. Could you help me understand [specific part] when you have a moment? Thanks!",
  },
  {
    label: "Need to reschedule",
    body:
      "I have a conflict with [day / date] and won't be able to make it. Is there another time we can do? Sorry for the short notice.",
  },
  {
    label: "Running late",
    body:
      "Heads up — running a few minutes late today. I'll be there as soon as I can.",
  },
  {
    label: "Sending document",
    body:
      "Attaching [document name] as requested. Let me know if you need anything else.",
  },
];

export function PortalReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [dictationSupported, setDictationSupported] = useState(false);
  const [attachedFilename, setAttachedFilename] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Web Speech API — browser-native, no API keys, free. Chrome/Edge/Safari.
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
    const len = ta.value.length;
    ta.setSelectionRange(len, len);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      const res = await fetch(`/api/portal/tickets/${ticketId}/reply`, {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Could not send. Try again.");
        setSubmitting(false);
        return;
      }
      if (json.attachmentError) {
        setError(
          `Message sent, but the attachment failed to upload: ${json.attachmentError}`
        );
        setSubmitting(false);
        router.refresh();
        return;
      }
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
    <form onSubmit={handleSubmit} className="card p-5 space-y-3">
      <div className="eyebrow">Reply</div>

      {/* Sample prompts — click to populate the textarea, then edit before sending. */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-subtle self-center mr-1">
          Quick replies:
        </span>
        {STUDENT_PROMPTS.map((p) => (
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
        rows={5}
        maxLength={8000}
        placeholder="Type your reply…"
        className="w-full rounded-md border border-rule bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-teal resize-y"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Always-mounted file input; the visible label changes based on
              whether a file is selected so the user can see what's attached. */}
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
          {submitting ? "Sending…" : "Send reply"}
        </button>
      </div>

      <div className="text-xs text-subtle">
        All conversation stays inside the FIDA portal for compliance.
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
    </form>
  );
}

// Minimal local typings for the Web Speech API.
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
