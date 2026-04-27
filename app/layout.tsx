import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Bara Ardiwinata's WebPage", // 👈 Ini bakal muncul di tab browser utama
  description: "Mahasiswa Sistem Informasi ITS, Event Organizer, and Tech Enthusiast.",
  manifest: "/manifest.json", // 🔥 TAMBAHIN INI
  themeColor: "#013880", // 🔥 TAMBAHIN INI
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // 1. ClerkProvider cukup ditaruh SATU KALI aja di paling luar
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={`${workSans.variable} font-sans h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-[#FAFAFA] text-slate-800 selection:bg-[#FFBD07] selection:text-[#013880]">
          
          <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange>
            {/* 2. {children} (Isi web lu) cukup dipanggil SATU KALI aja di dalem ThemeProvider */}
            {children}
          </ThemeProvider>

          {/* 3. CCTV dan Analytics ditaruh sejajar sebelum body ditutup */}
          <AnalyticsTracker />
          <Analytics /> 
        </body>
      </html>
    </ClerkProvider>
  );
}