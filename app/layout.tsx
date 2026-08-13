import React from "react";
import "../artifacts/shothik/src/index.css";

export const metadata = {
  title: "Shothik Operating Platform & Hermes Gateway",
  description: "Phase 1 Hermes API Gateway & AI Cofounder Workspace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
