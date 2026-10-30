import { useId } from "react";

/** Static version of the mascot for message avatars. No animation, no GSAP. Its tones follow the theme tokens, like the animated one. */
export function MascotMark({ size = 32, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} aria-hidden="true" focusable="false" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`${id}-b`} cx="36%" cy="28%" r="78%">
          <stop offset="0" style={{ stopColor: "var(--mascot-s0, #ffffff)" }} />
          <stop offset="0.38" style={{ stopColor: "var(--mascot-s1, #f4f4f4)" }} />
          <stop offset="0.78" style={{ stopColor: "var(--mascot-s2, #d2d2d2)" }} />
          <stop offset="1" style={{ stopColor: "var(--mascot-s3, #a6a6a6)" }} />
        </radialGradient>
        <radialGradient id={`${id}-h`} cx="50%" cy="50%" r="50%">
          <stop offset="0.7" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-r`} cx="36%" cy="28%" r="100%">
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.76" stopColor="#ffffff" stopOpacity="1" />
        </radialGradient>
        <radialGradient id={`${id}-g`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="70" fill={`url(#${id}-h)`} style={{ opacity: "var(--mascot-halo, 0)" }} />
      <circle cx="60" cy="60" r="52" fill={`url(#${id}-b)`} />
      <circle cx="60" cy="60" r="52" fill={`url(#${id}-r)`} style={{ opacity: "var(--mascot-rim, 0)" }} />
      {/* The same top-left highlight as the animated mascot, so the small one has volume too. */}
      <ellipse cx="45" cy="33" rx="21" ry="12" transform="rotate(-28 45 33)" fill={`url(#${id}-g)`} style={{ opacity: "var(--mascot-mark-gloss, 0)" }} />
      <g transform="translate(47 56) rotate(-6)">
        <rect x="-5.5" y="-11" width="11" height="22" rx="5.5" fill="#0d0d0d" />
      </g>
      <g transform="translate(73 56) rotate(-6)">
        <rect x="-5.5" y="-11" width="11" height="22" rx="5.5" fill="#0d0d0d" />
      </g>
    </svg>
  );
}
