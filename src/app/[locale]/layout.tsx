import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";
import { AuthHeader } from "@/modules/auth/ui/header";
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
        <PendingToastBridge />
        <NavigationLoadingOverlay />
        <ThemeSync />
        <AuthHeader />
        {children}
      </ToastProvider>
    </NextIntlClientProvider>
  );
}
