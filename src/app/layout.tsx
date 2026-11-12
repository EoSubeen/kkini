import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "끼니 | 세대 사이 끼인 당신을 위한 맞춤형 재무설계",
  description:
    "부모님과 자녀 사이, 샌드위치 세대의 재무 흐름을 진단하고 실행 레시피를 만드는 서비스",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
