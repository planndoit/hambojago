import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "함보자고 - 10초만에 약속 날짜 잡기",
  description: "되는 날만 눌러주세요. 가장 많이 겹치는 날짜를 바로 보여드려요."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
