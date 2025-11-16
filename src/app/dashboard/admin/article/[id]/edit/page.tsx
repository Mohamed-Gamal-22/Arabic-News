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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LogoutButton from "@/components/LogoutButton";
import { getArticleById, updateArticle } from "@/lib/api";
import { getCategoriesWithToken } from "@/lib/superAdminApi";
import { Category } from "@/lib/api";

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const resolvedParams = use(params);
  const [article, setArticle] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    Title: "",
    Summary: "",
    Content: "",
    Slug: "",
    CategoryId: "",
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
        const articleId = parseInt(resolvedParams.id);

        if (isNaN(articleId)) {
          setError("رقم المقال غير صحيح");
          setLoading(false);
          return;
        }

        // جلب بيانات المقال والتصنيفات معاً
        const [articleData, categoriesData] = await Promise.all([
          getArticleById(articleId, token),
          getCategoriesWithToken(token),
        ]);

        if (articleData) {
          setArticle(articleData);

          // تحديد CategoryId الحالي
          let categoryId = "";
          if (categoriesData && articleData.categoryName) {
            const currentCategory = categoriesData.find(
              (cat: any) => cat.name === articleData.categoryName
            );
            if (currentCategory) {
              categoryId = currentCategory.id.toString();
            }
          }

          setFormData({
            Title: articleData.title || "",
            Summary: articleData.summary || "",
            Content: articleData.content || "",
            Slug: articleData.slug || "",
            CategoryId: categoryId,
          });
        } else {
          setError("لم يتم العثور على المقال");
        }

        if (categoriesData) {
          setCategories(categoriesData || []);
        }
      } catch (err) {
        setError("حدث خطأ في جلب البيانات");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, resolvedParams.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, CategoryId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!session?.accessToken) {
        setErrorMessage("غير مصرح لك بالوصول");
        setShowErrorModal(true);
        setSaving(false);
        return;
      }

      // التحقق من الحقول المطلوبة
      if (
        !formData.Title?.trim() ||
        !formData.Summary?.trim() ||
        !formData.Content?.trim() ||
        !formData.Slug?.trim() ||
        !formData.CategoryId
      ) {
        setErrorMessage("جميع الحقول مطلوبة");
        setShowErrorModal(true);
        setSaving(false);
        return;
      }

      const articleId = parseInt(resolvedParams.id);
      const token = session.accessToken;

      // استخدام الأسماء الصحيحة بالضبط (PascalCase) كما يتوقع API
      const updateData = {
        Title: formData.Title.trim(),
        content: formData.Content.trim(),
        summary: formData.Summary.trim(),
        slug: formData.Slug.trim(),
        categoryId: formData.CategoryId,
      };

      console.log("gemy" , formData)
      await updateArticle(articleId.toString(), formData, token);

      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Error updating article:", err);
      setErrorMessage(err.message || "حدث خطأ في تعديل المقال");
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/dashboard/admin");
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
                تعديل المقال
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
              onClick={() => router.push("/dashboard/admin")}
              className="mt-4"
            >
              العودة للداشبورد
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="arabic-heading text-2xl">
                تعديل المقال
              </CardTitle>
              <CardDescription className="arabic-text">
                قم بتعديل بيانات المقال
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="Title" className="arabic-text">
                    العنوان *
                  </Label>
                  <Input
                    id="Title"
                    name="Title"
                    value={formData.Title}
                    onChange={handleInputChange}
                    className="mt-1 arabic-text"
                    placeholder="عنوان المقال"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="Summary" className="arabic-text">
                    الملخص *
                  </Label>
                  <Textarea
                    id="Summary"
                    name="Summary"
                    value={formData.Summary}
                    onChange={handleInputChange}
                    className="mt-1 arabic-text"
                    rows={3}
                    placeholder="ملخص المقال"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="Content" className="arabic-text">
                    المحتوى *
                  </Label>
                  <Textarea
                    id="Content"
                    name="Content"
                    value={formData.Content}
                    onChange={handleInputChange}
                    className="mt-1 arabic-text"
                    rows={10}
                    placeholder="محتوى المقال"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="Slug" className="arabic-text">
                    الرابط (Slug) *
                  </Label>
                  <Input
                    id="Slug"
                    name="Slug"
                    value={formData.Slug}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="article-slug"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="CategoryId" className="arabic-text">
                    القسم *
                  </Label>
                  <Select
                    value={formData.CategoryId}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/admin")}
                    disabled={saving}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="arabic-heading">نجح التعديل</DialogTitle>
              <DialogDescription className="arabic-text">
                تم تعديل المقال بنجاح
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button onClick={handleSuccessClose}>حسناً</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Error Modal */}
        <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="arabic-heading text-red-600">
                خطأ
              </DialogTitle>
              <DialogDescription className="arabic-text">
                {errorMessage}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowErrorModal(false)}>حسناً</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
