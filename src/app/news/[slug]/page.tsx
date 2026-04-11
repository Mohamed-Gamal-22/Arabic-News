import type { Metadata } from "next";
import type { ApiArticle } from "@/lib/api";
import { getCachedArticleBySlug } from "@/lib/cachedArticle";
import NewsArticlePageClient from "./NewsArticlePageClient";

const SITE_NAME = "موقع الأخبار العربية";

function seoDescription(article: Pick<ApiArticle, "summary" | "title">): string {
  const s = article.summary?.trim();
  return s || article.title;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCachedArticleBySlug(slug);

  if (!article) {
    return {
      title: `مقال غير موجود | ${SITE_NAME}`,
      description: "لم يتم العثور على هذا المقال.",
      robots: { index: false, follow: true },
    };
  }

  const title = `${article.title} | ${SITE_NAME}`;
  const description = seoDescription(article);
  const pagePath = `/news/${article.slug}`;

  const ogImage =
    article.imageUrl ||
    `https://picsum.photos/1200/600?random=${article.id}`;

  return {
    title,
    description,
    alternates: { canonical: pagePath },
    openGraph: {
      title: article.title,
      description,
      url: pagePath,
      type: "article",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const initialArticle = await getCachedArticleBySlug(slug);

  return (
    <NewsArticlePageClient
      key={slug}
      slug={slug}
      initialArticle={initialArticle}
    />
  );
}
