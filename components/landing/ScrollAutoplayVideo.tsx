"use client";

import { useEffect, useRef, useState } from "react";

/**
 * YouTube embed that starts playing when it scrolls into view, muted, with a
 * prominent control to turn sound on.
 *
 * Why muted: every current browser blocks autoplay WITH sound unless the
 * visitor has already interacted with the site or has a high media-engagement
 * score for it. An iframe with autoplay=1 and no mute=1 simply never starts
 * for a first-time visitor, which is most of the traffic on /about. Muted
 * autoplay is allowed everywhere, so the video moves, and one tap gives sound.
 *
 * WCAG 1.4.2 — audio that plays automatically for more than three seconds
 * needs a stop mechanism. It starts silent, and once unmuted the sound control
 * stays on screen as pause/mute, so there is always a way to stop it.
 *
 * prefers-reduced-motion is honoured: the video does not start on its own, and
 * the viewer gets a play control instead.
 *
 * The iframe is only mounted once it nears the viewport, so the page doesn't
 * pay for YouTube's payload on load. youtube-nocookie matches the embed used
 * elsewhere on the site.
 */
export function ScrollAutoplayVideo({
  youtubeId,
  title,
  className = "",
}: {
  youtubeId: string;
  title: string;
  className?: string;
}) {
  const holderRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const [mounted, setMounted] = useState(false); // iframe in the DOM yet?
  const [started, setStarted] = useState(false); // autoplay triggered?
  const [unmuted, setUnmuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(
      typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true,
    );
  }, []);

  /* Mount the iframe a little before it's visible; start it once it actually
     is. Two thresholds through one observer. */
  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;

    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMounted(true);
          near.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    near.observe(el);

    const visible = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          setStarted(true);
          visible.disconnect();
        }
      },
      { threshold: [0.5] },
    );
    visible.observe(el);

    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, []);

  /* YouTube's iframe API over postMessage — no extra script needed for the
     handful of commands we use. */
  function command(func: "unMute" | "mute" | "playVideo" | "pauseVideo") {
    frameRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: [] }),
      "*",
    );
  }

  function toggleSound() {
    if (unmuted) {
      command("mute");
      setUnmuted(false);
    } else {
      command("unMute");
      command("playVideo"); // covers the reduced-motion case, where it never started
      setUnmuted(true);
    }
  }

  const autoplay = started && !reducedMotion ? 1 : 0;
  /* origin is REQUIRED alongside enablejsapi=1. Without it YouTube refuses the
     embed outright and renders "Video unavailable" — verified against this
     exact video, which plays normally from the same page without the JS API.
     It is read at render time, after mount, so window is available. */
  const origin =
    typeof window !== "undefined" ? `&origin=${encodeURIComponent(window.location.origin)}` : "";
  const src =
    `https://www.youtube-nocookie.com/embed/${youtubeId}` +
    `?autoplay=${autoplay}&mute=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1${origin}`;

  return (
    <div ref={holderRef} className={`relative w-full ${className}`} style={{ aspectRatio: "16 / 9" }}>
      {mounted ? (
        <iframe
          ref={frameRef}
          src={src}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <div className="absolute inset-0 bg-navy/10" aria-hidden="true" />
      )}

      {/* Sound control. Sits above the iframe, always reachable, and doubles as
          the stop mechanism WCAG 1.4.2 asks for once audio is on. */}
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={unmuted}
        className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-full bg-navy/90 px-5 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-sm transition hover:bg-navy focus:outline-none focus:ring-2 focus:ring-white/70"
      >
        {unmuted ? (
          <>
            <span aria-hidden="true">🔊</span> Sound on — tap to mute
          </>
        ) : (
          <>
            <span aria-hidden="true">🔈</span> Tap for sound
          </>
        )}
      </button>
    </div>
  );
}
