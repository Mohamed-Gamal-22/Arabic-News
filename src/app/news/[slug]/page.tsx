"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getArticleBySlug, ApiArticle, getCategories, Category } from "@/lib/api";

interface NewsDetailPageProps {
  params: {
    slug: string;
  };
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = params;
  const [article, setArticle] = useState<ApiArticle | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [articleData, categoriesData] = await Promise.all([
          getArticleBySlug(slug),
          getCategories(),
        ]);

        if (articleData) {
          setArticle(articleData);
        } else {
          setError("لم يتم العثور على المقال");
        }

        if (categoriesData) {
          setCategories(categoriesData);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header categories={categories} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400 arabic-text">
              جاري التحميل...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    notFound();
  }

  const imageUrl =
    article.imageUrl ||
    `https://picsum.photos/1200/600?random=${article.id}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header categories={categories} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* الصورة الرئيسية */}
          <div className="relative h-96 w-full">
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-6 right-6">
              <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                {article.categoryName}
              </span>
            </div>
          </div>

          {/* المحتوى */}
          <div className="p-8">
            {/* العنوان */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 arabic-heading">
              {article.title}
            </h1>

            {/* معلومات المقالة */}
            <div className="flex items-center justify-between mb-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span>👤</span>
                  <span className="arabic-text">{article.authorName}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span>📅</span>
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString("ar-EG")}
                  </span>
                </div>
              </div>
            </div>

            {/* الملخص */}
            {article.summary && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <p className="text-lg text-gray-700 dark:text-gray-300 arabic-text">
                  {article.summary}
                </p>
              </div>
            )}

            {/* المحتوى */}
            <div
              className="prose prose-lg max-w-none arabic-text"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* الكلمات المفتاحية */}
            {article.keywords && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
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
      </main>

      <Footer />
    </div>
  );
}





















