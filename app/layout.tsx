import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BaraAdmin | Portal",
  description: "Portal Administrasi Portofolio",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${workSans.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-slate-800 selection:bg-[#FFBD07] selection:text-[#013880]">
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}