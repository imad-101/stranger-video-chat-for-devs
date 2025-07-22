import type { Metadata } from "next";

import "./globals.css";

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
    <html lang="en" className="dark">
      <body className={` antialiased bg-[#0f0f11] text-[#F1F5F9] font-sans`}>
        {children}
      </body>
    </html>
  );
}
