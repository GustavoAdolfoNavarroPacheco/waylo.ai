import { ImageResponse } from "next/og";
import { AppIcon } from "@/lib/app-icon";
import { PWA_ICON_SIZES } from "@/lib/pwa";

// The icons the manifest names, for Android and desktop installs. Only the listed sizes exist, drawn once at build time.
export const dynamicParams = false;

export function generateStaticParams() {
  return PWA_ICON_SIZES.map((size) => ({ size: String(size) }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const px = Number((await params).size);
  return new ImageResponse(<AppIcon size={px} />, { width: px, height: px });
}
