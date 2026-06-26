import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { routing } from "@/i18n/routing";
import { AuthHeader } from "@/modules/auth/ui/header";
import { ReviewGenerationProvider } from "@/modules/reviews/ui/review-generation-provider";
import { NavigationLoadingOverlay } from "@/shared/ui/navigation-loading-overlay";
import { ThemeSync } from "@/shared/theme/theme-sync";
import { ToastProvider } from "@/shared/ui/toast-provider";
import { PendingToastBridge } from "@/shared/ui/pending-toast-bridge";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ToastProvider>
        <ReviewGenerationProvider>
          <PendingToastBridge />
          <Suspense fallback={null}>
            <NavigationLoadingOverlay />
          </Suspense>
          <ThemeSync />
          <AuthHeader />
          {children}
        </ReviewGenerationProvider>
      </ToastProvider>
    </NextIntlClientProvider>
  );
}
