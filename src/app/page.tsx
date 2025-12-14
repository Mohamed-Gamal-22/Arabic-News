"use client";

import { useState, useEffect } from "react";
import ArticlesSlider from "@/components/ArticlesSlider";
import ArticleCard from "@/components/ArticleCard";
import { getArticles, ApiArticle } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

// Skeleton Loading للمقالات
function ArticlesSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
  // const [totalCount, setTotalCount] = useState(0); // unused

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("=== Fetching All Articles ===");

        // جلب الأخبار العاجلة
        const trendingResponse = await getArticles(1, 10, true);
        setTrendingArticles(trendingResponse.data || []);
        setTrendingLoading(false);

        // جلب جميع المقالات
        let allArticles: ApiArticle[] = [];
        let page = 1;
        const pageSize = 100;
        let hasMore = true;

        while (hasMore) {
          try {
            const articlesResponse = await getArticles(page, pageSize);
            if (articlesResponse.data && articlesResponse.data.length > 0) {
              allArticles = [...allArticles, ...articlesResponse.data];
              // إذا كان عدد المقالات أقل من pageSize، يعني انتهينا
              if (articlesResponse.data.length < pageSize) {
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

        setRegularArticles(allArticles);
        setTotalCount(allArticles.length);

        console.log("=== All Articles Fetched ===");
        console.log("Total Articles:", allArticles.length);
      } catch (error: unknown) {
        console.error("Error fetching articles:", error);
        setError("حدث خطأ في جلب البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTrendingLoading(true);
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
            مرحباً بكم في موقع الأخبار العربي
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

        {/* شبكة المقالات */}
        <div className="mb-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 arabic-heading">
              آخر الأخبار
            </h2>
          </div>
          {loading ? (
            <ArticlesSkeleton />
          ) : regularArticles.length > 0 ? (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {regularArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-400 arabic-text">
                لا توجد مقالات متاحة حالياً
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
