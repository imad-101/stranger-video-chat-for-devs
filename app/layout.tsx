import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "DevChat - Meet Builders, Solve Problems, Have Fun",
  description:
    "Connect instantly with developers, hackers, and founders working on cool stuff.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased font-sans" suppressHydrationWarning>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
