import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_VOICE,
  VOICE_IDS,
  VOICE_COOKIE,
  isLanguageChoice,
  isVoice,
  languageOf,
  readPreferences,
  voiceIdFor,
} from "@/lib/preferences";
import { LANGUAGE_CHOICES, matchLocale } from "@/i18n/locales";

describe("preferencias de idioma y voz", () => {
  it("accepts only supported language and voice choices", () => {
    expect(LANGUAGE_CHOICES).toEqual(["auto", "en", "es", "pt"]);
    expect(isLanguageChoice("es")).toBe(true);
    expect(isLanguageChoice("es-MX")).toBe(false);
    expect(isLanguageChoice(undefined)).toBe(false);
    expect(isVoice("femenino")).toBe(true);
    expect(isVoice("robot")).toBe(false);
  });

  it("falls back to the default voice when a cookie was edited or is absent", () => {
    const get = vi.fn((name: string) => (name === VOICE_COOKIE ? "edited" : undefined));
    expect(readPreferences(get, "pt")).toEqual({ idioma: "pt", voz: DEFAULT_VOICE });
    expect(get).toHaveBeenCalledWith(VOICE_COOKIE);
  });

  it("maps browser language tags and configured voices to stable app values", () => {
    expect(languageOf(" es-MX ")).toBe("es");
    expect(languageOf("pt_BR")).toBe("pt");
    expect(languageOf("fr-FR")).toBeNull();
    expect(languageOf(42)).toBeNull();
    expect(voiceIdFor("masculino")).toBe(VOICE_IDS.masculino);
    vi.stubEnv("RETO_VOICE", "custom-ara");
    expect(voiceIdFor("femenino")).toBe("custom-ara");
    vi.unstubAllEnvs();
  });

  it("chooses the highest-priority supported locale from Accept-Language", () => {
    expect(matchLocale("fr-CA;q=0.9, pt-BR;q=0.8, es;q=0.7")).toBe("pt");
    expect(matchLocale("de, *;q=0.5")).toBe("es");
    expect(matchLocale(null)).toBe("es");
  });
});
