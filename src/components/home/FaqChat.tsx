"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { TypewriterText } from "@/components/chat/TypewriterText";
import { MascotMark } from "@/components/mascot";
import { SmoothScrollArea, useSmoothScroll } from "@/components/SmoothScrollArea";

// A soft in-out for everything that opens or closes here: no hard start and no sudden stop.
const soft = [0.4, 0, 0.2, 1] as [number, number, number, number];
const OPEN_SECONDS = 0.65;

export interface FaqItem {
  question: string;
  answer: string;
}

/** Where an open answer is: Waylo "thinking" (dots), writing the reply, or finished. */
type Phase = "dots" | "typing" | "done";

/** How long the dots show before the reply is written: long enough for the answer's space to finish opening. */
function dotsMs(answer: string): number {
  return Math.min(1300, 750 + answer.length * 1.5);
}

/**
 * The small curved tail on a bubble's lower corner, which says who sent it. The bubble's own corner is square there,
 * and the tail runs on from its bottom edge and curves back up into its side. It takes the bubble's color.
 */
function Tail({ side, className }: { side: "left" | "right"; className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 10 14"
      className={`absolute bottom-0 h-3.5 w-2.5 fill-current ${
        side === "left" ? "-left-[9.5px]" : "-right-[9.5px] -scale-x-100"
      } ${className}`}
    >
      <path d="M10 0V14H3C6.5 12.5 9 9.5 10 5Z" />
    </svg>
  );
}

/** Three dots in the corner of the answer's bubble, which is already its final size, so nothing resizes when the reply starts. */
function ThinkingDots({ label }: { label: string }) {
  return (
    <motion.span
      role="status"
      aria-label={label}
      className="absolute left-5 top-4 flex h-7 items-center gap-1.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: soft } }}
      transition={{ duration: 0.35, ease: soft }}
    >
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          aria-hidden
          className="size-2 rounded-full bg-text-muted"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: dot * 0.18 }}
        />
      ))}
    </motion.span>
  );
}

function Thread({ faqs, greeting, typingLabel }: { faqs: FaqItem[]; greeting: string; typingLabel: string }) {
  const reduced = useReducedMotion();
  const scroll = useSmoothScroll();
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [phase, setPhase] = useState<Phase>("done");
  const timer = useRef<number | undefined>(undefined);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function toggle(index: number) {
    window.clearTimeout(timer.current);
    if (openIndex === index) {
      setOpenIndex(null);
      setPhase("done");
      return;
    }
    setOpenIndex(index);
    if (reduced) {
      setPhase("done");
      return;
    }
    setPhase("dots");
    timer.current = window.setTimeout(() => setPhase("typing"), dotsMs(faqs[index].answer));
  }

  return (
    <>
      <div className="flex items-end gap-3">
        <MascotMark size={36} className="shrink-0" />
        <p className="relative max-w-[88%] rounded-2xl rounded-bl-none bg-surface px-5 py-3 text-body text-text">
          <Tail side="left" className="text-surface" />
          {greeting}
        </p>
      </div>

      <ul className="flex flex-col gap-6">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const questionId = `${baseId}-q${index}`;
          const answerId = `${baseId}-a${index}`;
          return (
            <li
              key={faq.question}
              ref={(el) => {
                items.current[index] = el;
              }}
              className="flex flex-col"
            >
              <button
                type="button"
                id={questionId}
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => toggle(index)}
                className="lift lift-sm relative ml-auto max-w-[88%] cursor-pointer rounded-2xl rounded-br-none bg-text px-5 py-3 text-left font-heading text-body font-semibold text-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              >
                <Tail side="right" className="text-text" />
                {faq.question}
              </button>

              {/* The answer's space opens and closes on its own, so what is below glides instead of jumping. Always in the page. */}
              <motion.div
                id={answerId}
                role="region"
                aria-labelledby={questionId}
                aria-hidden={!isOpen}
                inert={!isOpen}
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : {
                        height: { duration: OPEN_SECONDS, ease: soft },
                        opacity: { duration: 0.45, ease: soft, delay: isOpen ? 0.12 : 0 },
                      }
                }
                onAnimationComplete={() => {
                  // Once it has opened, bring it into view by the shortest way.
                  const item = items.current[index];
                  if (isOpen && item) scroll?.scrollIntoView(item, 56);
                }}
                className="overflow-hidden"
              >
                <div className="flex items-end gap-3 pt-3">
                  <MascotMark size={36} className="shrink-0" />
                  <p className="relative min-w-0 max-w-[88%] rounded-2xl rounded-bl-none bg-surface px-5 py-4 text-body text-text">
                    <Tail side="left" className="text-surface" />
                    {isOpen && phase === "typing" ? (
                      <TypewriterText text={faq.answer} onDone={() => setPhase("done")} />
                    ) : isOpen && phase === "dots" ? (
                      <span aria-hidden className="invisible">
                        {faq.answer}
                      </span>
                    ) : (
                      faq.answer
                    )}
                    <AnimatePresence>{isOpen && phase === "dots" && <ThinkingDots key="dots" label={typingLabel} />}</AnimatePresence>
                  </p>
                </div>
              </motion.div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/**
 * The common questions as a chat. Each question is a message the visitor "sends" by tapping it; Waylo answers with a
 * moment of dots and then writes the reply letter by letter, as in the real chat. One answer is open at a time. The
 * frame has a fixed size and the conversation scrolls inside it, so the page never moves. The answers are always in the
 * page (closed ones are folded away), so they are there for search engines and for screen readers.
 */
export function FaqChat({
  faqs,
  greeting,
  status,
  typingLabel,
}: {
  faqs: FaqItem[];
  greeting: string;
  status: string;
  typingLabel: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-[34rem] flex-col overflow-hidden rounded-xl bg-surface-raised shadow-raised sm:h-[42rem]">
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-4 sm:px-8">
          <MascotMark size={44} className="shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-body font-semibold text-text">Waylo</span>
            <span className="flex items-center gap-2 text-caption text-text-muted">
              <span aria-hidden className="size-2 rounded-full bg-success" />
              {status}
            </span>
          </div>
        </div>

        {/* Anchoring is off: the browser nudging the scroll as answers fold would fight the glide. */}
        <SmoothScrollArea
          className="scroll-soft scroll-fade min-h-0 flex-1 overflow-y-auto [overflow-anchor:none]"
          contentClassName="flex flex-col gap-6 p-5 sm:p-8"
        >
          <Thread faqs={faqs} greeting={greeting} typingLabel={typingLabel} />
        </SmoothScrollArea>
      </div>
    </MotionConfig>
  );
}
