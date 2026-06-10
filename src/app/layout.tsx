import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Synapse App",
  description: "Next-generation professional communication platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans h-full w-full flex flex-col overflow-hidden`}>
        <ThemeProvider attribute="data-theme" defaultTheme="synapse-dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
