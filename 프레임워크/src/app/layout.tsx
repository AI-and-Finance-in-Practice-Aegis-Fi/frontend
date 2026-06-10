import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Aegis-Fi CFO Console",
  description: "Autonomous CFO dashboard for SaaS spend and risk operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
