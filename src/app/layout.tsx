import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navigation from "@/components/layout/Navigation";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Family Together",
  description: "우리 가족만의 특별한 공간",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
