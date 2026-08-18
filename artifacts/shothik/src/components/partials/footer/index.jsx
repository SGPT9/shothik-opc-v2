import { LINKS } from "@/_mock/footer";
import { _socials } from "@/_mock/socials";
import Logo from "@/components/partials/logo";
import { Link } from "wouter";
import { Fragment } from "react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const simpleFooter = (
    <footer className="bg-background border-t border-border flex flex-col items-center justify-around gap-4 px-4 py-6 md:flex-row lg:px-6">
      <div className="bg-background flex justify-center md:block">
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-start md:gap-5">
          <Logo />
          <div className="flex flex-col gap-1.5">
            <span className="text-zinc-900 dark:text-zinc-100 text-sm font-semibold">
              © {currentYear} Shothik AI. All rights reserved.
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link
                href="/terms"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-xs font-medium transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-xs font-medium transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/deletion"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-xs font-medium transition-colors"
              >
                Deletion Policy
              </Link>
              <Link
                href="/copyright"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-xs font-medium transition-colors"
              >
                Community Guidelines
              </Link>
              <Link
                href="/magna-carta"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-xs font-medium transition-colors"
              >
                Magna Carta
              </Link>
            </div>
            <span className="text-zinc-500 dark:text-zinc-400 text-xs">
              This site is protected by reCAPTCHA and the Google Privacy Policy
              and Terms of Service apply.
            </span>
          </div>
        </div>
      </div>
      <div className="text-zinc-600 dark:text-zinc-400 flex items-center justify-center text-center text-xs font-medium">
        Developed by 
        <Link
          href="/?utm_source=internal"
          className="text-zinc-900 dark:text-zinc-100 font-semibold underline-offset-4 hover:underline"
        >
          Shothik AI
        </Link>
      </div>
    </footer>
  );

  const mainFooter = (
    <footer className="bg-background relative border-t border-border">
      <div className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 md:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {LINKS.map((list) => (
            <div
              key={list.headline}
              className="my-2 flex w-full flex-col gap-2"
            >
              <span className="text-zinc-950 dark:text-zinc-100 my-1 text-xs font-bold tracking-wider uppercase">
                {list.headline}
              </span>
              {list.children.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white text-[13px] font-medium transition-colors"
                  data-rybbit-event="Footer Nav"
                  data-rybbit-prop-foot_event={link.name}
                >
                  {link.name.split("\n").map((line, index) => (
                    <Fragment key={index}>
                      {line}
                      {index !== link.name.split("\n").length - 1 && <br />}
                    </Fragment>
                  ))}
                </Link>
              ))}
            </div>
          ))}

          <div className="col-span-2 mt-4 sm:col-span-2 md:col-span-4 border-t border-border/60 pt-6">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div className="text-zinc-950 dark:text-zinc-100 text-center text-xs font-bold tracking-wider uppercase md:text-left">
                Get to Know Us
              </div>
              <div className="mb-2 flex justify-center md:mb-0 md:justify-start gap-2">
                {_socials.map((Social) => (
                  <Link
                    key={Social.name}
                    href={Social.path}
                    target="_blank"
                    className="border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 inline-flex h-9 w-9 items-center justify-center rounded-lg shadow-2xs transition-colors"
                  >
                    {/* Prefer Lucide; if icon is not Lucide, fall back to text */}
                    {Social.icon ? (
                      <Social.icon className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-semibold">{Social.name}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <>
      {mainFooter}
      {simpleFooter}
    </>
  );
}
