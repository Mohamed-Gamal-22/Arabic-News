"use client";

import { useState, useEffect } from "react";
import ArticlesSlider from "@/components/ArticlesSlider";
import ArticleCard from "@/components/ArticleCard";
import { getArticles, ApiArticle } from "@/lib/api";
import { Pagination } from "@/components/ui/pagination";

export default function Home() {
  const PAGE_SIZE = 12;
  const [trendingArticles, setTrendingArticles] = useState<ApiArticle[]>([]);
  const [regularArticles, setRegularArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [effectivePageSize, setEffectivePageSize] = useState(PAGE_SIZE);
  const [serverPageIndex, setServerPageIndex] = useState(1);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);

        console.log("=== Fetching Articles ===");
        console.log("Requested client page:", page);
        console.log("Client page size:", PAGE_SIZE);

        const [trendingResponse, initialResponse] = await Promise.all([
          getArticles(1, 10, true),
          getArticles(page, PAGE_SIZE),
        ]);

        setTrendingArticles(trendingResponse.data || []);

        const totalItems = initialResponse.totalCount || 0;
        const apiPageSize =
          initialResponse.pageSize ||
          initialResponse.data?.length ||
          PAGE_SIZE;

        const totalClientPages = Math.max(
          1,
          Math.ceil(totalItems / PAGE_SIZE)
        );
        const clampedPage = Math.min(Math.max(page, 1), totalClientPages);
        const startIndex = (clampedPage - 1) * PAGE_SIZE;
        const remainingItems = Math.max(totalItems - startIndex, 0);
        const desiredCount = Math.min(PAGE_SIZE, remainingItems);

        console.log("=== API Response ===");
        console.log("API page size:", apiPageSize);
        console.log("Total items:", totalItems);
        console.log("Client total pages:", totalClientPages);
        console.log("Desired items this client page:", desiredCount);

        if (desiredCount <= 0) {
          setRegularArticles([]);
          setTotalCount(totalItems);
          setEffectivePageSize(PAGE_SIZE);
          setServerPageIndex(clampedPage);
          return;
        }

        let neededServerPage =
          Math.floor(startIndex / apiPageSize) + 1 || clampedPage;

        let currentResponse =
          (initialResponse.pageIndex || page) === neededServerPage
            ? initialResponse
            : await getArticles(neededServerPage, PAGE_SIZE);

        let currentData = currentResponse.data || [];
        let offset = startIndex - (neededServerPage - 1) * apiPageSize;
        offset = Math.max(offset, 0);

        const collected: ApiArticle[] = [];

        while (
          collected.length < desiredCount &&
          currentData &&
          currentData.length > 0
        ) {
          if (offset < currentData.length) {
            const slice = currentData.slice(offset);
            collected.push(...slice);
            offset = 0;
          } else {
            offset -= currentData.length;
          }

          if (collected.length >= desiredCount) {
            break;
          }

          neededServerPage += 1;
          currentResponse = await getArticles(neededServerPage, PAGE_SIZE);
          currentData = currentResponse.data || [];
        }

        setRegularArticles(collected.slice(0, desiredCount));
        setTotalCount(totalItems);
        setEffectivePageSize(PAGE_SIZE);
        setServerPageIndex(clampedPage);

        console.log("=== Home Articles API Response ===");
        console.log("Request Page:", page);
        console.log("Request Page Size:", PAGE_SIZE);
        console.log("Response PageIndex:", initialResponse.pageIndex);
        console.log("Response Page Size:", initialResponse.pageSize);
        console.log("Total Count:", totalItems);
        console.log(
          "Articles in this page:",
          collected.length
        );
        console.log(
          "Total Pages:",
          totalClientPages
        );
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const hasPagination = totalCount > PAGE_SIZE;

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

            {trendingArticles.length > 0 ? (
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
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-400 arabic-text">
                جاري التحميل...
              </p>
            </div>
          ) : regularArticles.length > 0 ? (
            <>
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {regularArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {hasPagination && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={serverPageIndex}
                    totalPages={Math.max(1, totalPages)}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-400 arabic-text">
                لا توجد مقالات متاحة حالياً
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
