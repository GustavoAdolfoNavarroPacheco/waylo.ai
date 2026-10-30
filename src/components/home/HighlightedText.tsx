"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { duration, easing } from "@/design/motion";

const ease = [...easing.standard] as [number, number, number, number];

// Stroke icons (24 x 24 grid, drawn with a 2px line). Shapes follow the Lucide set, ISC license.
const CIRCLE = "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z";
export const HIGHLIGHT_ICONS = {
  alert: [CIRCLE, "M12 8v4", "M12 16h.01"],
  pulse: ["M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"],
  clock: [CIRCLE, "M12 6v6l4 2"],
  heart: ["M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"],
  file: ["M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", "M14 2v4a2 2 0 0 0 2 2h4", "M10 9H8", "M16 13H8", "M16 17H8"],
} as const;

export type HighlightIcon = keyof typeof HIGHLIGHT_ICONS;

export interface Highlight {
  label: string;
  title: string;
  text: string;
}

/** A line icon that draws itself in when `drawn` turns on and erases when it turns off. */
function DrawIcon({ icon, drawn, className }: { icon: HighlightIcon; drawn: boolean; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {HIGHLIGHT_ICONS[icon].map((d, index) => (
        <motion.path
          key={d}
          d={d}
          initial={false}
          animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 1 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.55, ease, delay: drawn ? index * 0.12 : 0 }}
        />
      ))}
    </svg>
  );
}

const VIEWPORT_MARGIN = 16;

function HighlightWord({ label, title, text, icon }: Highlight & { icon: HighlightIcon }) {
  const id = useId();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<{ below: boolean; shift: number }>({ below: false, shift: 0 });
  const wrapRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLSpanElement>(null);

  // The card sits centered over its word. Before it shows, it is moved back inside the screen if it would
  // cross an edge, and put under the word if there is no room above it.
  useLayoutEffect(() => {
    if (!open) return;
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;
    const word = wrap.getBoundingClientRect();
    const width = card.offsetWidth;
    const height = card.offsetHeight;
    const left = word.left + word.width / 2 - width / 2;
    const overflowLeft = VIEWPORT_MARGIN - left;
    const overflowRight = left + width - (window.innerWidth - VIEWPORT_MARGIN);
    const shift = overflowLeft > 0 ? overflowLeft : overflowRight > 0 ? -overflowRight : 0;
    setPlacement({ below: word.top < height + VIEWPORT_MARGIN * 2, shift });
  }, [open]);

  // A tap elsewhere or Escape closes it, which is how a touch screen leaves it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const tooltipId = `${id}-tip`;
  const slide = placement.below ? -8 : 8;

  return (
    <span
      ref={wrapRef}
      className="relative inline-block whitespace-nowrap"
      onPointerEnter={(event) => event.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setOpen(false)}
    >
      <span
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((value) => !value);
          }
        }}
        className="relative -mx-1 inline-block cursor-pointer rounded-md px-1 font-semibold leading-[1.35] text-text outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        {/* A thin line under the word at rest. It gives way to the pill below. */}
        <motion.span
          aria-hidden
          className="absolute inset-x-1 -bottom-0.5 h-0.5 rounded-full bg-text/30"
          initial={false}
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: 0.16 }}
        />
        {/* The pill grows from its center with a quick spring, never stretched, so its corners stay round. */}
        <motion.span
          aria-hidden
          className="absolute -inset-x-1 -inset-y-0.5 rounded-lg bg-text shadow-[0_6px_16px_var(--shadow-deep)]"
          initial={false}
          animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.88 }}
          transition={
            reduced
              ? { duration: 0 }
              : { opacity: { duration: 0.14 }, scale: { type: "spring", stiffness: 560, damping: 34, mass: 0.7 } }
          }
        />
        <span className={`relative transition-colors duration-[var(--duration-base)] ease-standard ${open ? "text-surface" : ""}`}>
          {label}
        </span>
      </span>

      <AnimatePresence>
        {open && (
          <span
            ref={cardRef}
            id={tooltipId}
            role="tooltip"
            style={{ marginLeft: placement.shift }}
            className={`absolute left-1/2 z-30 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 whitespace-normal ${
              placement.below ? "top-full pt-3" : "bottom-full pb-3"
            }`}
          >
            <motion.span
              className="block overflow-hidden rounded-lg bg-surface-raised text-left shadow-raised"
              style={{ transformOrigin: placement.below ? "50% 0%" : "50% 100%" }}
              initial={{ opacity: 0, y: slide, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: slide / 2, scale: 0.97, transition: { duration: duration.fast, ease } }}
              transition={{ duration: duration.base, ease }}
            >
              {/* A small illustration in the tooltip's place of a photo: the same icon, drawn large. */}
              <span className="relative block h-24 overflow-hidden bg-text">
                <span aria-hidden className="absolute -left-6 -top-8 size-28 rounded-full bg-surface/10" />
                <span aria-hidden className="absolute -bottom-10 right-4 size-24 rounded-full bg-surface/10" />
                <DrawIcon icon={icon} drawn={open} className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 text-surface" />
              </span>
              <span className="block p-4">
                <span className="block font-heading text-body font-semibold text-text">{title}</span>
                <span className="mt-1 block text-caption text-text-muted">{text}</span>
              </span>
            </motion.span>
          </span>
        )}
      </AnimatePresence>
    </span>
  );
}

/**
 * A sentence with highlighted words. `template` marks each one with its number, as in "{0}"; hovering,
 * focusing or tapping a word fills its highlight, draws its icon and opens a small card.
 */
export function HighlightedText({
  template,
  highlights,
  icons,
  className,
}: {
  template: string;
  highlights: Highlight[];
  icons: readonly HighlightIcon[];
  className?: string;
}) {
  return (
    <p className={className}>
      {template.split(/(\{\d+\})/).map((part, index) => {
        const slot = part.match(/^\{(\d+)\}$/);
        if (!slot) return part;
        const position = Number(slot[1]);
        const highlight = highlights[position];
        return highlight ? <HighlightWord key={index} {...highlight} icon={icons[position] ?? "alert"} /> : null;
      })}
    </p>
  );
}
