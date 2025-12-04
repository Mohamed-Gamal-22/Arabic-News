"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LogoutButton from "@/components/LogoutButton";
import { getArticles, ApiArticle } from "@/lib/api";
import { getCurrentUser, CurrentUserProfile } from "@/lib/superAdminApi";
import { Pagination } from "@/components/ui/pagination";

export default function WriterDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState<CurrentUserProfile | null>(null);
  const [activeArticlesTab, setActiveArticlesTab] = useState<string>("approved");
  
  // States للمقالات الموافق عليها
  const [approvedArticles, setApprovedArticles] = useState<ApiArticle[]>([]);
  const [approvedPageIndex, setApprovedPageIndex] = useState(1);
  const [approvedPageSize, setApprovedPageSize] = useState(5);
  const [approvedTotalCount, setApprovedTotalCount] = useState(0);
  const [approvedLoading, setApprovedLoading] = useState(true);
  
  // States للمقالات تحت المراجعة
  const [pendingArticles, setPendingArticles] = useState<ApiArticle[]>([]);
  const [pendingPageIndex, setPendingPageIndex] = useState(1);
  const [pendingPageSize, setPendingPageSize] = useState(5);
  const [pendingTotalCount, setPendingTotalCount] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.accessToken) return;

      try {
        const userData = await getCurrentUser(session.accessToken);
        if (userData) {
          setCurrentUser(userData);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  // جلب المقالات الموافق عليها
  useEffect(() => {
    const fetchApprovedArticles = async () => {
      try {
        setApprovedLoading(true);
        const token = session?.accessToken;

        if (!token) {
          setError("غير مصرح لك بالوصول");
          setApprovedLoading(false);
          return;
        }

        const response = await getArticles(
          approvedPageIndex,
          approvedPageSize,
          undefined,
          token,
          false // IsPending=false للمقالات الموافق عليها
        );

        if (response) {
          setApprovedArticles(response.data || []);
          setApprovedTotalCount(response.totalCount || 0);
        }
      } catch (err) {
        setError("حدث خطأ في جلب المقالات");
        console.error("Error fetching approved articles:", err);
      } finally {
        setApprovedLoading(false);
      }
    };

    if (session) {
      fetchApprovedArticles();
    }
  }, [session, approvedPageIndex, approvedPageSize]);

  // جلب المقالات تحت المراجعة
  useEffect(() => {
    const fetchPendingArticles = async () => {
      try {
        setPendingLoading(true);
        const token = session?.accessToken;

        if (!token) {
          setError("غير مصرح لك بالوصول");
          setPendingLoading(false);
          return;
        }

        const response = await getArticles(
          pendingPageIndex,
          pendingPageSize,
          undefined,
          token,
          true // IsPending=true للمقالات تحت المراجعة
        );

        if (response) {
          setPendingArticles(response.data || []);
          setPendingTotalCount(response.totalCount || 0);
        }
      } catch (err) {
        setError("حدث خطأ في جلب المقالات");
        console.error("Error fetching pending articles:", err);
      } finally {
        setPendingLoading(false);
      }
    };

    if (session) {
      fetchPendingArticles();
    }
  }, [session, pendingPageIndex, pendingPageSize]);

  const handleApprovedPageChange = (newPageIndex: number) => {
    setApprovedPageIndex(newPageIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePendingPageChange = (newPageIndex: number) => {
    setPendingPageIndex(newPageIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // حساب الإحصائيات
  const totalArticles = approvedTotalCount + pendingTotalCount;
  const publishedArticles = approvedTotalCount;
  const pendingArticlesCount = pendingTotalCount;
  const draftArticles = 0; // سيتم تحديثه حسب API

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
                {currentUser ? (
                  <span>
                    مرحبا {currentUser.displayName || currentUser.fullName || currentUser.userName} (كاتب)
                  </span>
                ) : (
                  "داشبورد الكاتب"
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
                {pendingArticlesCount}
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

        {/* المقالات مع Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-heading">مقالاتي</CardTitle>
            <CardDescription className="arabic-text">
              جميع المقالات التي قمت بإنشائها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeArticlesTab} onValueChange={setActiveArticlesTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 flex-row-reverse">
                <TabsTrigger
                  value="approved"
                  className="arabic-text flex-row-reverse data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  المقالات الموافق عليها ({approvedTotalCount})
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="arabic-text flex-row-reverse data-[state=active]:bg-yellow-500 data-[state=active]:text-gray-900"
                >
                  المقالات تحت المراجعة ({pendingTotalCount})
                </TabsTrigger>
              </TabsList>

              {/* تاب المقالات الموافق عليها */}
              <TabsContent value="approved">
                {approvedLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 arabic-text">
                      جاري التحميل...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 arabic-text">{error}</p>
                  </div>
                ) : approvedArticles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 arabic-text">
                      لا توجد مقالات موافق عليها
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {approvedArticles.map((article) => (
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/dashboard/writer/article/${article.id}`)
                              }
                            >
                              عرض التفاصيل
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination للمقالات الموافق عليها */}
                    {approvedTotalCount > approvedPageSize && (
                      <div className="mt-6 flex justify-center">
                        <Pagination
                          currentPage={approvedPageIndex}
                          totalPages={Math.ceil(approvedTotalCount / approvedPageSize)}
                          onPageChange={handleApprovedPageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* تاب المقالات تحت المراجعة */}
              <TabsContent value="pending">
                {pendingLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 arabic-text">
                      جاري التحميل...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 arabic-text">{error}</p>
                  </div>
                ) : pendingArticles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 arabic-text">
                      لا توجد مقالات تحت المراجعة
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {pendingArticles.map((article) => (
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/dashboard/writer/article/${article.id}?isPending=true`)
                              }
                            >
                              عرض التفاصيل
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination للمقالات تحت المراجعة */}
                    {pendingTotalCount > pendingPageSize && (
                      <div className="mt-6 flex justify-center">
                        <Pagination
                          currentPage={pendingPageIndex}
                          totalPages={Math.ceil(pendingTotalCount / pendingPageSize)}
                          onPageChange={handlePendingPageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
