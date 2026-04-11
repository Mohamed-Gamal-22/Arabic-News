"use client";

import { useState, useEffect } from "react";
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
import TinyMCEEditor from "@/components/TinyMCEEditor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LogoutButton from "@/components/LogoutButton";
import ArticleApprovalModal from "@/components/ArticleApprovalModal";
import { createArticle, ApiArticle } from "@/lib/api";
import { approveArticleUnpend } from "@/lib/articles";
import { getCategoriesWithToken, ApiCategory } from "@/lib/superAdminApi";

type FormState = {
  title: string;
  summary: string;
  content: string;
  slug: string;
  categoryId: string;
  keywords: string;
};

function validateCreateForm(
  formData: FormState,
  imageFile: File | null
): string | null {
  if (!formData.title?.trim()) return "العنوان مطلوب";
  if (!formData.summary?.trim()) return "الملخص مطلوب";
  if (!formData.content?.trim()) return "المحتوى مطلوب";
  if (!formData.slug?.trim()) return "الرابط (Slug) مطلوب";
  if (!formData.categoryId?.trim()) return "القسم مطلوب";
  if (!imageFile) return "الصورة مطلوبة";
  const categoryId = Number(formData.categoryId);
  if (!categoryId || isNaN(categoryId)) return "يجب اختيار قسم للمقال";
  return null;
}

function buildArticleFormData(
  formData: FormState,
  imageFile: File
): { formDataToSend: FormData; categoryId: number } {
  const categoryId = Number(formData.categoryId);
  const formDataToSend = new FormData();
  formDataToSend.append("Title", formData.title.trim());
  formDataToSend.append("Content", formData.content || "");
  formDataToSend.append("Summary", formData.summary.trim());
  formDataToSend.append("Slug", formData.slug.trim());
  formDataToSend.append("CategoryId", categoryId.toString());
  formDataToSend.append("Image", imageFile);
  if (formData.keywords?.trim()) {
    formDataToSend.append("Keywords", formData.keywords.trim());
  }
  return { formDataToSend, categoryId };
}

export default function SuperAdminCreateArticlePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    "تم إنشاء المقال بنجاح!"
  );
  const [showInstantModal, setShowInstantModal] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    title: "",
    summary: "",
    content: "",
    slug: "",
    categoryId: "",
    keywords: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const suggestedKeywords = [
    "سياسة",
    "رياضة",
    "فن",
    "صحة",
    "تكنولوجيا",
    "اقتصاد",
    "ثقافة",
    "أخبار",
    "ترفيه",
    "علوم",
    "تعليم",
    "سفر",
    "طعام",
    "أزياء",
    "مشاهير",
  ];

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      if (!session?.accessToken) return;

      try {
        const categoriesData = await getCategoriesWithToken(
          session.accessToken
        );
        setCategories(categoriesData || []);
      } catch (err: unknown) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const addKeyword = (keyword: string) => {
    if (!selectedKeywords.includes(keyword)) {
      const newKeywords = [...selectedKeywords, keyword];
      setSelectedKeywords(newKeywords);
      setFormData((prev) => ({ ...prev, keywords: newKeywords.join(", ") }));
    }
  };

  const removeKeyword = (keyword: string) => {
    const newKeywords = selectedKeywords.filter((k) => k !== keyword);
    setSelectedKeywords(newKeywords);
    setFormData((prev) => ({ ...prev, keywords: newKeywords.join(", ") }));
  };

  const addCustomKeyword = () => {
    if (
      keywordInput.trim() &&
      !selectedKeywords.includes(keywordInput.trim())
    ) {
      const newKeywords = [...selectedKeywords, keywordInput.trim()];
      setSelectedKeywords(newKeywords);
      setFormData((prev) => ({ ...prev, keywords: newKeywords.join(", ") }));
      setKeywordInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!session?.accessToken) {
        setError("غير مصرح لك بالوصول - يرجى تسجيل الدخول مرة أخرى");
        setLoading(false);
        return;
      }

      const validationError = validateCreateForm(formData, imageFile);
      if (validationError) {
        setErrorMessage(validationError);
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      const token = session.accessToken;
      const { formDataToSend } = buildArticleFormData(
        formData,
        imageFile as File
      );

      const createdArticle = await createArticle(formDataToSend, token);

      if (createdArticle) {
        setSuccessMessage("تم إنشاء المقال بنجاح!");
        setShowSuccessModal(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ في إنشاء المقال");
      console.error("Error creating article:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInstantModal = () => {
    if (!session?.accessToken) {
      setErrorMessage("غير مصرح لك بالوصول - يرجى تسجيل الدخول مرة أخرى");
      setShowErrorModal(true);
      return;
    }
    const validationError = validateCreateForm(formData, imageFile);
    if (validationError) {
      setErrorMessage(validationError);
      setShowErrorModal(true);
      return;
    }
    setShowInstantModal(true);
  };

  const handleInstantPublish = async (approvalData: {
    IsTrending: boolean;
    TrendPeriodInDays: number;
  }) => {
    if (!session?.accessToken || !imageFile) return;

    const token = session.accessToken;
    setLoading(true);
    setError(null);

    try {
      const { formDataToSend, categoryId } = buildArticleFormData(
        formData,
        imageFile
      );

      const createdArticle: ApiArticle | null = await createArticle(
        formDataToSend,
        token
      );

      if (!createdArticle?.id) {
        throw new Error("لم يُرجع الخادم معرف المقال بعد الإنشاء");
      }

      try {
        await approveArticleUnpend(
          createdArticle.id,
          {
            Title: formData.title.trim(),
            Content: formData.content || "",
            Summary: formData.summary.trim(),
            Slug: formData.slug.trim(),
            CategoryId: categoryId,
            IsTrending: approvalData.IsTrending,
            TrendPeriodInDays: approvalData.IsTrending
              ? approvalData.TrendPeriodInDays
              : 1,
            IsPending: false,
          },
          token
        );
        setSuccessMessage("تم إنشاء المقال ونشره فوراً!");
        setShowInstantModal(false);
        setShowSuccessModal(true);
      } catch {
        setSuccessMessage(
          "تم إنشاء المقال، لكن تعذر نشره فوراً. قد يكون تحت المراجعة—تحقق من التبويب المناسب."
        );
        setShowInstantModal(false);
        setShowSuccessModal(true);
      }
    } catch (err: unknown) {
      throw err instanceof Error
        ? err
        : new Error("حدث خطأ في إنشاء المقال أو نشره");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">أ</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white arabic-heading">
                إنشاء مقال جديد
              </h1>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="arabic-heading">إنشاء مقال جديد</CardTitle>
            <CardDescription className="arabic-text">
              قم بملء البيانات التالية لإنشاء مقال جديد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded arabic-text">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="title" className="arabic-text">
                  العنوان *
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="summary" className="arabic-text">
                  الملخص *
                </Label>
                <Textarea
                  id="summary"
                  name="summary"
                  required
                  value={formData.summary}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content" className="arabic-text">
                  المحتوى *
                </Label>
                <div className="mt-1">
                  <TinyMCEEditor
                    value={formData.content}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, content: value }))
                    }
                    placeholder="اكتب محتوى المقالة هنا..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="slug" className="arabic-text">
                  الرابط (Slug) *
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder="article-slug"
                />
              </div>

              <div>
                <Label htmlFor="categoryId" className="arabic-text">
                  القسم *
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={handleSelectChange}
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: ApiCategory) => (
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

              <div>
                <Label htmlFor="keywords" className="arabic-text">
                  الكلمات المفتاحية
                </Label>

                {selectedKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {selectedKeywords.map((keyword) => (
                      <div
                        key={keyword}
                        className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{keyword}</span>
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="hover:bg-blue-200 rounded-full p-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2 mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 arabic-text">
                    اختر من الكلمات المقترحة:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedKeywords.map((keyword) => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => addKeyword(keyword)}
                        disabled={selectedKeywords.includes(keyword)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          selectedKeywords.includes(keyword)
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-white hover:bg-gray-100 border-gray-300"
                        }`}
                      >
                        {keyword}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomKeyword();
                      }
                    }}
                    placeholder="أضف كلمة مفتاحية مخصصة"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCustomKeyword}
                  >
                    إضافة
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="image" className="arabic-text">
                  الصورة
                </Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/super-admin")}
                  disabled={loading}
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="bg-amber-600 text-white hover:bg-amber-700"
                  onClick={handleOpenInstantModal}
                  disabled={loading}
                >
                  إنشاء في الحال
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "جاري الإنشاء..." : "إنشاء المقال"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <ArticleApprovalModal
        open={showInstantModal}
        onOpenChange={setShowInstantModal}
        onApprove={handleInstantPublish}
        loading={loading}
        title="نشر فوري"
        description="حدد إن كان المقال عاجلاً (ترند) وعدد أيام الترند، ثم يُنشَر مباشرة دون المراجعة."
        trendingLabel="عاجل (ترند)"
        confirmLabel="تأكيد النشر"
      />

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="arabic-text">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 space-x-reverse text-green-600">
              <span>✅</span>
              <span>تمام تم الإضافة</span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-lg">
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 space-x-reverse mt-4">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/dashboard/super-admin?tab=articles");
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              موافق
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="arabic-text">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 space-x-reverse text-red-600">
              <span>⚠️</span>
              <span>حقل مطلوب</span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-lg">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 space-x-reverse mt-4">
            <Button
              onClick={() => {
                setShowErrorModal(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              موافق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
