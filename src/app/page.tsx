"use client";

import { useState, useEffect } from "react";
import ArticlesSlider from "@/components/ArticlesSlider";
import ArticleCard from "@/components/ArticleCard";
import { getArticles, ApiArticle } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { StaticAdPlaceholder } from "@/components/ads/StaticAdPlaceholder";

// Skeleton Loading للمقالات
function ArticlesSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {[...Array(12)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse"
          >
            {/* الصورة Skeleton */}
            <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700"></div>

            {/* المحتوى Skeleton */}
            <div className="p-6 space-y-4">
              {/* Badge Skeleton */}
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>

              {/* العنوان Skeleton */}
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>

              {/* الملخص Skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>

              {/* Footer Skeleton */}
              <div className="flex items-center justify-between pt-4">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton Loading للأخبار العاجلة
function TrendingSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-2xl px-2 sm:px-6 lg:px-10 py-4">
      <div className="relative w-full max-w-7xl lg:max-w-[90rem] xl:max-w-[95rem] mx-auto">
        {/* الصورة الرئيسية Skeleton */}
        <div className="relative w-full h-[200px] sm:h-[260px] md:h-[320px] lg:h-[380px] overflow-hidden rounded-3xl shadow-2xl mb-6 bg-gray-200 dark:bg-gray-700 animate-pulse">
          {/* المحتوى Skeleton */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="h-6 w-24 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
              </div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* الصور الصغيرة Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-5 px-1">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="relative h-32 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error Component
function HomeError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 space-y-6">
          <div className="text-6xl mb-4">📰</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white arabic-heading">
            حدث خطأ في تحميل الصفحة
          </h1>
          <p className="text-gray-600 dark:text-gray-400 arabic-text">
            عذراً، حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.
          </p>
          <Button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white arabic-text"
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    </div>
  );
}

// Scroll to Top Button Component
function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 left-8 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      aria-label="العودة لأعلى الصفحة"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

export default function Home() {
  const [trendingArticles, setTrendingArticles] = useState<ApiArticle[]>([]);
  const [regularArticles, setRegularArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12; // 12 مقالة في كل صفحة

  // جلب المقالات عند تغيير الصفحة
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("=== Fetching Articles ===");
        console.log("Page:", currentPage);
        console.log("PageSize constant:", pageSize);
        console.log("Requesting 12 articles per page");

        // جلب المقالات المنشورة فقط (isPending = false)
        // حل بديل: إذا كان الـ API يعيد أقل من 12، نجلب صفحات إضافية
        let allFetchedArticles: ApiArticle[] = [];
        let pageToFetch = currentPage;
        let totalArticlesCount = 0;
        let maxPagesToFetch = 5; // حد أقصى 5 صفحات (لحماية من loop لا نهائي)
        let pagesFetched = 0;

        // جلب المقالات حتى نحصل على 12 مقالة أو نفاد المقالات
        while (
          allFetchedArticles.length < pageSize &&
          pagesFetched < maxPagesToFetch
        ) {
          const articlesResponse = await getArticles(
            pageToFetch,
            pageSize, // طلب 12 مقالة من كل صفحة
            false, // isTrending
            undefined, // token
            false // isPending = false للمقالات المنشورة فقط
          );

          if (articlesResponse && articlesResponse.data) {
            const pageArticles = articlesResponse.data || [];
            allFetchedArticles = [...allFetchedArticles, ...pageArticles];

            // تحديث العدد الإجمالي من أول استجابة فقط
            if (pagesFetched === 0) {
              totalArticlesCount = articlesResponse.totalCount || 0;
            }

            pagesFetched++;

            // إذا لم نحصل على مقالات جديدة، نتوقف
            if (pageArticles.length === 0) {
              break;
            }

            // إذا حصلنا على 12 مقالة أو أكثر، نتوقف
            if (allFetchedArticles.length >= pageSize) {
              break;
            }

            // إذا كانت المقالات أقل من المطلوب، نجلب الصفحة التالية
            if (pageArticles.length < pageSize) {
              pageToFetch++;
            } else {
              // إذا حصلنا على العدد المطلوب من هذه الصفحة، نتوقف
              break;
            }
          } else {
            break;
          }
        }

        // تحديد عدد المقالات للعرض (12 أو أقل إذا لم تكن متوفرة)
        const articlesToShow = allFetchedArticles.slice(0, pageSize);
        setRegularArticles(articlesToShow);
        setTotalCount(totalArticlesCount);

        // حساب عدد الصفحات بناءً على العدد الإجمالي
        const calculatedTotalPages = Math.ceil(
          (totalArticlesCount || 0) / pageSize
        );
        setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);

        console.log("Articles fetched:", articlesToShow.length);
        console.log("Expected: 12 articles per page");
        console.log("Pages fetched:", pagesFetched);
        console.log("Total count:", totalArticlesCount);
        console.log("Total pages:", calculatedTotalPages);

        // تحذير إذا لم نحصل على 12 مقالة
        if (
          articlesToShow.length < pageSize &&
          totalArticlesCount > articlesToShow.length
        ) {
          console.warn(
            `⚠️ Only received ${articlesToShow.length} articles, expected ${pageSize}. Total available: ${totalArticlesCount}`
          );
        }
      } catch (error: unknown) {
        console.error("Error fetching articles:", error);
        setError("حدث خطأ في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage]);

  // جلب الأخبار العاجلة مرة واحدة فقط
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setTrendingLoading(true);
        const trendingResponse = await getArticles(
          1,
          10,
          true,
          undefined,
          false
        );
        setTrendingArticles(trendingResponse.data || []);
      } catch (error: unknown) {
        console.error("Error fetching trending articles:", error);
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handleRetry = () => {
    setError(null);
    setCurrentPage(1);
    setLoading(true);
    setTrendingLoading(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // التمرير لأعلى الصفحة عند تغيير الصفحة
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Error State
  if (error && !loading && regularArticles.length === 0) {
    return <HomeError onRetry={handleRetry} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <section className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center arabic-heading">
            مرحباً بكم في موقع فوكس نيوز بالعربي
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 text-center arabic-text">
            نقدم لكم آخر الأخبار والتطورات من الوطن العربي والعالم
          </p>
        </div>

        {/* سلايدر الأخبار العاجلة */}
        <div className="mb-12">
          <div className="mx-auto w-full max-w-[95rem] px-2 sm:px-6 lg:px-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 arabic-heading text-center">
              الأخبار العاجلة
            </h2>

            {trendingLoading ? (
              <TrendingSkeleton />
            ) : trendingArticles.length > 0 ? (
              <div className="rounded-3xl overflow-hidden bg-white dark:bg-gray-800 shadow-2xl px-2 sm:px-6 lg:px-10 py-4">
                <ArticlesSlider articles={trendingArticles} />
              </div>
            ) : (
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-12 text-center">
                <p className="text-xl text-gray-600 dark:text-gray-400 arabic-text">
                  لا توجد أخبار عاجلة متاحة
                </p>
              </div>
            )}
          </div>
        </div>

        {/* بانر + عمودين جانبيين؛ إعلانان إضافيان صفّاً أسفل القسم */}
        <div className="mb-12">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white arabic-heading">
              آخر الأخبار
            </h2>

            <div className="mb-6 w-full min-w-0">
              <StaticAdPlaceholder
                variant="homeBanner"
                className="w-full"
              />
            </div>

            <div
              className="flex flex-col gap-8 lg:flex-row lg:items-start"
              dir="ltr"
            >
              <aside className="order-2 flex w-full shrink-0 flex-col gap-4 lg:order-1 lg:max-w-[300px] lg:sticky lg:top-4 lg:self-start">
                <StaticAdPlaceholder variant="homeStack1" className="w-full" />
                <StaticAdPlaceholder variant="homeStack2" className="w-full" />
              </aside>

              <div className="order-1 min-w-0 flex-1 space-y-8 lg:order-2">
                {loading ? (
                  <ArticlesSkeleton />
                ) : regularArticles.length > 0 ? (
                  <>
                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                      {regularArticles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="mx-auto mt-8 max-w-6xl">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                          className="justify-center"
                        />
                        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 arabic-text">
                          صفحة {currentPage} من {totalPages}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-xl text-gray-600 dark:text-gray-400 arabic-text">
                      لا توجد مقالات متاحة حالياً
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div
              className="mt-10 grid w-full grid-cols-2 gap-3 sm:gap-4"
              dir="ltr"
            >
              <div className="min-w-0">
                <StaticAdPlaceholder
                  variant="homeStack3"
                  className="w-full [&_img]:h-auto [&_img]:max-h-[200px] [&_img]:w-full [&_img]:object-contain"
                />
              </div>
              <div className="min-w-0">
                <StaticAdPlaceholder
                  variant="homeStack4"
                  className="w-full [&_img]:h-auto [&_img]:max-h-[200px] [&_img]:w-full [&_img]:object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
