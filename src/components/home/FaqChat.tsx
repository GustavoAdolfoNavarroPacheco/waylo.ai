"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { MascotMark } from "@/components/mascot";
import { duration, easing } from "@/design/motion";

const ease = [...easing.standard] as [number, number, number, number];

export interface FaqItem {
  question: string;
  answer: string;
}

/** How long Waylo "types" before the answer shows: a little longer for a longer answer. */
function typingMs(answer: string): number {
  return Math.min(1100, 500 + answer.length * 2);
}

function TypingDots({ label }: { label: string }) {
  return (
    <motion.div
      role="status"
      aria-label={label}
      className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-sm bg-surface px-5 py-4"
      style={{ transformOrigin: "0% 100%" }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.12, ease } }}
      transition={{ duration: duration.fast, ease }}
    >
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          aria-hidden
          className="size-2 rounded-full bg-text-muted"
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: dot * 0.15 }}
        />
      ))}
    </motion.div>
  );
}

/**
 * The common questions as a chat. Each question is a message the visitor "sends" by tapping it; Waylo answers
 * after a moment of typing dots, which give way to the reply. One answer is open at a time. The answers are always
 * in the page (hidden while closed), so they are there for search engines and for screen readers.
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
  const reduced = useReducedMotion();
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [typing, setTyping] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function toggle(index: number) {
    window.clearTimeout(timer.current);
    if (openIndex === index) {
      setOpenIndex(null);
      setTyping(false);
      return;
    }
    setOpenIndex(index);
    if (reduced) {
      setTyping(false);
      return;
    }
    setTyping(true);
    timer.current = window.setTimeout(() => setTyping(false), typingMs(faqs[index].answer));
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-hidden rounded-xl bg-surface-raised shadow-raised">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4 sm:px-8">
          <MascotMark size={44} className="shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="font-heading text-body font-semibold text-text">Waylo</span>
            <span className="flex items-center gap-2 text-caption text-text-muted">
              <span aria-hidden className="size-2 rounded-full bg-success" />
              {status}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 p-5 sm:p-8">
          <div className="flex items-end gap-3">
            <MascotMark size={36} className="shrink-0" />
            <p className="max-w-[88%] rounded-2xl rounded-bl-sm bg-surface px-5 py-3 text-body text-text">{greeting}</p>
          </div>

          <ul className="flex flex-col gap-6">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const questionId = `${baseId}-q${index}`;
              const answerId = `${baseId}-a${index}`;
              return (
                // "position" moves the items below smoothly when an answer opens or closes, with a transform only.
                <motion.li key={faq.question} layout="position" className="flex flex-col gap-3">
                  <button
                    type="button"
                    id={questionId}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => toggle(index)}
                    className="lift lift-sm ml-auto max-w-[88%] cursor-pointer rounded-2xl rounded-br-sm bg-text px-5 py-3 text-left font-heading text-body font-semibold text-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                  >
                    {faq.question}
                  </button>

                  <div id={answerId} role="region" aria-labelledby={questionId} hidden={!isOpen} className="flex items-end gap-3">
                    <MascotMark size={36} className="shrink-0" />
                    <div className="relative min-w-0 max-w-[88%]">
                      {/* The dots leave the flow as they go, so the reply takes their place without a jump. */}
                      <AnimatePresence mode="popLayout" initial={false}>
                        {isOpen && typing ? (
                          <TypingDots key="typing" label={typingLabel} />
                        ) : (
                          <motion.p
                            key="answer"
                            hidden={!isOpen}
                            className="rounded-2xl rounded-bl-sm bg-surface px-5 py-4 text-body text-text"
                            style={{ transformOrigin: "0% 100%" }}
                            initial={{ opacity: 0, scale: 0.85, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: duration.base, ease }}
                          >
                            {faq.answer}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </MotionConfig>
  );
}
