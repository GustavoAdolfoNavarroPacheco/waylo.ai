import { FaqChat } from "@/components/home/FaqChat";
import { HighlightedText, type HighlightIcon } from "@/components/home/HighlightedText";
import { MascotMark } from "@/components/mascot";
import { Reveal } from "@/components/home/Reveal";
import type { Messages } from "@/i18n/messages";

const column = "mx-auto w-full max-w-7xl px-4 sm:px-8";
const sectionTitle = "section-title text-[clamp(2rem,4.6vw,3.25rem)]";
const card = "glass flex flex-col gap-3 rounded-2xl p-6";
const badge = "grid size-10 shrink-0 place-items-center rounded-full bg-text text-surface";

// One icon per highlighted word, in the order the sentence uses them.
const WORD_ICONS: readonly HighlightIcon[] = ["pulse", "alert", "clock", "heart", "file"];

/** A section title with the brand name set in the script face, wherever it falls in the sentence. */
function BrandTitle({ text }: { text: string }) {
  return text.split(/(Waylo)/).map((part, index) =>
    part === "Waylo" ? (
      <span key={index} className="whitespace-nowrap">
        <span className="title-brand">{part}</span>
        <MascotMark size={48} className="ml-[0.2em] inline-block size-[0.9em] align-[-0.1em]" />
      </span>
    ) : (
      part
    ),
  );
}

/**
 * Everything under the hero: how Waylo works, the questions and the legal note.
 * The text is server-rendered, so a search engine reads it without running any script; the pieces that move
 * are small client components that animate only transform and opacity.
 */
export function HomeAbout({ t }: { t: Messages }) {
  const about = t.home.about;
  return (
    <div className={`${column} flex flex-col gap-36 py-20 sm:gap-48 sm:py-28`}>
      <section id="home-steps" aria-labelledby="home-steps-title" className="flex scroll-mt-24 flex-col gap-10">
        <Reveal>
          <h2 id="home-steps-title" className={sectionTitle}>
            <BrandTitle text={about.stepsTitle} />
          </h2>
        </Reveal>
        {/* Above the cards that follow, so the card a word opens is never covered by them. */}
        <Reveal delay={0.05} className="relative z-20">
          <HighlightedText
            template={about.stepsIntro}
            highlights={about.highlights}
            icons={WORD_ICONS}
            className="max-w-4xl text-pretty text-body-lg leading-[2.1] text-text-muted"
          />
        </Reveal>
        <div className="relative">
          {/* Soft shapes behind the cards, straddling their edges, so the glass has something to blur and refract. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <span className="absolute -left-10 -top-12 size-56 rounded-full bg-linear-to-br from-text/50 to-text/10 blur-3xl sm:size-72" />
            <span className="absolute left-[38%] top-[55%] size-44 rounded-full bg-linear-to-br from-text/30 to-text/5 blur-3xl" />
            <span className="absolute -bottom-16 -right-8 size-64 rounded-full bg-linear-to-br from-text/45 to-text/10 blur-3xl sm:size-80" />
          </div>
          <ol className="relative grid gap-4 md:grid-cols-3">
            {about.steps.map((step, index) => (
              <Reveal as="li" key={step.title} delay={index * 0.08} className={card}>
                <span aria-hidden className={`${badge} font-heading text-body font-semibold`}>
                  {index + 1}
                </span>
                <h3 className="font-heading text-title font-semibold text-text">{step.title}</h3>
                <p className="text-body text-text-muted">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="home-faq" aria-labelledby="home-faq-title" className="grid scroll-mt-24 gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <Reveal className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
          <h2 id="home-faq-title" className={sectionTitle}>
            {about.faqTitle}
          </h2>
          <p className="max-w-md text-caption text-text-muted">{about.disclaimer}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <FaqChat faqs={about.faqs} greeting={about.chatGreeting} status={about.chatStatus} typingLabel={about.typingLabel} />
        </Reveal>
      </section>
    </div>
  );
}
