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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import BackToDashboardButton from "@/components/BackToDashboardButton";
import {
  getCategoryById,
  updateCategory,
  getCategoriesWithToken,
} from "@/lib/superAdminApi";
import { Category } from "@/lib/api";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const resolvedParams = use(params);
  const [category, setCategory] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: null as number | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!session?.accessToken) {
          setError("غير مصرح لك بالوصول");
          setLoading(false);
          return;
        }

        const token = session.accessToken;
        const categoryId = parseInt(resolvedParams.id);

        if (isNaN(categoryId)) {
          setError("رقم التصنيف غير صحيح");
          setLoading(false);
          return;
        }

        // جلب بيانات التصنيف والتصنيفات معاً
        const [categoryData, categoriesData] = await Promise.all([
          getCategoryById(token, categoryId),
          getCategoriesWithToken(token),
        ]);

        if (categoryData) {
          setCategory(categoryData);
          setFormData({
            name: categoryData.name || "",
            slug: categoryData.slug || "",
            description: categoryData.description || "",
            parentId: categoryData.parentId || null,
          });
        } else {
          setError("التصنيف غير موجود");
        }

        if (categoriesData) {
          setCategories(categoriesData);
        }
      } catch (err: any) {
        console.error("Error fetching category:", err);
        setError(err.message || "حدث خطأ في جلب بيانات التصنيف");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setErrorMessage("");

    try {
      if (!session?.accessToken) {
        throw new Error("غير مصرح لك بالوصول");
      }

      const token = session.accessToken;
      const categoryId = parseInt(resolvedParams.id);

      if (isNaN(categoryId)) {
        throw new Error("رقم التصنيف غير صحيح");
      }

      // التحقق من البيانات
      if (!formData.name.trim()) {
        throw new Error("اسم التصنيف مطلوب");
      }

      if (!formData.slug.trim()) {
        throw new Error("الرابط (Slug) مطلوب");
      }

      // إعداد البيانات للإرسال
      const updateData: any = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
      };

      // إضافة parentId فقط إذا كان موجوداً
      if (formData.parentId !== null) {
        updateData.parentId = formData.parentId;
      } else {
        updateData.parentId = null;
      }

      // تحديث التصنيف
      const result = await updateCategory(token, categoryId, updateData);

      setSuccessMessage("تم تحديث التصنيف بنجاح");
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Error updating category:", err);
      setErrorMessage(
        err.message || "حدث خطأ أثناء تحديث التصنيف. يرجى المحاولة مرة أخرى."
      );
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    router.push("/dashboard/super-admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400 arabic-text">
              جاري التحميل...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="arabic-heading">خطأ</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription className="arabic-text">{error}</AlertDescription>
              </Alert>
              <div className="mt-4">
                <BackToDashboardButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // تصنيفات رئيسية فقط (للاستخدام كـ parent)
  const mainCategories = categories.filter(
    (cat) => cat.parentId === null && cat.id !== parseInt(resolvedParams.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 space-x-reverse">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white arabic-heading">
                تعديل التصنيف
              </h1>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackToDashboardButton />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="arabic-heading">تعديل التصنيف</CardTitle>
            <CardDescription className="arabic-text">
              قم بتعديل بيانات التصنيف
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* اسم التصنيف */}
              <div className="space-y-2">
                <Label htmlFor="name" className="arabic-text">
                  اسم التصنيف *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="أدخل اسم التصنيف"
                  className="arabic-text"
                  required
                />
              </div>

              {/* الرابط (Slug) */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="arabic-text">
                  الرابط (Slug) *
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="أدخل الرابط (مثال: technology)"
                  className="arabic-text"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 arabic-text">
                  الرابط يجب أن يكون باللغة الإنجليزية بدون مسافات
                </p>
              </div>

              {/* الوصف */}
              <div className="space-y-2">
                <Label htmlFor="description" className="arabic-text">
                  الوصف
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="أدخل وصف التصنيف (اختياري)"
                  className="arabic-text min-h-[100px]"
                />
              </div>

              {/* التصنيف الرئيسي */}
              <div className="space-y-2">
                <Label htmlFor="parentId" className="arabic-text">
                  التصنيف الرئيسي (اختياري)
                </Label>
                <Select
                  value={
                    formData.parentId !== null
                      ? formData.parentId.toString()
                      : "none"
                  }
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      parentId: value === "none" ? null : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="arabic-text">
                    <SelectValue placeholder="اختر تصنيف رئيسي" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">لا يوجد (تصنيف رئيسي)</SelectItem>
                    {mainCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 dark:text-gray-400 arabic-text">
                  إذا تركت هذا الحقل فارغاً، سيكون التصنيف تصنيفاً رئيسياً
                </p>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex gap-3 space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/super-admin")}
                    disabled={saving}
                    className="arabic-text"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white arabic-text"
                  >
                    {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Modal النجاح */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="arabic-text">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                نجح التحديث
              </DialogTitle>
              <DialogDescription>{successMessage}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button
                onClick={handleSuccessModalClose}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                موافق
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal الخطأ */}
        <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
          <DialogContent className="arabic-text">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                خطأ في التحديث
              </DialogTitle>
              <DialogDescription>{errorMessage}</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button
                onClick={() => setShowErrorModal(false)}
                variant="outline"
              >
                إغلاق
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
