"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoadingButton } from "@/components/ui/loading-button";
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
import { createArticle, getCurrentUserMe, ApiUser } from "@/lib/api";

export default function CreateArticlePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [categories, setCategories] = useState<ApiUser["categories"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    slug: "",
    categoryId: "",
    keywords: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  // الكلمات المفتاحية المقترحة
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
    const fetchUserCategories = async () => {
      if (!session?.accessToken) return;

      try {
        // جلب بيانات المستخدم الحالي من /api/authentication/me
        const userData = await getCurrentUserMe(session.accessToken);

        console.log("=== Writer User Data ===");
        console.log("User categories:", userData?.categories);
        console.log("User categoryIds:", userData?.categoryIds);

        if (userData?.categories && userData.categories.length > 0) {
          // عرض فقط الأقسام المسموح للكاتب بالكتابة فيها
          setCategories(userData.categories);
          console.log("✅ Writer allowed categories:", userData.categories);
        } else {
          // إذا لم يكن للكاتب أقسام مخصصة، نعرض رسالة
          console.log("⚠️ Writer has no assigned categories");
          setCategories([]);
          setError("لم يتم تخصيص أقسام لك بعد. يرجى التواصل مع المسؤول.");
        }
      } catch (err: unknown) {
        console.error("❌ Error fetching user categories:", err);
        setCategories([]);
        setError("حدث خطأ في جلب الأقسام المسموح لك بالكتابة فيها.");
      }
    };

    if (session) {
      fetchUserCategories();
    }
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
      // التحقق من وجود التوكن في الـ session
      if (!session?.accessToken) {
        setError("غير مصرح لك بالوصول - يرجى تسجيل الدخول مرة أخرى");
        setLoading(false);
        console.error("❌ Missing session accessToken:", session);
        console.log("Full session object:", JSON.stringify(session, null, 2));
        return;
      }

      const token = session.accessToken;
      console.log("=== Starting Article Creation ===");
      console.log("User email:", session.user?.email);
      console.log("User name:", session.user?.name);
      console.log("User role:", session.user?.role);
      console.log("Token available:", !!token);
      console.log("Using token:", token.substring(0, 30) + "...");
      console.log("Token length:", token.length);

      // التحقق من البيانات قبل الإرسال
      console.log("Form data summary:", {
        title: formData.title,
        slug: formData.slug,
        categoryId: formData.categoryId,
        keywords: formData.keywords,
        hasContent: !!formData.content,
        hasSummary: !!formData.summary,
      });

      // التحقق من جميع الحقول المطلوبة
      if (!formData.title || !formData.title.trim()) {
        setErrorMessage("العنوان مطلوب");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      if (!formData.summary || !formData.summary.trim()) {
        setErrorMessage("الملخص مطلوب");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      if (!formData.content || !formData.content.trim()) {
        setErrorMessage("المحتوى مطلوب");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      if (!formData.slug || !formData.slug.trim()) {
        setErrorMessage("الرابط (Slug) مطلوب");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      if (!formData.categoryId || !formData.categoryId.trim()) {
        setErrorMessage("القسم مطلوب");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      // لا توجد قيود على التصنيفات - يمكن للكاتب اختيار أي تصنيف

      if (!imageFile) {
        setErrorMessage("الصورة مطلوبة");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      // إنشاء FormData مع الأسماء الصحيحة للـ API
      const formDataToSend = new FormData();

      console.log("Sending data to API:");
      console.log("Title:", formData.title);
      console.log("Summary:", formData.summary);
      console.log("Content:", formData.content);
      console.log("Content length:", formData.content?.length);
      console.log("Summary length:", formData.summary?.length);
      console.log("Slug:", formData.slug);
      console.log("CategoryId:", formData.categoryId);

      // التحقق من البيانات الفعلية
      console.log("=== ACTUAL DATA BEING SENT ===");
      console.log("Title:", formData.title);
      console.log("Summary:", formData.summary || "EMPTY!");
      console.log("Content:", formData.content || "EMPTY!");

      // استخدام الأسماء الصحيحة حسب API .NET - CategoryId يجب أن يكون رقم (number)
      // formData.categoryId هو string من dropdown، نحوله إلى number
      const categoryId = formData.categoryId
        ? Number(formData.categoryId)
        : null;

      if (!categoryId || isNaN(categoryId)) {
        setErrorMessage("يجب اختيار قسم للمقال");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }

      formDataToSend.append("Title", formData.title);
      formDataToSend.append("Content", formData.content || "");
      formDataToSend.append("Summary", formData.summary || "");
      formDataToSend.append("Slug", formData.slug);
      // CategoryId يُرسل كـ number في FormData (FormData سيقوم بتحويله تلقائياً)
      formDataToSend.append("CategoryId", categoryId.toString()); // FormData يحتاج string لكن API يتوقع number

      console.log("CategoryId to send (as number):", categoryId);
      console.log("CategoryId type:", typeof categoryId);

      console.log("After FormData append:");
      console.log("Content in FormData:", formData.content || "MISSING!");
      console.log("Summary in FormData:", formData.summary || "MISSING!");

      if (imageFile) {
        formDataToSend.append("Image", imageFile);
        console.log(
          "Image file:",
          imageFile.name,
          imageFile.size,
          imageFile.type
        );
      }

      // إضافة Keywords كـ string مفصولة بفواصل
      if (formData.keywords && formData.keywords.trim()) {
        // التأكد من أن Keywords string مفصولة بفواصل
        const keywordsString = formData.keywords.trim();
        formDataToSend.append("Keywords", keywordsString);
        console.log("Keywords:", keywordsString);
      }

      // طباعة محتوى FormData للتحقق
      console.log("=== FINAL FORMDATA BEFORE SENDING ===");
      for (const [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(
            `${key}: "${value}" (length: ${value.toString().length})`
          );
        }
      }

      const createdArticle = await createArticle(formDataToSend, token);

      if (createdArticle) {
        setShowSuccessModal(true);
      }
    } catch (err: unknown) {
      console.error("=== Error Creating Article ===");
      console.error("Full error:", err);
      // معالجة رسالة الخطأ لعرضها بوضوح
      let displayError = "حدث خطأ في إنشاء المقال";

      if (err instanceof Error && err.message) {
        // إذا كانت الرسالة تحتوي على تفاصيل validation errors من الـ API
        if (err.message.includes(":")) {
          displayError = err.message; // عرض الرسالة كاملة مع أسماء الحقول
        } else {
          displayError = err.message;
        }
      }

      setErrorMessage(displayError);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

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
                {categories.length > 0 ? (
                  <Select
                    value={formData.categoryId}
                    onValueChange={handleSelectChange}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 arabic-text">
                    ⚠️ لا توجد تصنيفات متاحة. يرجى التواصل مع المدير لتعيين
                    التصنيفات المسموحة لك.
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="keywords" className="arabic-text">
                  الكلمات المفتاحية
                </Label>

                {/* الكلمات المختارة */}
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

                {/* الكلمات المقترحة */}
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

                {/* إضافة كلمة مفتاحية مخصصة */}
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
                  <LoadingButton
                    type="button"
                    variant="outline"
                    onClick={addCustomKeyword}
                  >
                    إضافة
                  </LoadingButton>
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

              <div className="flex justify-end space-x-4 space-x-reverse">
                <LoadingButton
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/writer")}
                  disabled={loading}
                >
                  إلغاء
                </LoadingButton>
                <LoadingButton
                  type="submit"
                  loading={loading}
                  loadingText="جاري الإنشاء..."
                >
                  إنشاء المقال
                </LoadingButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="arabic-text">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 space-x-reverse text-green-600">
              <span>✅</span>
              <span>تمام تم الإضافة</span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-lg">
              تم إنشاء المقال بنجاح!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 space-x-reverse mt-4">
            <LoadingButton
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/dashboard/writer");
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              موافق
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="arabic-text">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 space-x-reverse text-red-600">
              <span>⚠️</span>
              <span>خطأ في البيانات</span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-base">
              <div className="whitespace-pre-wrap text-right" dir="rtl">
                {errorMessage}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 space-x-reverse mt-4">
            <LoadingButton
              onClick={() => {
                setShowErrorModal(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              موافق
            </LoadingButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
