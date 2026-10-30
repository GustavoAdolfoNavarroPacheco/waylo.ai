/**
 * The icon people get when they put Waylo on their home screen: the mascot on the app's dark surface. Every size is
 * the same drawing, since it is one SVG that scales. The background is solid and runs to the edges, because phones
 * round the corners themselves (and some crop it into a circle), and the mascot stays inside the middle 60% so no
 * shape cuts it.
 */
export function AppIcon({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", width: size, height: size, background: "#0b0b0b" }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="sphere" cx="36%" cy="28%" r="78%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#f0f0f0" />
            <stop offset="0.8" stopColor="#cfcfcf" />
            <stop offset="1" stopColor="#8f8f8f" />
          </radialGradient>
          {/* Light pooling behind the sphere, so it reads against the dark. */}
          <radialGradient id="halo" cx="50%" cy="50%" r="50%">
            <stop offset="0.3" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ground" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#halo)" />
        <ellipse cx="50" cy="83" rx="22" ry="3" fill="url(#ground)" />
        <circle cx="50" cy="50" r="29" fill="url(#sphere)" />
        <g transform="translate(42.75 48.96) rotate(-6)">
          <rect x="-3.63" y="-7.25" width="7.25" height="14.5" rx="3.63" fill="#0d0d0d" />
        </g>
        <g transform="translate(57.25 48.96) rotate(-6)">
          <rect x="-3.63" y="-7.25" width="7.25" height="14.5" rx="3.63" fill="#0d0d0d" />
        </g>
      </svg>
    </div>
  );
}
