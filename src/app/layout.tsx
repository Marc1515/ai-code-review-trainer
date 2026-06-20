import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";

import { routing } from "@/i18n/routing";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Code Review Trainer",
  description: "Practice real code review with AI-powered feedback.",
  icons: {
    icon: "/ai-code-review-trainer-icon.svg",
    apple: "/ai-code-review-trainer-icon.svg",
  },
};

// Applies dark class before first paint to avoid theme flash.
// Kept self-contained — no imports, no React state.
const THEME_INIT_SCRIPT = `(function(){try{var k='ai-code-review-trainer-theme',s=localStorage.getItem(k);if(!s||s==='dark'||(s==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const locale = headersList.get("X-NEXT-INTL-LOCALE") ?? routing.defaultLocale;

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
