import { ImageResponse } from "next/og";
import { AppIcon } from "@/lib/app-icon";

// What iOS uses for "Add to Home Screen". Next links it as the apple-touch-icon.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<AppIcon size={size.width} />, size);
}
