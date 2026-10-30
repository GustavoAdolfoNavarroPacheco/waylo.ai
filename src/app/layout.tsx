import type { Metadata, Viewport } from "next";
import { Inter, Manrope, Pacifico, Poppins } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SmoothCursor } from "@/components/cursor/SmoothCursor";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getLanguageChoice, getLocale, getMessages } from "@/i18n/server";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { THEME_INIT_SCRIPT } from "@/components/theme/theme-script";
import { PWA_DARK, PWA_LIGHT } from "@/lib/pwa";
import { OG_LOCALES, SITE_URL } from "@/lib/site";
import "./globals.css";

// Manrope: body and chat text. Poppins: labels, buttons and headings. Pacifico: page titles.
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});
// Inter, at extra bold only: it is the fallback of the section titles where the system face is not San Francisco.
const inter = Inter({ weight: "800", subsets: ["latin"], variable: "--font-inter", display: "swap" });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"], variable: "--font-pacifico", display: "swap" });

// The browser bar of a phone takes the color of the page's surface, in each scheme.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: PWA_LIGHT },
    { media: "(prefers-color-scheme: dark)", color: PWA_DARK },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getMessages();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.siteTitle, template: "%s | Waylo.ai" },
    description: t.meta.siteDescription,
    applicationName: "Waylo",
    // Opened from the iOS home screen it runs as an app, under the name "Waylo".
    appleWebApp: { capable: true, title: "Waylo", statusBarStyle: "default" },
    // "./" is each page's own address, so every page names itself as the canonical one.
    alternates: { canonical: "./" },
    openGraph: {
      type: "website",
      siteName: "Waylo",
      title: t.meta.siteTitle,
      description: t.meta.siteDescription,
      url: "./",
      locale: OG_LOCALES[locale],
    },
    twitter: { card: "summary_large_image", title: t.meta.siteTitle, description: t.meta.siteDescription },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [locale, choice] = await Promise.all([getLocale(), getLanguageChoice()]);
  return (
    <html lang={locale} suppressHydrationWarning className="scroll-soft">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${manrope.variable} ${poppins.variable} ${pacifico.variable} ${inter.variable} antialiased`}>
        <I18nProvider locale={locale} choice={choice}>
          <ThemeProvider>
            <SmoothScroll />
            <SmoothCursor />
            {children}
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
