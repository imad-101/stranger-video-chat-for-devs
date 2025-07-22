import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "next-themes";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
