import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp02Icon } from "@hugeicons/core-free-icons";
import { MascotMark } from "@/components/mascot";
import { Reveal } from "@/components/home/Reveal";
import type { Messages } from "@/i18n/messages";

const column = "mx-auto w-full max-w-7xl px-4 sm:px-8";
const linkClass =
  "inline-flex min-h-11 items-center text-body text-text-muted transition-[color,transform] duration-[var(--duration-base)] ease-standard hover:translate-x-0.5 hover:text-text focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring";

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title} className="flex flex-col">
      <h3 className="mb-2 font-heading text-caption font-semibold uppercase tracking-wider text-text">{title}</h3>
      <ul className="flex flex-col">
        {links.map((link) => (
          <li key={link.href}>
            {link.href.startsWith("#") ? (
              <a href={link.href} className={linkClass}>
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className={linkClass}>
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** The foot of the home page: who Waylo is, where to go next, the emergency reminder and the legal links. */
export function SiteFooter({ t }: { t: Messages }) {
  const about = t.home.about;
  const footer = t.footer;
  return (
    <footer className="relative overflow-hidden border-t border-border bg-surface-raised/40">
      <div className={`${column} grid gap-12 pb-10 pt-16 lg:grid-cols-[1.2fr_1.8fr] lg:gap-20`}>
        <Reveal className="flex flex-col items-start gap-6">
          <div className="flex items-center gap-3">
            <MascotMark size={48} />
            <span className="font-script text-4xl text-title-gradient">Waylo</span>
          </div>
          <p className="max-w-sm text-body text-text-muted">{footer.tagline}</p>
        </Reveal>

        <Reveal delay={0.1} className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <FooterColumn
            title={footer.productTitle}
            links={[
              { label: about.stepsTitle, href: "#home-steps" },
              { label: about.faqTitle, href: "#home-faq" },
            ]}
          />
          <FooterColumn
            title={footer.accountTitle}
            links={[
              { label: t.home.goToChat, href: "/chat" },
              { label: t.meta.titles.login, href: "/login" },
              { label: t.meta.titles.signup, href: "/registro" },
            ]}
          />
          <FooterColumn
            title={footer.legalTitle}
            links={[
              { label: t.meta.titles.privacy, href: "/privacidad" },
              { label: t.meta.titles.terms, href: "/terminos" },
            ]}
          />
        </Reveal>
      </div>

      <div className={`${column} flex flex-col gap-4 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between`}>
        <p className="text-caption text-text-muted">{footer.copyright(new Date().getFullYear())}</p>
        <a
          href="#home-top"
          className="lift lift-sm inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-surface-raised px-5 font-heading text-caption font-semibold text-text shadow-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          {footer.backToTop}
          <HugeiconsIcon icon={ArrowUp02Icon} size={16} strokeWidth={2.5} aria-hidden />
        </a>
      </div>

      {/* The name again, huge and faint, cut off by the edge of the page. */}
      <div className="pointer-events-none select-none">
        <p
          aria-hidden
          className="mx-auto -mb-[0.22em] mt-2 font-script text-[clamp(6rem,26vw,24rem)] leading-[0.9] text-title-gradient opacity-[0.14]"
        >
          Waylo
        </p>
      </div>
    </footer>
  );
}
