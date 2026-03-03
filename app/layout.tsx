import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GC Health Weekly",
  description:
    "생애주기별 건강 인사이트 — 매주 당신의 건강을 한눈에 파악하세요.",
  keywords: ["건강", "헬스", "직장인", "건강관리", "GC", "헬스케어"],
  openGraph: {
    title: "GC Health Weekly",
    description: "생애주기별 건강 인사이트 — 매주 당신의 건강을 한눈에",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
