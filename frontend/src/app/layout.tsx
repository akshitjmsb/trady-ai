import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Trady AI",
  description: "AI-powered portfolio assistant",
};

export default function RootLayout({ 
  children,
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased dark",
          fontSans.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
