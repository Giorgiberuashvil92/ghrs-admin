"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { LanguageProvider } from "@/i18n/language-context";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <LanguageProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
