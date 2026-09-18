"use client";

import { useEffect, useRef } from "react";

/**
 * A YouTube video in a modal, so "Take a virtual tour" doesn't send the
 * visitor off to youtube.com in the middle of deciding how to pay.
 *
 * Unlike the QuickBooks payment page — which cannot be framed at all, because
 * Intuit sends x-frame-options SAMEORIGIN — YouTube publishes an embed domain
 * for exactly this, so the tour can stay on the page.
 *
 * The iframe is mounted only while the modal is open. That is what makes the
 * close button work as a stop control: unmounting ends playback, so there is
 * no audio left running behind a dismissed dialog. It also means the page
 * never pays for YouTube's payload unless someone asks for the tour.
 *
 * autoplay=1 is safe here in a way it is not on page load: opening the modal
 * IS the user gesture browsers require, so sound plays without mute=1.
 */
export function VideoModal({
  open,
  onClose,
  youtubeId,
  title,
  closeLabel,
}: {
  open: boolean;
  onClose: () => void;
  youtubeId: string;
  title: string;
  closeLabel: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  /* Lock the page behind the modal and put focus somewhere useful, so the
     keyboard doesn't wander into the page underneath. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(id);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/80 px-4 py-6 md:py-10"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-4xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 pb-3">
          <h2 className="font-display text-xl text-white md:text-2xl">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            {closeLabel} <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div
          className="w-full overflow-hidden rounded-lg bg-black shadow-2xl"
          style={{ aspectRatio: "16 / 9" }}
        >
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
