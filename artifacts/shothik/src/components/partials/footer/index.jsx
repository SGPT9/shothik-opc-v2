import { LINKS } from "@/_mock/footer";
import { _socials } from "@/_mock/socials";
import Logo from "@/components/partials/logo";
import { Link } from "wouter";
import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/70 bg-card/60 backdrop-blur-md text-foreground transition-colors">
      {/* Upper Footer Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-6 lg:gap-8">
          {/* Brand & Mission Column */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="flex items-center">
              <Logo />
            </div>
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              Frontier multi-agent AI operating platform engineered for Bangladesh & Emerging Markets by <a href="https://shothikgpt.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground underline-offset-4 hover:underline">shothikgpt.com</a>. Bridging autonomous LLM reasoning, merchant twins, and creative studios.
            </p>

            {/* System Status Pill */}
            <div className="mt-1 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                All 5 Mesh Clusters Operational
              </span>
            </div>

            {/* Social Links */}
            <div className="mt-2 flex items-center gap-2">
              {_socials.map((Social) => {
                const isExternal = Social.path.startsWith("http");
                return isExternal ? (
                  <a
                    key={Social.name}
                    href={Social.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={Social.name}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-xs"
                  >
                    {Social.icon ? (
                      <Social.icon className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-semibold">{Social.name[0]}</span>
                    )}
                  </a>
                ) : (
                  <Link
                    key={Social.name}
                    href={Social.path}
                    aria-label={Social.name}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-xs"
                  >
                    {Social.icon ? (
                      <Social.icon className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-semibold">{Social.name[0]}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-4">
            {LINKS.map((section) => (
              <div key={section.headline} className="flex flex-col gap-3">
                <h4 className="text-xs font-bold tracking-wider uppercase text-foreground/90">
                  {section.headline}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {section.children.map((link) => {
                    const isExternal =
                      link.isExternal ||
                      link.href.startsWith("http") ||
                      link.href.startsWith("mailto:");

                    return (
                      <li key={link.name}>
                        {isExternal ? (
                          <a
                            href={link.href}
                            target={link.href.startsWith("http") ? "_blank" : undefined}
                            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-primary"
                          >
                            {link.name}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-primary"
                          >
                            {link.name}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50 bg-background/50 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
            <p className="text-xs text-muted-foreground">
              © {currentYear} <a href="https://shothikgpt.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground hover:underline">ShothikGPT (shothikgpt.com)</a>. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground/90 sm:justify-start">
              <Link href="/terms" className="hover:text-foreground hover:underline">Terms of Service</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-foreground hover:underline">Privacy Policy</Link>
              <span>•</span>
              <Link href="/deletion" className="hover:text-foreground hover:underline">Deletion Policy</Link>
              <span>•</span>
              <Link href="/copyright" className="hover:text-foreground hover:underline">Community Guidelines</Link>
              <span>•</span>
              <Link href="/magna-carta" className="hover:text-foreground hover:underline">Magna Carta</Link>
            </div>
            <p className="text-[10px] text-muted-foreground/70">
              Enterprise Grade • Postgres RLS Security • HSTS Protected
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Developed & maintained by</span>
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
            <a
              href="https://shothikgpt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              shothikgpt.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
