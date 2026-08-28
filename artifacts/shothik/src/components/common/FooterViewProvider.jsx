import { usePathname } from "@/lib/navigation";

// Full-screen workspace & studio routes where a bottom marketing footer breaks 100vh layout
const WORKSPACE_ROUTES = [
  "/agents",
  "/twin",
  "/writing-studio",
  "/slide-generation",
  "/slide",
  "/deep-research",
  "/paraphrase",
  "/ai-detector",
  "/humanize-gpt",
  "/plagiarism-checker",
  "/grammar-checker",
  "/summarize",
  "/translator",
  "/files",
  "/connectors",
  "/connector",
  "/saved-reports",
  "/settings",
  "/account",
];

export default function FooterViewProvider({ children }) {
  const pathname = usePathname();

  const isWorkspaceRoute = WORKSPACE_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`) || pathname.startsWith(`${route}?`)
  );

  if (isWorkspaceRoute) {
    return null;
  }

  return <>{children}</>;
}
