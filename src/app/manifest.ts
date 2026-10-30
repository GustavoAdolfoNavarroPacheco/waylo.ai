import type { MetadataRoute } from "next";
import { PWA_DARK, PWA_ICON_SIZES } from "@/lib/pwa";

// A manifest is one file for everyone, so it cannot follow the visitor's language: it uses the default one.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Waylo",
    short_name: "Waylo",
    description: "Orientación clara para saber a qué nivel de atención acudir.",
    lang: "es",
    // The shortcut opens the chat, which anyone can use, rather than the landing page.
    start_url: "/chat",
    scope: "/",
    display: "standalone",
    background_color: PWA_DARK,
    theme_color: PWA_DARK,
    icons: [
      ...PWA_ICON_SIZES.map((size) => ({
        src: `/pwa-icon/${size}`,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "any" as const,
      })),
      // The mascot sits inside the safe zone, so the largest one also serves phones that crop icons into a shape.
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
