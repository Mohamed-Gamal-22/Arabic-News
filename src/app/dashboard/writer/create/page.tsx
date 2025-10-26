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
import LogoutButton from "@/components/LogoutButton";
import { createArticle } from "@/lib/api";
import { getCategories, Category } from "@/lib/api";

export default function CreateArticlePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

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

      // التحقق من الحقول المطلوبة
      if (!formData.title || !formData.title.trim()) {
        setError("يرجى إدخال عنوان للمقال");
        setLoading(false);
        return;
      }

      if (!formData.summary || !formData.summary.trim()) {
        setError("يرجى إدخال ملخص للمقال");
        setLoading(false);
        return;
      }

      if (!formData.content || !formData.content.trim()) {
        setError("يرجى إدخال محتوى للمقال");
        setLoading(false);
        return;
      }

      if (formData.content.trim().length < 50) {
        setError("المحتوى قصير جداً - يجب أن يكون على الأقل 50 حرف");
        setLoading(false);
        return;
      }

      if (formData.summary.trim().length < 20) {
        setError("الملخص قصير جداً - يجب أن يكون على الأقل 20 حرف");
        setLoading(false);
        return;
      }

      if (formData.title.trim().length < 10) {
        setError("العنوان قصير جداً - يجب أن يكون على الأقل 10 أحرف");
        setLoading(false);
        return;
      }

      if (!formData.slug || !formData.slug.trim()) {
        setError("يرجى إدخال رابط (Slug) للمقال");
        setLoading(false);
        return;
      }

      if (!formData.categoryId) {
        setError("يرجى اختيار قسم للمقال");
        setLoading(false);
        return;
      }

      // إنشاء FormData مع الأسماء الصحيحة للـ API
      const formDataToSend = new FormData();

      // تحويل CategoryId إلى رقم
      const categoryIdNum = parseInt(formData.categoryId);
      if (isNaN(categoryIdNum)) {
        setError("رقم القسم غير صحيح");
        setLoading(false);
        return;
      }

      console.log("Sending data to API:");
      console.log("Title:", formData.title);
      console.log("Summary:", formData.summary);
      console.log("Content:", formData.content);
      console.log("Content length:", formData.content?.length);
      console.log("Summary length:", formData.summary?.length);
      console.log("Slug:", formData.slug);
      console.log("CategoryId:", categoryIdNum);

      // التحقق من البيانات الفعلية
      console.log("=== ACTUAL DATA BEING SENT ===");
      console.log("Title:", formData.title);
      console.log("Summary:", formData.summary || "EMPTY!");
      console.log("Content:", formData.content || "EMPTY!");

      // استخدام الأسماء الصحيحة حسب API .NET - مينفعش الفايل والحقل يكمل في نفس الوقت
      formDataToSend.append("Title", formData.title);
      formDataToSend.append("Content", formData.content || "");
      formDataToSend.append("Summary", formData.summary || "");
      formDataToSend.append("Slug", formData.slug);
      formDataToSend.append("CategoryId", categoryIdNum.toString());

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

      if (formData.keywords && formData.keywords.trim()) {
        formDataToSend.append("Keywords", formData.keywords);
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
        alert("تم إنشاء المقال بنجاح!");
        router.push("/dashboard/writer");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ في إنشاء المقال");
      console.error("Error creating article:", err);
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
                <Textarea
                  id="content"
                  name="content"
                  required
                  value={formData.content}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={10}
                />
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

              <div className="flex justify-end space-x-4 space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/writer")}
                  disabled={loading}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "جاري الإنشاء..." : "إنشاء المقال"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
