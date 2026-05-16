"use client";

import { useState } from "react";
import { submitInquiry } from "./actions";

export default function InquiryForm({ source }: { source: string | null }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.set("name", name);
    fd.set("phone", phone);
    fd.set("question", question);
    if (source) fd.set("source", source);

    const result = await submitInquiry(fd);

    if (result.ok) {
      setDone(true);
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="mt-10 border border-teal/30 bg-teal-50 rounded-sm p-6">
        <div className="eyebrow text-teal-deep">Got it — talk soon</div>
        <p className="font-display text-xl text-ink mt-2 leading-snug">
          Thanks, {name.split(" ")[0] || "friend"}. Debbie or Ashley will text you tonight.
        </p>
        <p className="text-sm text-muted mt-3">
          They answer personally — usually within a few hours, often the same evening. If
          you sent a specific question, expect an actual answer, not a brochure.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 border border-rule bg-paper-subtle rounded-sm p-6">
      <div className="eyebrow text-teal-deep">Talk to a real person</div>
      <p className="font-display text-xl text-ink mt-2 leading-snug">
        Drop your number. Get a text back tonight — even if it&rsquo;s after hours.
      </p>
      <p className="text-sm text-muted mt-3 leading-relaxed">
        Other schools make you fill a form and wait until Monday. Debbie and Ashley
        answer their phones at 9pm because that&rsquo;s when working adults can actually
        talk. No call center. No bot. Just the people who&rsquo;ll teach you.
      </p>

      <div className="mt-5 grid sm:grid-cols-2 gap-3">
        <div>
          <label className="eyebrow text-muted">Your name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maria Lopez"
            required
            maxLength={120}
            autoComplete="name"
            className="mt-1 w-full border border-rule rounded-sm px-3 py-2 text-sm bg-paper"
          />
        </div>
        <div>
          <label className="eyebrow text-muted">Mobile number</label>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(904) 555-0123"
            required
            maxLength={30}
            autoComplete="tel"
            inputMode="tel"
            className="mt-1 w-full border border-rule rounded-sm px-3 py-2 text-sm bg-paper"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="eyebrow text-muted">Your question (optional)</label>
        <textarea
          name="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Do my dental front-desk hours count toward the program?"
          maxLength={1000}
          rows={3}
          className="mt-1 w-full border border-rule rounded-sm px-3 py-2 text-sm bg-paper"
        />
        <p className="text-[11px] text-subtle mt-1">
          Skip it if you&rsquo;re not sure what to ask — they&rsquo;ll start the conversation.
        </p>
      </div>

      {error && (
        <p className="text-sm text-rose-700 mt-3 bg-rose-50 border border-rose-200 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 bg-teal text-white text-sm font-semibold px-4 py-2 rounded-sm hover:bg-teal-deep transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending…" : "Text me back tonight"}
      </button>

      <p className="text-[11px] text-subtle mt-3">
        By tapping the button you agree FIDA can text you about admissions. Reply STOP to opt
        out anytime. No spam, no autodialers, no sharing your number.
      </p>
    </form>
  );
}
