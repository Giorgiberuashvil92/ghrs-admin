"use client";

import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";
import { LanguageProvider } from "@/i18n/language-context";
import Sidebar from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";

export function RootLayoutClient({ children }: PropsWithChildren) {
  return (
    <LanguageProvider>
      <Providers>
        <NextTopLoader color="#5750F1" showSpinner={false} />

        <div className="flex min-h-screen">
          <Sidebar />

          <div className="w-full bg-gray-2 dark:bg-[#020d1a]">
            <Header />

            <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
              {children}
            </main>
          </div>
        </div>
      </Providers>
    </LanguageProvider>
  );
} 