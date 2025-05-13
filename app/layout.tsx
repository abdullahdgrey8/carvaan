import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar";
import { ComparisonProvider } from "@/components/comparison-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Car Ad Application",
  description: "Find your perfect car or sell your vehicle",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ComparisonProvider>
            <Navbar />
            <main>{children}</main>
            <Toaster />
          </ComparisonProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
