import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PromptLens — Reverse Engineer Any GitHub Repo",
  description:
    "Paste any public GitHub repository URL to instantly generate the precise AI prompt that could build it from scratch. Powered by Claude.",
  openGraph: {
    title: "PromptLens — Reverse Engineer Any GitHub Repo",
    description: "Generate the exact AI prompt behind any GitHub repository.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <AuthProvider>
          <Header />
          <main className="relative z-10 flex-1 flex flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
