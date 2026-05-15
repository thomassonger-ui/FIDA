"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const OPENING_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi — I'm Atticus, the admissions advisor for Florida Institute of Dental Assisting. I'm here to help you figure out if one of our programs is the right fit, and walk you through next steps if it is. What's bringing you to us today?",
};

const QUICK_PROMPTS = [
  "I want to change careers into healthcare.",
  "I'm not sure which program fits me.",
  "I need something flexible — I work full-time.",
  "What's the fastest path to a job?",
];

export function AtticusChat({ initialProgram }: { initialProgram?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([OPENING_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const sessionIdRef = useRef<string>("");

  // One session id per tab; used for rate-limit keying + DB row grouping.
  useEffect(() => {
    if (sessionIdRef.current) return;
    try {
      const existing = window.sessionStorage.getItem("atticus:session");
      if (existing) {
        sessionIdRef.current = existing;
      } else {
        const fresh =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
              });
        window.sessionStorage.setItem("atticus:session", fresh);
        sessionIdRef.current = fresh;
      }
    } catch {
      sessionIdRef.current = Math.random().toString(36).slice(2);
    }
  }, []);

  // Auto-scroll when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // If ?program=medical-billing is in the URL, seed the first user message
  useEffect(() => {
    if (!initialProgram) return;
    const programNames: Record<string, string> = {
      "medical-assisting": "Medical Assisting",
      "medical-billing": "Medical Billing & Coding",
      "patient-care": "Patient Care Technology",
    };
    const label = programNames[initialProgram];
    if (!label) return;
    // Only seed if we're still at the opener
    setMessages((prev) => {
      if (prev.length !== 1) return prev;
      return [
        ...prev,
        {
          role: "user",
          content: `I'm interested in ${label}. Can you tell me more and walk me through next steps?`,
        },
      ];
    });
    // Kick off auto-send for the seeded question
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProgram]);

  // Autosend when the last message is from user and no loading (e.g., seeded message)
  useEffect(() => {
    if (isLoading) return;
    if (messages.length < 2) return;
    const last = messages[messages.length - 1];
    if (last.role !== "user") return;
    // only autosend if the preceding message is the opening assistant message
    // (i.e., we just seeded a question)
    const prev = messages[messages.length - 2];
    if (prev !== OPENING_MESSAGE) return;
    void send(messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  async function send(currentMessages: ChatMessage[]) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/atticus", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-atticus-session": sessionIdRef.current || "",
        },
        body: JSON.stringify({ messages: currentMessages }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Atticus hit an error. Try again in a moment.");
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "(no response)" },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    await send(next);
  }

  function handleQuickPrompt(prompt: string) {
    if (isLoading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: prompt }];
    setMessages(next);
    void send(next);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <div className="card bg-white shadow-lift overflow-hidden flex flex-col h-[640px] max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-rule bg-paper-subtle">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-white border border-rule flex items-center justify-center overflow-hidden">
            <Image
              src="/atticus-logo.png"
              alt="Atticus"
              width={40}
              height={40}
              className="w-full h-full object-contain p-1"
            />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-teal border-2 border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg text-navy leading-tight">Atticus</div>
          <div className="text-xs text-muted flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal" />
            AI Admissions Advisor &middot; online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[82%] bg-navy text-white px-4 py-3 rounded-2xl rounded-br-sm text-sm leading-relaxed"
                  : "max-w-[82%] bg-paper-subtle text-navy px-4 py-3 rounded-2xl rounded-bl-sm text-sm leading-relaxed border border-rule"
              }
            >
              {m.content.split("\n").map((line, j) => (
                <p key={j} className={j > 0 ? "mt-2" : ""}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-paper-subtle border border-rule px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="max-w-[82%] bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded-2xl text-sm">
              {error}
            </div>
          </div>
        )}

        {/* PII / AI disclosure — only on first view */}
        {messages.length === 1 && !isLoading && (
          <div className="rounded-lg border border-rule bg-white px-3 py-2.5 text-[11px] leading-relaxed text-muted">
            <strong className="text-navy">Heads up:</strong> Atticus is an AI
            admissions advisor &mdash; not a human and not a medical or legal
            professional. Please don&rsquo;t share your SSN, insurance info, or
            medical history in chat. A real FIDA advisor follows up within one
            business day.
          </div>
        )}

        {/* Quick prompts — only show at start */}
        {messages.length === 1 && !isLoading && (
          <div className="flex flex-wrap gap-2 pt-2">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleQuickPrompt(q)}
                className="text-xs text-navy bg-white border border-rule hover:border-teal hover:text-teal px-3 py-1.5 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="border-t border-rule px-4 py-3 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 resize-none text-sm text-navy placeholder:text-subtle focus:outline-none bg-paper-subtle rounded-lg px-3 py-2.5 border border-rule focus:border-teal focus:bg-white transition-colors disabled:opacity-60"
            style={{ maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-teal hover:bg-teal-deep disabled:bg-subtle disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors flex-shrink-0"
          >
            Send
          </button>
        </div>
        <div className="mt-2 text-[11px] text-subtle px-1">
          Press Enter to send, Shift+Enter for new line. Atticus is an AI &mdash; a human advisor will follow up within 1 business day.
        </div>
      </form>
    </div>
  );
}
