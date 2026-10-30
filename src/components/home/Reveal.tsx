"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";
import { duration, easing } from "@/design/motion";

const ease = [...easing.standard] as [number, number, number, number];

/**
 * Brings its content in as it scrolls into view: a short rise and a fade, once. Only transform and opacity
 * change, so the browser can run it on the compositor. Under reduced motion the rise is dropped and the fade stays.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const Tag = motion[as];
  return (
    <MotionConfig reducedMotion="user">
      <Tag
        className={className}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: duration.slow, ease, delay }}
      >
        {children}
      </Tag>
    </MotionConfig>
  );
}
