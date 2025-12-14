"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
// import { LoadingButton } from "@/components/ui/loading-button"; // unused
import LogoutButton from "@/components/LogoutButton";
import BackToDashboardButton from "@/components/BackToDashboardButton";
import { getArticleById } from "@/lib/api";
import { ApiArticle } from "@/lib/api";

export default function ArticleDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // const router = useRouter(); // unused
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const resolvedParams = use(params);
  const [article, setArticle] = useState<ApiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);

        if (!session?.accessToken) {
          setError("غير مصرح لك بالوصول");
          setLoading(false);
          return;
        }

        const token = session.accessToken;
        const articleId = parseInt(resolvedParams.id);

        if (isNaN(articleId)) {
          setError("رقم المقال غير صحيح");
          setLoading(false);
          return;
        }

        const articleData = await getArticleById(articleId, token);

        if (articleData) {
          // التحقق من أن المقال ملك للكاتب
          const currentUserId = session.user?.id;
          if (articleData.authorId !== currentUserId) {
            setError("ليس لديك صلاحية لعرض هذا المقال");
            setLoading(false);
            return;
          }
          
          // Debug: طباعة بيانات المقالة
          console.log("=== Writer Article Data ===");
          console.log("Article ID:", articleData.id);
          console.log("isPending:", articleData.isPending);
          console.log("isPending type:", typeof articleData.isPending);
          console.log("isPending === true:", articleData.isPending === true);
          console.log("isPending === false:", articleData.isPending === false);
          console.log("publishedAt:", articleData.publishedAt);
          console.log("Full article data:", JSON.stringify(articleData, null, 2));
          
          setArticle(articleData);
        } else {
          setError("لم يتم العثور على المقال");
        }
      } catch (err: unknown) {
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
                تفاصيل المقال
              </h1>
            </div>
            <div className="flex items-center gap-2 space-x-reverse">
              <BackToDashboardButton fallbackPath="/dashboard/writer" />
              <LogoutButton />
            </div>
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
          </div>
        ) : article ? (
          <>
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
                    <span>📂 {article.categoryName}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              {article.imageUrl && (
                <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
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

            {/* Alert معلوماتي فقط - بدون أزرار تعديل */}
            {(() => {
              // قراءة isPending من URL query parameter
              const isPendingFromUrl = searchParams.get('isPending') === 'true';
              
              // استخدام isPending من الـ article أو من الـ URL
              const isPendingArticle = article.isPending ?? isPendingFromUrl;
              
              return isPendingArticle === true;
            })() ? (
              // مقالة تحت المراجعة
              <Alert className="mb-6 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                <AlertTitle className="arabic-heading text-yellow-800 dark:text-yellow-500 font-bold">
                  ⏳ مقالة تحت المراجعة
                </AlertTitle>
                <AlertDescription className="arabic-text text-yellow-700 dark:text-yellow-400 mt-2">
                  هذه المقالة تحت المراجعة حالياً. سيتم إعلامك عند الموافقة عليها من المسؤول.
                </AlertDescription>
              </Alert>
            ) : (
              // مقالة منشورة
              <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                <AlertTitle className="arabic-heading text-green-800 dark:text-green-500 font-bold">
                  ✅ مقالة منشورة
                </AlertTitle>
                <AlertDescription className="arabic-text text-green-700 dark:text-green-400 mt-2">
                  تم نشر هذه المقالة بنجاح! يمكنك مشاهدتها على الموقع.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
