import type { Metadata, Viewport } from "next";

import "@/app/globals.css";
import { buildRootMetadata } from "@/config/site-share";

export const metadata: Metadata = buildRootMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="font-sans antialiased" lang="ko">
      <body>{children}</body>
    </html>
  );
}
