"use client";

import { useEffect } from "react";
import { motion, useSpring } from "motion/react";
import { prefersReducedMotion } from "@/design/motion";
import { headingOf, shortestTurn } from "./angle";

/** Follows the pointer with a little lag, and turns toward where it is going. Attribute the page styles key on. */
const ACTIVE_ATTRIBUTE = "data-smooth-cursor";

// Stiff and almost critically damped (2 * sqrt(stiffness) = 63): it catches the pointer fast and does not overshoot.
const FOLLOW = { damping: 60, stiffness: 1000, mass: 1, restDelta: 0.001 };
const TURN = { damping: 60, stiffness: 300, mass: 1 };
const SCALE = { stiffness: 500, damping: 35, mass: 1 };
const FADE = { stiffness: 600, damping: 40, mass: 1 };

/** Slower than this (pixels per millisecond) and the cursor keeps its heading instead of twitching. */
const TURN_SPEED = 0.1;
/** How long after the last movement the cursor settles back to its resting size. */
const SETTLE_MS = 150;

const ARROW =
  "M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z";

const INTERACTIVE = "a[href], button, summary, select, label, [role='button'], [role='tab'], [role='option']";
// Over a text field the real caret comes back, so the arrow steps aside.
const TEXT_FIELD =
  "input:not([type='checkbox'], [type='radio'], [type='range'], [type='button'], [type='submit'], [type='file']), textarea, [contenteditable='true']";

/**
 * A cursor for the whole site. Everything it moves is transform and opacity on one fixed element, driven by
 * springs outside React, so it costs no render per frame. It only exists for a mouse: touch screens and pens keep
 * what they have. Over a text field it gives way to the caret, and over something clickable it grows a little.
 */
export function SmoothCursor() {
  const x = useSpring(0, FOLLOW);
  const y = useSpring(0, FOLLOW);
  const rotate = useSpring(0, TURN);
  const scale = useSpring(1, SCALE);
  const opacity = useSpring(0, FADE);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const root = document.documentElement;
    const reduced = prefersReducedMotion();
    root.setAttribute(ACTIVE_ATTRIBUTE, "");

    let seen = false;
    let last = { x: 0, y: 0, time: 0 };
    let heading = { previous: 0, total: 0 };
    let restScale = 1;
    let settle: ReturnType<typeof setTimeout> | undefined;
    let frame = 0;
    let pending: PointerEvent | null = null;

    const move = (event: PointerEvent) => {
      frame = 0;
      const now = performance.now();
      const target = event.target instanceof Element ? event.target : null;
      restScale = target?.closest(INTERACTIVE) ? 1.25 : 1;
      opacity.set(target?.closest(TEXT_FIELD) ? 0 : 1);

      if (!seen || reduced) {
        x.jump(event.clientX);
        y.jump(event.clientY);
      } else {
        x.set(event.clientX);
        y.set(event.clientY);
      }

      const elapsed = now - last.time;
      if (seen && !reduced && elapsed > 0) {
        const dx = event.clientX - last.x;
        const dy = event.clientY - last.y;
        if (Math.hypot(dx, dy) / elapsed > TURN_SPEED) {
          const next = headingOf(dx, dy);
          heading = { previous: next, total: heading.total + shortestTurn(heading.previous, next) };
          rotate.set(heading.total);
          scale.set(restScale * 0.92);
          clearTimeout(settle);
          settle = setTimeout(() => scale.set(restScale), SETTLE_MS);
        } else {
          scale.set(restScale);
        }
      } else {
        scale.set(restScale);
      }

      seen = true;
      last = { x: event.clientX, y: event.clientY, time: now };
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") {
        opacity.set(0);
        return;
      }
      pending = event;
      if (!frame) {
        frame = requestAnimationFrame(() => {
          if (pending) move(pending);
          pending = null;
        });
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") scale.set(restScale * 0.82);
    };
    const onPointerUp = () => scale.set(restScale);
    const onLeave = () => opacity.set(0);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    root.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
      clearTimeout(settle);
      root.removeAttribute(ACTIVE_ATTRIBUTE);
    };
  }, [x, y, rotate, scale, opacity]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] -ml-[15px] -mt-4 text-text"
      style={{ x, y, rotate, scale, opacity, willChange: "transform", viewTransitionName: "smooth-cursor" }}
    >
      <svg width="30" height="32" viewBox="0 0 50 54" fill="none" style={{ filter: "drop-shadow(0 2px 3px var(--shadow-deep))" }}>
        {/* A thick round stroke is what softens the corners: the arrow is drawn small, then fattened by its own stroke. */}
        <g transform="translate(25 27) scale(0.92) translate(-25 -27)" strokeLinejoin="round" strokeLinecap="round">
          <path d={ARROW} fill="var(--surface)" stroke="var(--surface)" strokeWidth="10" />
          <path d={ARROW} fill="currentColor" stroke="currentColor" strokeWidth="5.2" />
        </g>
      </svg>
    </motion.div>
  );
}
