"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCategoryById,
  updateCategory,
  getCategoriesWithToken,
} from "@/lib/superAdminApi";

export default function EditCategoryPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const categoryId = parseInt(params.id as string);

  const [category, setCategory] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultType, setResultType] = useState<"success" | "error">("success");

  // جلب بيانات الكاتيجوري والكاتيجوريز
  useEffect(() => {
    const fetchData = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        const [categoryData, categoriesData] = await Promise.all([
          getCategoryById(session.accessToken, categoryId),
          getCategoriesWithToken(session.accessToken),
        ]);

        setCategory(categoryData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        setResultMessage("خطأ في جلب بيانات الكاتيجوري");
        setResultType("error");
        setShowResultModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, categoryId]);

  // دالة تحديث الكاتيجوري
  const handleUpdateCategory = async () => {
    if (!session?.accessToken || !category) return;

    try {
      setUpdating(true);

      // جلب البيانات من الفورم
      const form = document.querySelector("form") as HTMLFormElement;
      if (!form) return;

      const formData = new FormData(form);
      const updateData = {
        name: (formData.get("name") as string) || category.name,
        slug: (formData.get("slug") as string) || category.slug,
        description:
          (formData.get("description") as string) || category.description,
        parentId:
          formData.get("parentId") === "null" || formData.get("parentId") === ""
            ? null
            : formData.get("parentId")
            ? parseInt(formData.get("parentId") as string)
            : category.parentId,
      };

      console.log("Sending update data:", updateData);
      await updateCategory(session.accessToken, categoryId, updateData);

      setResultMessage("تم تحديث الكاتيجوري بنجاح!");
      setResultType("success");
      setShowResultModal(true);
    } catch (error) {
      console.error("خطأ في تحديث الكاتيجوري:", error);
      setResultMessage("خطأ في تحديث الكاتيجوري");
      setResultType("error");
      setShowResultModal(true);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات الكاتيجوري...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            الكاتيجوري غير موجود
          </h1>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            العودة
          </button>
        </div>
      </div>
    );
  }

  const mainCategories = categories.filter((cat) => cat.parentId === null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← العودة للداشبورد
          </button>
          <h1 className="text-3xl font-bold text-gray-900">تحرير الكاتيجوري</h1>
        </div>

        {/* Category Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {category.name}
            </h2>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">🏷️ الـ Slug</h3>
                <p className="text-sm text-gray-600">{category.slug}</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">📂 النوع</h3>
                <p className="text-sm text-gray-600">
                  {category.parentId ? "سابكاتيجوري" : "كاتيجوري رئيسي"}
                </p>
              </div>

              {category.parentId && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    👆 الكاتيجوري الرئيسي
                  </h3>
                  <p className="text-sm text-gray-600">
                    {categories.find((cat) => cat.id === category.parentId)
                      ?.name || "غير محدد"}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-2">📝 الوصف</h3>
                <p className="text-sm text-gray-600">
                  {category.description || "لا يوجد وصف"}
                </p>
              </div>
            </div>

            {categories.filter((cat) => cat.parentId === category.id).length >
              0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  📁 السابكاتيجوريز
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {categories
                    .filter((cat) => cat.parentId === category.id)
                    .map((subCat) => (
                      <div
                        key={subCat.id}
                        className="bg-white p-3 rounded border"
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {subCat.name}
                        </p>
                        <p className="text-xs text-gray-500">{subCat.slug}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            تحديث الكاتيجوري
          </h2>

          {/* رسالة توضيحية */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-blue-800">
                  ملاحظة مهمة
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    الحقول التي لم يتم تعديلها ستبقى بالقيم القديمة. فقط الحقول
                    التي تقوم بتعديلها ستتم تغييرها.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form>
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  اسم الكاتيجوري
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={category.name}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  الـ Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  defaultValue={category.slug}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  الوصف
                </label>
                <textarea
                  name="description"
                  defaultValue={category.description || ""}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  الكاتيجوري الرئيسي (اختياري)
                </label>
                <select
                  name="parentId"
                  defaultValue={category.parentId || ""}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">كاتيجوري رئيسي</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={updating}
            >
              إلغاء
            </Button>
            <Button onClick={handleUpdateCategory} disabled={updating}>
              {updating ? (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري التحديث...</span>
                </div>
              ) : (
                "تحديث الكاتيجوري"
              )}
            </Button>
          </div>
        </div>

        {/* Result Modal */}
        <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
          <DialogContent className="arabic-text">
            <DialogHeader>
              <DialogTitle className={`flex items-center gap-3 space-x-reverse ${
                resultType === "success" ? "text-green-600" : "text-red-600"
              }`}>
                {resultType === "success" ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span>
                  {resultType === "success" ? "نجح التحديث!" : "فشل التحديث!"}
                </span>
              </DialogTitle>
              <DialogDescription className="arabic-text text-lg">
                {resultMessage}
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setShowResultModal(false);
                  if (resultType === "success") {
                    router.back();
                  }
                }}
                className={
                  resultType === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {resultType === "success" ? "العودة للداشبورد" : "إغلاق"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
