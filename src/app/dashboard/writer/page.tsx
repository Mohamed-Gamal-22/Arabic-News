"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";
import { getArticles } from "@/lib/api";
import { ApiArticle } from "@/lib/api";

export default function WriterDashboard() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);

        // الحصول على التوكن من session
        if (!session?.accessToken) {
          setError("غير مصرح لك بالوصول");
          setLoading(false);
          return;
        }

        const token = session.accessToken;

        console.log("Fetching articles with token:", token);

        // جلب مقالات الكاتب (مع التوكن)
        const response = await getArticles(1, 10, undefined, token);

        console.log("Articles response:", response);

        if (response && response.data) {
          setArticles(response.data);
        }
      } catch (err) {
        setError("حدث خطأ في جلب المقالات");
        console.error("Error fetching articles:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchArticles();
    }
  }, [session]);

  // حساب الإحصائيات
  const totalArticles = articles.length;
  const publishedArticles = articles.filter(
    (a) => a.isTrending !== undefined
  ).length; // سيتم تعديله حسب الـ API
  const pendingArticles = articles.length; // سيتم تعديله حسب الـ API
  const draftArticles = articles.length; // سيتم تعديله حسب الـ API

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* الهيدر */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">أ</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white arabic-heading">
                داشبورد الكاتب
              </h1>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                إجمالي المقالات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalArticles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                المقالات المنشورة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {publishedArticles}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                في الانتظار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingArticles}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                المسودات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {draftArticles}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الإجراءات السريعة */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-heading">
                الإجراءات السريعة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 space-x-reverse">
                <Button asChild>
                  <Link href="/dashboard/writer/create">إنشاء مقالة جديدة</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/writer/articles">
                    عرض جميع المقالات
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* المقالات الأخيرة */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-heading">المقالات الأخيرة</CardTitle>
            <CardDescription className="arabic-text">
              آخر المقالات التي قمت بإنشائها
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 arabic-text">
                  جاري التحميل...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 arabic-text">{error}</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 arabic-text">
                  لا توجد مقالات بعد
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white arabic-heading">
                        {article.title}
                      </h3>
                      <div className="flex items-center space-x-4 space-x-reverse mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>
                          📅{" "}
                          {new Date(article.publishedAt).toLocaleDateString(
                            "ar-EG"
                          )}
                        </span>
                        <span>🏷️ {article.categoryName}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Button variant="outline" size="sm">
                        تعديل
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
