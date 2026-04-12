"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticleBySlug, ApiArticle, getArticles } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { convertVideoLinksToEmbeds } from "@/lib/utils";
import { StaticAdPlaceholder } from "@/components/ads/StaticAdPlaceholder";

function ArticleSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="animate-pulse">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>

        <article className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            <div className="lg:w-1/2 lg:order-1 space-y-6">
              <div className="flex flex-wrap gap-3">
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>

              <div className="space-y-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>

            <div className="lg:w-1/2 lg:order-2">
              <div className="relative w-full h-80 sm:h-96 bg-gray-200 dark:bg-gray-700 rounded-3xl"></div>
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
          </div>
        </article>
      </div>
    </div>
  );
}

function ArticleError({ onRetry }: { onRetry: () => void }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 space-y-6">
          <div className="text-6xl mb-4">📰</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white arabic-heading">
            لا يوجد هذا المقال
          </h1>
          <p className="text-gray-600 dark:text-gray-400 arabic-text">
            عذراً، المقال الذي تبحث عنه غير موجود أو تم حذفه.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white arabic-text"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للصفحة الرئيسية
            </Button>
            <Button onClick={onRetry} variant="outline" className="arabic-text">
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsArticlePageClient({
  slug,
  initialArticle,
}: {
  slug: string;
  initialArticle: ApiArticle | null;
}) {
  const router = useRouter();
  const [article, setArticle] = useState<ApiArticle | null>(initialArticle);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    initialArticle ? null : "لم يتم العثور على المقال"
  );
  const [relatedArticles, setRelatedArticles] = useState<ApiArticle[]>([]);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      if (!article) return;

      try {
        let allArticles: ApiArticle[] = [];
        let page = 1;
        const pageSize = 100;
        let hasMore = true;

        while (hasMore) {
          try {
            const response = await getArticles(page, pageSize);
            if (response.data && response.data.length > 0) {
              allArticles = [...allArticles, ...response.data];
              if (response.data.length < pageSize) {
                hasMore = false;
              } else {
                page++;
              }
            } else {
              hasMore = false;
            }
          } catch (err: unknown) {
            console.error("Error fetching articles page:", err);
            hasMore = false;
          }
        }

        const sameCategory = allArticles.filter(
          (item) =>
            item.slug !== article.slug &&
            item.categoryName === article.categoryName
        );

        setRelatedArticles(sameCategory);
      } catch (err: unknown) {
        console.error("Error fetching related articles:", err);
      }
    };

    fetchRelatedArticles();
  }, [article]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const fetchData = async () => {
      try {
        const articleData = await getArticleBySlug(slug);
        if (articleData) {
          setArticle(articleData);
          setError(null);
        } else {
          setError("لم يتم العثور على المقال");
        }
      } catch (err: unknown) {
        console.error("Error fetching data:", err);
        setError("حدث خطأ في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  };

  if (loading && !article) {
    return <ArticleSkeleton />;
  }

  if (error || !article) {
    return <ArticleError onRetry={handleRetry} />;
  }

  const imageUrl =
    article.imageUrl || `https://picsum.photos/1200/600?random=${article.id}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div>
          <Button
            onClick={() => router.push("/")}
            className="arabic-text bg-green-600 hover:bg-green-700 text-white border-0"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للصفحة الرئيسية
          </Button>
        </div>

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
              {/* الملخص يُستخدم في الـ meta فقط (SEO) ولا يُعرض هنا حتى لا يتكرر مع المحتوى */}
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
            <StaticAdPlaceholder
              variant="banner"
              className="mx-auto max-w-full lg:max-w-4xl"
            />

            <div
              className="flex flex-col gap-8 lg:flex-row lg:items-start"
              dir="ltr"
            >
              <div className="order-1 min-w-0 flex-1 space-y-8 lg:order-2">
                <div
                  className="article-content arabic-text text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{
                    __html: convertVideoLinksToEmbeds(article.content),
                  }}
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
              <aside className="order-2 flex w-full shrink-0 flex-col gap-6 lg:order-1 lg:max-w-[300px] lg:sticky lg:top-4 lg:self-start">
                <StaticAdPlaceholder variant="medium" className="mx-auto w-full max-w-[300px]" />
                <StaticAdPlaceholder
                  variant="medium"
                  className="mx-auto hidden w-full max-w-[300px] sm:block"
                />
              </aside>
            </div>
          </div>
        </article>

        {relatedArticles.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-300 font-semibold">
                  من نفس القسم
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
