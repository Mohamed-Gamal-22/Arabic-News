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
import { Pagination } from "@/components/ui/pagination";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);

        console.log("Session:", session);

        // الحصول على التوكن من session
        const token = session?.accessToken;
        const role = session?.user?.role;

        console.log("Token:", token);
        console.log("Role:", role);

        if (!token) {
          console.log("No token found");
          setError("غير مصرح لك بالوصول");
          setLoading(false);
          return;
        }

        console.log("Fetching articles for role:", role);

        // جميع المستخدمين بيحتاجوا التوكن عشان يجيبوا مقالاتهم
        // الـ API هيرجع بس المقالات الخاصة بالـ user اللي بيبعت توكنه
        console.log("Fetching articles with token for current user");
        const response = await getArticles(page, 10, undefined, token);

        if (response && response.data) {
          const apiTotalCount = response.totalCount || 0;
          setArticles(response.data);
          setTotalCount(apiTotalCount);

          console.log("=== Admin Articles API Response ===");
          console.log("Page:", page);
          console.log("Total Count:", apiTotalCount);
          console.log("Articles in this page:", response.data.length);
          console.log("Total Pages:", Math.ceil(apiTotalCount / 10));
        } else {
          console.log("No data in response");
          setArticles([]);
          setTotalCount(0);
        }
      } catch (err) {
        setError("حدث خطأ في جلب المقالات");
        console.error("Error fetching articles:", err);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchArticles();
    } else {
      console.log("No session yet");
      setLoading(false);
    }
  }, [session, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // حساب الإحصائيات
  const totalArticles = articles.length;
  const publishedArticles = articles.filter((a) => a.publishedAt).length;
  const pendingArticles = articles.length; // سيتم تعديله حسب الـ API
  const totalWriters = new Set(articles.map((a) => a.authorId)).size;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "منشور";
      case "pending":
        return "في الانتظار";
      case "draft":
        return "مسودة";
      case "rejected":
        return "مرفوض";
      default:
        return "غير معروف";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* الهيدر */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">أ</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white arabic-heading">
                داشبورد الأدمن
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
                إجمالي الكتاب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalWriters}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* جميع المقالات */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-heading">جميع المقالات</CardTitle>
            <CardDescription className="arabic-text">
              إدارة جميع المقالات في النظام
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
                        <span>✍️ {article.authorName}</span>
                        <span>
                          📅{" "}
                          {new Date(article.publishedAt).toLocaleDateString(
                            "ar-EG"
                          )}
                        </span>
                        <span>📂 {article.categoryName}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          "published"
                        )}`}
                      >
                        {getStatusText("published")}
                      </span>
                      <Link href={`/dashboard/admin/article/${article.id}`}>
                        <Button variant="outline" size="sm">
                          مراجعة
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        تعديل
                      </Button>
                      <Button variant="destructive" size="sm">
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalCount > 10 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(totalCount / 10)}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
