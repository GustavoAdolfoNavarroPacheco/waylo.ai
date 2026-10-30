import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { generateStaticParams } from "@/app/pwa-icon/[size]/route";
import { PWA_ICON_SIZES } from "@/lib/pwa";

describe("the home screen shortcut", () => {
  it("opens the chat as an app, with the name Waylo", () => {
    const m = manifest();
    expect(m.name).toBe("Waylo");
    expect(m.short_name).toBe("Waylo");
    expect(m.display).toBe("standalone");
    expect(m.start_url).toBe("/chat");
  });

  it("offers every size, and one that phones may crop", () => {
    const icons = manifest().icons ?? [];
    for (const size of PWA_ICON_SIZES) {
      expect(icons.some((icon) => icon.src === `/pwa-icon/${size}` && icon.purpose === "any")).toBe(true);
    }
    expect(icons.some((icon) => icon.purpose === "maskable" && icon.sizes === "512x512")).toBe(true);
  });

  it("only points at icons that are built", () => {
    const built = generateStaticParams().map((p) => `/pwa-icon/${p.size}`);
    for (const icon of manifest().icons ?? []) expect(built).toContain(icon.src);
  });
});
