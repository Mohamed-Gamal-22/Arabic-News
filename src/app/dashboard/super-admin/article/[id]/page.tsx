"use client";

import { useState, useEffect, use } from "react";
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
import { getArticleById } from "@/lib/api";
import { approveArticle, rejectArticle, deleteArticle } from "@/lib/articles";
import { ApiArticle } from "@/lib/api";

export default function ReviewArticle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const resolvedParams = use(params);
  const [article, setArticle] = useState<ApiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string>("");

  useEffect(() => {
    const fetchArticle = async () => {
      if (!session?.accessToken) {
        setError("غير مصرح لك بالوصول");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const articleId = parseInt(resolvedParams.id);

        if (isNaN(articleId)) {
          setError("رقم المقال غير صحيح");
          setLoading(false);
          return;
        }

        const articleData = await getArticleById(
          articleId,
          session.accessToken
        );

        if (articleData) {
          setArticle(articleData);
        } else {
          setError("لم يتم العثور على المقال");
        }
      } catch (err) {
        setError("حدث خطأ في جلب المقال");
        console.error("Error fetching article:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchArticle();
    }
  }, [session, resolvedParams.id]);

  const handleApprove = async () => {
    if (!article || !session?.accessToken) return;

    try {
      setProcessing(true);
      setActionSuccess("");
      await approveArticle(article.id, session.accessToken);
      setActionSuccess("تم قبول المقال بنجاح");
      setTimeout(() => {
        router.push("/dashboard/super-admin");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "حدث خطأ في قبول المقال");
      console.error("Error approving article:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!article || !session?.accessToken) return;

    if (!confirm("هل أنت متأكد من رفض هذا المقال؟")) {
      return;
    }

    try {
      setProcessing(true);
      setActionSuccess("");
      await rejectArticle(article.id, session.accessToken);
      setActionSuccess("تم رفض المقال بنجاح");
      setTimeout(() => {
        router.push("/dashboard/super-admin");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "حدث خطأ في رفض المقال");
      console.error("Error rejecting article:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!article || !session?.accessToken) return;

    if (
      !confirm(
        "هل أنت متأكد من حذف هذا المقال نهائياً؟ هذه العملية لا يمكن التراجع عنها."
      )
    ) {
      return;
    }

    try {
      setProcessing(true);
      setActionSuccess("");
      await deleteArticle(article.id, session.accessToken);
      setActionSuccess("تم حذف المقال بنجاح");
      setTimeout(() => {
        router.push("/dashboard/super-admin");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "حدث خطأ في حذف المقال");
      console.error("Error deleting article:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* الهيدر */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">أ</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white arabic-heading">
                مراجعة المقال - السوبر أدمن
              </h1>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 arabic-text">
              جاري التحميل...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 arabic-text">{error}</p>
            <Button
              onClick={() => router.push("/dashboard/super-admin")}
              className="mt-4"
            >
              العودة للداشبورد
            </Button>
          </div>
        ) : article ? (
          <>
            {/* Success Message */}
            {actionSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 arabic-text">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-green-600">✅</span>
                    <span>{actionSuccess}</span>
                  </div>
                  <button
                    onClick={() => setActionSuccess("")}
                    className="text-green-600 hover:text-green-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* معلومات المقال */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="arabic-heading text-2xl">
                  {article.title}
                </CardTitle>
                <CardDescription className="arabic-text">
                  <div className="flex items-center space-x-4 space-x-reverse mt-2">
                    <span>✍️ {article.authorName}</span>
                    <span>
                      📅{" "}
                      {new Date(article.publishedAt).toLocaleDateString(
                        "ar-EG"
                      )}
                    </span>
                    <span>📂 {article.categoryName || "بدون قسم"}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              {article.imageUrl && (
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-auto mb-4 rounded-lg"
                />
              )}
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 arabic-heading">
                      الملخص
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 arabic-text">
                      {article.summary}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 arabic-heading">
                      المحتوى
                    </h3>
                    <div
                      className="text-gray-700 dark:text-gray-300 arabic-text prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </div>
                  {article.keywords && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2 arabic-heading">
                        الكلمات المفتاحية
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 arabic-text">
                        {article.keywords}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* الأزرار */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-2 space-x-reverse">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/super-admin")}
                  disabled={processing}
                >
                  إلغاء
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={processing}
                >
                  {processing ? "جاري المعالجة..." : "رفض"}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? "جاري المعالجة..." : "قبول المقال"}
                </Button>
              </div>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={processing}
              >
                حذف نهائي
              </Button>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}


