"use client";

import LanguageProvider from "@/app/register/providers/LanguageProvider";
import AlertProvider from "@/app/register/providers/AlertProvider";
import RegisterThemeProvider from "@/app/register/providers/RegisterThemeProvider";
import UploadProgressProvider from "@/app/register/providers/UploadProgressProvider";
import LoadingToastProvider from "@/app/register/providers/LoadingToastProvider";

/**
 * Composes all /register-scoped providers in the correct nesting order:
 * Language → Alert → Theme → Upload → LoadingToast.
 */
export default function RegisterProviders({ lng = "ar", children }) {
  return (
    <LanguageProvider initialLng={lng}>
      <AlertProvider>
        <RegisterThemeProvider lng={lng}>
          <UploadProgressProvider>
            <LoadingToastProvider>{children}</LoadingToastProvider>
          </UploadProgressProvider>
        </RegisterThemeProvider>
      </AlertProvider>
    </LanguageProvider>
  );
}
