import { PATH_PAGE, PATH_TOOLS } from "@/config/route";

export const LINKS = [
  {
    headline: "Company",
    children: [
      { name: "About us", href: "/about-us" },
      { name: "Contact us", href: "/contact-us" },
      { name: "Pricing", href: "/pricing" },
      { name: "Blogs", href: "/blogs" },
      { name: "Careers", href: "/career" },
    ],
  },
  {
    headline: "Products & Tools",
    children: [
      { name: "AI Chat", href: "/agents/chat" },
      { name: "Writing Studio", href: "/writing-studio" },
      { name: "Twin AI Cofounder", href: "/twin" },
      { name: "Slide Generation", href: "/slide-generation" },
      { name: "Paraphrasing", href: "/paraphrase" },
    ],
  },
  {
    headline: "Legal & Trust",
    children: [
      { name: "Terms of service", href: "/terms" },
      { name: "Privacy policy", href: "/privacy" },
      { name: "Deletion policy", href: "/deletion" },
      { name: "Refund policy", href: "/payment/refund-policy" },
    ],
  },
  {
    headline: "Support",
    children: [
      { name: "Help center", href: "mailto:support@shothik.ai" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "FAQs", href: "/faqs" },
      { name: "Community Forum", href: "/community" },
    ],
  },
];
