"use client";

import { useState, useEffect } from "react";
import ArticlesSlider from "@/components/ArticlesSlider";
import ArticleCard from "@/components/ArticleCard";
import { getArticles, ArticlesResponse } from "@/lib/api";
import { Pagination } from "@/components/ui/pagination";
import { getArticlesServer } from "@/lib/articles";

export default function Home() {
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [regularArticles, setRegularArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);

        // جلب المقالات التريندينج
        const trendingResponse = await getArticlesServer(1, 10, true);
        setTrendingArticles(trendingResponse.data || []);

        // جلب المقالات العادية
        const regularResponse = await getArticles(
          page,
          12,
          undefined,
          undefined
        );

        const apiTotalCount = regularResponse.totalCount || 0;
        setRegularArticles(regularResponse.data || []);
        setTotalCount(apiTotalCount);

        console.log("=== Home Articles API Response ===");
        console.log("Page:", page);
        console.log("Total Count:", apiTotalCount);
        console.log(
          "Articles in this page:",
          regularResponse.data?.length || 0
        );
        console.log("Total Pages:", Math.ceil(apiTotalCount / 12));
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 arabic-heading">
            الأخبار العاجلة
          </h2>
          <ArticlesSlider articles={trendingArticles} />
        </div>

        {/* شبكة المقالات */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 arabic-heading">
            آخر الأخبار
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 dark:text-gray-400 arabic-text">
                جاري التحميل...
              </p>
            </div>
          ) : regularArticles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                {regularArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* Pagination */}
              {totalCount > 12 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(totalCount / 12)}
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
