

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation, type Locale } from "@/i18n";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelector } from "react-redux";
import { useSyncLocaleToConvex } from "@/i18n/useSyncLocaleToConvex";

const localeOptions: { code: Locale; label: string; shortLabel: string }[] = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "bn", label: "বাংলা", shortLabel: "বাং" },
];

export default function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useTranslation();
  const user = useSelector((state: any) => state.auth?.user);
  const syncLocale = useSyncLocaleToConvex();

  const handleLocaleChange = (code: Locale) => {
    setLocale(code);
    if (user?._id) {
      syncLocale(user._id, code);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full border border-zinc-200 dark:border-white/[0.08] bg-zinc-100/80 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/[0.08] transition cursor-pointer",
            className
          )}
          aria-label="Switch language"
          data-testid="language-switcher"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {localeOptions.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => handleLocaleChange(option.code)}
            className={cn(
              "cursor-pointer gap-2",
              locale === option.code && "bg-accent font-semibold"
            )}
            data-testid={`lang-${option.code}`}
          >
            <span className="text-xs font-mono w-6">{option.shortLabel}</span>
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
