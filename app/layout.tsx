import React from "react";
import "../artifacts/shothik/src/index.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://shothik-web-mirror-v2.vercel.app"),
  title: {
    default: "ShothikGPT — Autonomous AI Operating Platform",
    template: "%s | ShothikGPT",
  },
  description: "Next-generation AI Operating System featuring 68 Specialized Agents, 286 ECC Skills, Dual-Pane Writing Canvas, bKash/Nagad Commerce, and Turnitin-Equivalent Thesis Auditor.",
  keywords: [
    "ShothikGPT",
    "AI Operating System",
    "Bangla AI",
    "Autonomous Agents",
    "ECC Skills",
    "bKash PGW",
    "Thesis Plagiarism",
    "F-Commerce Automation",
  ],
  authors: [{ name: "Shothik Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shothik-web-mirror-v2.vercel.app",
    siteName: "ShothikGPT",
    title: "ShothikGPT — Autonomous AI Operating Platform",
    description: "68 Specialized Agents, 286 Skills, Deep-Tech Infrastructure & MFS Economy.",
    images: [
      {
        url: "/api/og?title=ShothikGPT+Autonomous+AI+Operating+Platform&category=AI+Operating+System",
        width: 1200,
        height: 630,
        alt: "ShothikGPT Platform Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShothikGPT — Autonomous AI Operating Platform",
    description: "68 Specialized Agents, 286 Skills, Deep-Tech Infrastructure & MFS Economy.",
    images: ["/api/og?title=ShothikGPT+Autonomous+AI+Operating+Platform&category=AI+Operating+System"],
    creator: "@shothikgpt",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
