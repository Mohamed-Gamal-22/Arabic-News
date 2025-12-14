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
import LogoutButton from "@/components/LogoutButton";
import { getArticles } from "@/lib/api";
import { ApiArticle } from "@/lib/api";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// دالة لتحويل الدور إلى العربية
const getRoleInArabic = (role: string): string => {
  if (role === "Writer" || role === "User") return "كاتب";
  if (role === "Admin") return "أدمن";
  if (role === "SuperAdmin") return "سوبر أدمن";
  return "كاتب";
};

export default function WriterDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(12); // 12 مقالة في كل صفحة
  const [totalCount, setTotalCount] = useState(0);
  
  // States for tabs
  const [activeArticlesTab, setActiveArticlesTab] = useState<"approved" | "pending">("pending");
  const [approvedArticles, setApprovedArticles] = useState<ApiArticle[]>([]);
  const [pendingArticles, setPendingArticles] = useState<ApiArticle[]>([]);
  const [approvedPageIndex, setApprovedPageIndex] = useState(1);
  const [pendingPageIndex, setPendingPageIndex] = useState(1);
  const [approvedTotalCount, setApprovedTotalCount] = useState(0);
  const [pendingTotalCount, setPendingTotalCount] = useState(0);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);

  // Fetch approved articles
  useEffect(() => {
    const fetchApprovedArticles = async () => {
      if (!session?.accessToken) return;
      
      try {
        setApprovedLoading(true);
        const response = await getArticles(
          approvedPageIndex,
          pageSize,
          undefined,
          session.accessToken,
          false // isPending = false for approved
        );

        if (response) {
          setApprovedArticles(response.data || []);
          setApprovedTotalCount(response.totalCount || 0);
        }
      } catch (err) {
        console.error("Error fetching approved articles:", err);
      } finally {
        setApprovedLoading(false);
      }
    };

    if (session) {
      fetchApprovedArticles();
    }
  }, [session, approvedPageIndex, pageSize]);

  // Fetch pending articles
  useEffect(() => {
    const fetchPendingArticles = async () => {
      if (!session?.accessToken) return;
      
      try {
        setPendingLoading(true);
        const response = await getArticles(
          pendingPageIndex,
          pageSize,
          undefined,
          session.accessToken,
          true // isPending = true for pending
        );

        if (response) {
          setPendingArticles(response.data || []);
          setPendingTotalCount(response.totalCount || 0);
        }
      } catch (err) {
        console.error("Error fetching pending articles:", err);
      } finally {
        setPendingLoading(false);
      }
    };

    if (session) {
      fetchPendingArticles();
    }
  }, [session, pendingPageIndex, pageSize]);

  // Set loading state based on active tab
  useEffect(() => {
    setLoading(activeArticlesTab === "approved" ? approvedLoading : pendingLoading);
  }, [activeArticlesTab, approvedLoading, pendingLoading]);

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
                {session?.user ? (
                  <span>
                    داشبورد - {getRoleInArabic(session.user.role)} {session.user.name}
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

        {/* المقالات */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-heading">المقالات</CardTitle>
            <CardDescription className="arabic-text">
              جميع مقالاتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeArticlesTab} onValueChange={(v) => setActiveArticlesTab(v as "approved" | "pending")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger 
                  value="approved" 
                  className="arabic-text bg-green-100 text-green-800 data-[state=active]:bg-green-600 data-[state=active]:text-white"
                >
                  المقالات الموافق عليها ({approvedTotalCount})
                </TabsTrigger>
                <TabsTrigger 
                  value="pending" 
                  className="arabic-text bg-yellow-100 text-yellow-800 data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
                >
                  المقالات تحت المراجعة ({pendingTotalCount})
                </TabsTrigger>
              </TabsList>

              {/* Tab: المقالات الموافق عليها */}
              <TabsContent value="approved">
                {approvedLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 arabic-text">
                      جاري التحميل...
                    </p>
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
                                router.push(
                                  `/dashboard/writer/article/${article.id}?isPending=false`
                                )
                              }
                            >
                              عرض التفاصيل
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {approvedTotalCount > pageSize && (
                      <div className="mt-6 flex justify-center">
                        <Pagination
                          currentPage={approvedPageIndex}
                          totalPages={Math.ceil(approvedTotalCount / pageSize)}
                          onPageChange={handleApprovedPageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Tab: المقالات تحت المراجعة */}
              <TabsContent value="pending">
                {pendingLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 arabic-text">
                      جاري التحميل...
                    </p>
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
                                router.push(
                                  `/dashboard/writer/article/${article.id}?isPending=true`
                                )
                              }
                            >
                              عرض التفاصيل
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pendingTotalCount > pageSize && (
                      <div className="mt-6 flex justify-center">
                        <Pagination
                          currentPage={pendingPageIndex}
                          totalPages={Math.ceil(pendingTotalCount / pageSize)}
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
