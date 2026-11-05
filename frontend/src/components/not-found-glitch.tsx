"use client";

// Adapted from beUI's NotFoundGlitch block.
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?/\\";
const SCRAMBLE_MS = 700;
const TICK_MS = 45;

export function NotFoundGlitch({ code = "404" }: { code?: string }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(code);

  useEffect(() => {
    if (reduce) return;

    const chars = code.split("");
    const startedAt = performance.now();
    let frame = 0;
    let last = 0;

    const scramble = (now: number) => {
      if (now - last >= TICK_MS) {
        last = now;
        const progress = Math.min((now - startedAt) / SCRAMBLE_MS, 1);
        const settled = Math.floor(progress * chars.length);
        setDisplay(
          chars
            .map((character, index) =>
              index < settled || character === " "
                ? character
                : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            )
            .join(""),
        );
      }

      if (now - startedAt < SCRAMBLE_MS) {
        frame = requestAnimationFrame(scramble);
      } else {
        setDisplay(code);
      }
    };

    frame = requestAnimationFrame(scramble);
    return () => cancelAnimationFrame(frame);
  }, [code, reduce]);

  const visibleDisplay = reduce ? code : display;

  return (
    <div
      role="img"
      aria-label={`${code} error code`}
      className="group relative mx-auto select-none font-sans font-semibold leading-none tracking-[-0.08em] text-ink text-[clamp(5rem,18vw,10rem)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-pastel-pink opacity-0 mix-blend-screen transition-[transform,opacity] duration-150 ease-out group-hover:translate-x-0.75 group-hover:opacity-80 motion-reduce:hidden"
      >
        {visibleDisplay}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-pastel-sky opacity-0 mix-blend-screen transition-[transform,opacity] duration-150 ease-out group-hover:-translate-x-0.75 group-hover:opacity-80 motion-reduce:hidden"
      >
        {visibleDisplay}
      </span>
      <span aria-hidden="true" className="relative">
        {visibleDisplay}
      </span>
    </div>
  );
}
