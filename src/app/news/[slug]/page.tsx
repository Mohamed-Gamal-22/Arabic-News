"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug, ApiArticle, getArticles } from "@/lib/api";

interface NewsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = use(params);
  const [article, setArticle] = useState<ApiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ApiArticle[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const articleData = await getArticleBySlug(slug);

        if (articleData) {
          setArticle(articleData);
        } else {
          setError("لم يتم العثور على المقال");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("حدث خطأ في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      if (!article) return;

      try {
        const response = await getArticles(1, 12);
        const sameCategory = response.data
          .filter(
            (item) =>
              item.slug !== article.slug &&
              item.categoryName === article.categoryName
          )
          .slice(0, 4);

        setRelatedArticles(sameCategory);
      } catch (err) {
        console.error("Error fetching related articles:", err);
      }
    };

    fetchRelatedArticles();
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400 arabic-text">
              جاري التحميل...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    notFound();
  }

  const imageUrl =
    article.imageUrl || `https://picsum.photos/1200/600?random=${article.id}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <article className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            <div className="lg:w-1/2 lg:order-1 space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-1 rounded-full font-semibold">
                  {article.categoryName}
                </span>
                <span className="flex items-center gap-2">
                  <span>👤</span>
                  <span className="arabic-text">{article.authorName}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span>📅</span>
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString("ar-EG")}
                  </span>
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-snug arabic-heading">
                {article.title}
              </h1>

              {article.summary && (
                <p className="text-lg text-gray-700 dark:text-gray-300 arabic-text bg-gray-50 dark:bg-gray-700/50 p-5 rounded-2xl">
                  {article.summary}
                </p>
              )}
            </div>

            <div className="lg:w-1/2 lg:order-2">
              <div className="relative w-full h-80 sm:h-96">
                <Image
                  src={imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover rounded-3xl shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-8">
            <div
              className="prose prose-lg max-w-none arabic-text text-gray-800 dark:text-gray-200"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {article.keywords && (
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 arabic-heading">
                  الكلمات المفتاحية:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.split(",").map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm arabic-text"
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {relatedArticles.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold">
                  من نفس التصنيف
                </p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white arabic-heading">
                  مقالات قد تعجبك
                </h2>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/news/${related.slug}`}
                  className="group rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="relative h-44">
                    <Image
                      src={
                        related.imageUrl ||
                        `https://picsum.photos/600/400?random=${related.id}`
                      }
                      alt={related.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <span className="inline-flex text-xs font-semibold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full">
                      {related.categoryName}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 arabic-text group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(related.publishedAt).toLocaleDateString(
                        "ar-EG"
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
