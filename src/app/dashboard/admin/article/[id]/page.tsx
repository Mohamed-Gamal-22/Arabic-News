"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";
import BackToDashboardButton from "@/components/BackToDashboardButton";
import ArticleApprovalModal from "@/components/ArticleApprovalModal";
import { getArticleById } from "@/lib/api";
import { approveArticleUnpend, deleteArticle } from "@/lib/articles";
import { ApiArticle } from "@/lib/api";
import { getCategoriesWithToken, ApiCategory } from "@/lib/superAdminApi";
import Link from "next/link";
import { AlertModal } from "@/components/ui/alert-modal";

export default function ReviewArticle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const resolvedParams = use(params);
  const [article, setArticle] = useState<ApiArticle | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const sourceTab = searchParams.get("tab");
  const cameFromApprovedTab = sourceTab === "approved";
  const cameFromPendingTab = sourceTab === "pending";
  const canApprove = !cameFromApprovedTab && (cameFromPendingTab || article?.isPending);

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

        const [articleData, categoriesData] = await Promise.all([
          getArticleById(articleId, token),
          getCategoriesWithToken(token),
        ]);

        if (articleData) {
          setArticle(articleData);
          setCategories(categoriesData || []);
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

  const handleApproveClick = () => {
    if (!article || !session?.accessToken || !categories.length) return;
    setShowApprovalModal(true);
  };

  const handleApproveSubmit = async (approvalData: {
    IsTrending: boolean;
    TrendPeriodInDays: number;
  }) => {
    if (!article || !session?.accessToken || !categories.length) return;

    try {
      setProcessing(true);
      setActionSuccess("");
      setError(null);

      // الحصول على CategoryId من categoryName
      const currentCategory = categories.find(
        (cat: ApiCategory) => cat.name === article.categoryName
      );

      if (!currentCategory) {
        throw new Error("لم يتم العثور على التصنيف");
      }

      const approveData = {
        Title: article.title,
        Content: article.content,
        Summary: article.summary,
        Slug: article.slug,
        CategoryId: currentCategory.id,
        IsTrending: approvalData.IsTrending,
        TrendPeriodInDays: approvalData.TrendPeriodInDays,
        IsPending: false,
      };

      await approveArticleUnpend(article.id, approveData, session.accessToken);
      setActionSuccess("تم الموافقة على المقال بنجاح");
      setShowSuccessModal(true);
    } catch (err: unknown) {
      setError(err.message || "حدث خطأ في الموافقة على المقال");
      setShowErrorModal(true);
      console.error("Error approving article:", err);
      throw err; // Re-throw to let modal handle it
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!article || !session?.accessToken) return;

    if (
      !confirm(
        "هل أنت متأكد من رفض وحذف هذه المقالة؟ لا يمكن التراجع عن هذا الإجراء."
      )
    ) {
      return;
    }

    try {
      setProcessing(true);
      setActionSuccess("");
      setError(null);
      await deleteArticle(article.id, session.accessToken);
      setActionSuccess("تم رفض وحذف المقال بنجاح");
      setShowSuccessModal(true);
    } catch (err: unknown) {
      setError(err.message || "حدث خطأ في حذف المقال");
      setShowErrorModal(true);
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
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">أ</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white arabic-heading">
                مراجعة المقال
              </h1>
            </div>
            <div className="flex items-center gap-2 space-x-reverse">
              <BackToDashboardButton fallbackPath="/dashboard/admin" />
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
            {/* Success Modal */}
            <AlertModal
              open={showSuccessModal}
              onOpenChange={setShowSuccessModal}
              variant="success"
              message={actionSuccess}
              actionButton={{
                label: "تم",
                onClick: () => {
                  setShowSuccessModal(false);
                  setActionSuccess("");
                  router.push("/dashboard/admin");
                },
              }}
            />

            {/* Error Modal */}
            <AlertModal
              open={showErrorModal}
              onOpenChange={setShowErrorModal}
              variant="error"
              message={error || ""}
              actionButton={{
                label: "إغلاق",
                onClick: () => {
                  setShowErrorModal(false);
                  setError(null);
                },
                variant: "outline",
              }}
            />

            {/* Approval Modal */}
            <ArticleApprovalModal
              open={showApprovalModal}
              onOpenChange={setShowApprovalModal}
              onApprove={handleApproveSubmit}
              loading={processing}
            />

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

            {/* الأزرار */}
            <div className="flex justify-end gap-3 space-x-reverse">
              <LoadingButton
                variant="destructive"
                onClick={handleDelete}
                loading={processing}
                loadingText="جاري المعالجة..."
              >
                حذف
              </LoadingButton>
              <LoadingButton asChild disabled={processing} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Link href={`/dashboard/admin/article/${article.id}/edit`}>
                  تعديل
                </Link>
              </LoadingButton>
              {canApprove && (
                <LoadingButton
                  onClick={handleApproveClick}
                  loading={processing}
                  disabled={!categories.length}
                  className="bg-green-600 hover:bg-green-700"
                >
                  موافقة
                </LoadingButton>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
