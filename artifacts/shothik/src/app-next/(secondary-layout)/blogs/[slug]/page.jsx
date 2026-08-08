import ArticleDetailClient from "@/components/(secondary-layout)/(blogs-page)/ArticleDetailClient";

export default function ArticleDetail({ params }) {
  // wouter passes params as a plain object (not a Promise like Next 15)
  const slug = params?.slug;


  // Return client component with the resolved slug
  return <ArticleDetailClient slug={slug} />;
}
