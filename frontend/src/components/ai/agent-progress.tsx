"use client";

// Adapted from beUI's Agent Progress component.
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE_IN_OUT } from "@/lib/motion/ease";
import { cn } from "@/lib/utils";

const GRID_CELLS = [
  { id: "top-left", delay: 0 },
  { id: "top-center", delay: 0.14 },
  { id: "top-right", delay: 0.28 },
  { id: "middle-left", delay: 0.42 },
  { id: "middle-center", delay: 0.56 },
  { id: "middle-right", delay: 0.7 },
  { id: "bottom-left", delay: 0.84 },
  { id: "bottom-center", delay: 0.98 },
  { id: "bottom-right", delay: 1.12 },
];

interface AgentProgressProps {
  label: string;
  className?: string;
}

function formatElapsed(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = Math.floor(safeSeconds % 60).toString().padStart(2, "0");
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export function AgentProgress({ label, className }: AgentProgressProps) {
  const reduce = useReducedMotion() ?? false;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((performance.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <span
      role="status"
      aria-label={`${label}, in progress`}
      className={cn(
        "inline-flex items-center gap-3 text-sm text-muted-foreground",
        className,
      )}
    >
      <span aria-hidden="true" className="grid size-5 shrink-0 grid-cols-3 gap-0.5">
        {GRID_CELLS.map(({ id, delay }) => (
          <motion.span
            key={id}
            className="rounded-[1px] bg-current"
            animate={
              reduce
                ? { opacity: [0.35, 0.8, 0.35] }
                : { opacity: [0.28, 1, 0.28], scale: [0.72, 1, 0.72] }
            }
            transition={{
              duration: 1.8,
              ease: EASE_IN_OUT,
              repeat: Infinity,
              delay,
            }}
          />
        ))}
      </span>
      <span className="font-medium text-foreground">{label}</span>
      <span aria-hidden="true" className="tabular-nums text-muted-foreground/70">
        {formatElapsed(elapsedSeconds)}
      </span>
    </span>
  );
}
