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
import { getArticles, getCurrentUser, CurrentUserProfile } from "@/lib/api";
import { ApiArticle } from "@/lib/api";
import { Pagination } from "@/components/ui/pagination";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUserProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  // const [pageSize, setPageSize] = useState(5); // 5 مقالات في كل صفحة - unused
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.accessToken) return;

      try {
        const userData = await getCurrentUser(session.accessToken);
        if (userData) {
          setCurrentUser(userData);
        }
      } catch (err: unknown) {
        console.error("Error fetching user data:", err);
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

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
        // الـ API هيرجع المقالات حسب Role:
        // - Writer: مقالاته فقط
        // - Admin/SuperAdmin: جميع المقالات
        console.log("Fetching articles with token for role:", role);
        const response = await getArticles(
          pageIndex,
          pageSize,
          undefined,
          token
        );

        if (response) {
          // استخدام pageIndex من response، لكن نستخدم pageSize الذي أرسلناه (5)
          setPageIndex(response.pageIndex || pageIndex);
          // لا نحدث pageSize من response - نستخدم القيمة التي أرسلناها (5)
          setTotalCount(response.totalCount || 0);
          setArticles(response.data || []);

          console.log("=== Admin Articles API Response ===");
          console.log("PageIndex sent:", pageIndex);
          console.log("PageSize sent:", pageSize);
          console.log("PageIndex from API:", response.pageIndex);
          console.log("PageSize from API:", response.pageSize);
          console.log("Total Count:", response.totalCount);
          console.log("Articles in this page:", response.data?.length || 0);
          console.log(
            "Total Pages:",
            Math.ceil(response.totalCount / pageSize)
          );
        } else {
          console.log("No data in response");
          setArticles([]);
          setTotalCount(0);
        }
      } catch (err: unknown) {
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
  }, [session, pageIndex, pageSize]);

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // حساب الإحصائيات - استخدام totalCount من API بدلاً من articles.length
  const totalArticles = totalCount; // استخدام totalCount من API
  const publishedArticles = articles.filter((a) => a.publishedAt).length;
  const pendingArticles = 0; // سيتم تحديثه حسب API
  const totalWriters = new Set(articles.map((a) => a.authorId)).size;

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "published":
  //       return "bg-green-100 text-green-800";
  //     case "pending":
  //       return "bg-yellow-100 text-yellow-800";
  //     case "draft":
  //       return "bg-gray-100 text-gray-800";
  //     case "rejected":
  //       return "bg-red-100 text-red-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  // const getStatusText = (status: string) => {
  //   switch (status) {
  //     case "published":
  //       return "منشور";
  //     case "pending":
  //       return "في الانتظار";
  //     case "draft":
      //       return "مسودة";
      //     case "rejected":
      //       return "مرفوض";
      //     default:
      //       return "غير معروف";
      //   }
      // };

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
                {currentUser ? (
                  <span>
                    مرحبا{" "}
                    {currentUser.displayName ||
                      currentUser.fullName ||
                      currentUser.userName}{" "}
                    (أدمن)
                  </span>
                ) : (
                  "داشبورد الأدمن"
                )}
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
            <div className="flex justify-between items-center flex-row-reverse">
              <div>
                <CardTitle className="arabic-heading">جميع المقالات</CardTitle>
                <CardDescription className="arabic-text">
                  إدارة جميع المقالات في النظام
                </CardDescription>
              </div>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/dashboard/admin/create">إنشاء مقال جديد</Link>
              </Button>
            </div>
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
                      <Link href={`/dashboard/admin/article/${article.id}`}>
                        <Button variant="outline" size="sm">
                          مراجعة
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalCount > pageSize && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={pageIndex}
                  totalPages={Math.ceil(totalCount / pageSize)}
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
