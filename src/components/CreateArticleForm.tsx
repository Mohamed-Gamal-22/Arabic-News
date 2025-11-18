"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { articleSchema, type ArticleFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faSave,
//   faPaperPlane,
//   faEye,
//   faImage,
//   faTag,
// } from "@fortawesome/free-solid-svg-icons";
import TinyMCEEditor from "./TinyMCEEditor";

export default function CreateArticleForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      status: "draft",
      isTrending: false,
    },
  });

  const content = watch("content");

  const onSubmit = async (data: ArticleFormData) => {
    setIsLoading(true);
    try {
      console.log("بيانات المقالة:", data);

      // محاكاة إرسال البيانات للـ API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // سيتم إرسال المقالة للـ API
      // await submitArticle(data);
    } catch (error) {
      console.error("خطأ في إنشاء المقالة:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    const formData = watch();
    setValue("status", "draft");
    await onSubmit({ ...formData, status: "draft" });
  };

  const handleSubmitForReview = async () => {
    const formData = watch();
    setValue("status", "pending");
    await onSubmit({ ...formData, status: "pending" });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold arabic-heading">
            إنشاء مقالة جديدة
          </CardTitle>
          <CardDescription className="arabic-text">
            اكتب مقالتك وأرسلها للمراجعة
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* العنوان */}
            <div className="space-y-2">
              <Label htmlFor="title" className="arabic-text">
                عنوان المقالة *
              </Label>
              <Input
                id="title"
                placeholder="أدخل عنوان المقالة"
                className="arabic-text"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-600 arabic-text">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* الملخص */}
            <div className="space-y-2">
              <Label htmlFor="summary" className="arabic-text">
                ملخص المقالة *
              </Label>
              <Textarea
                id="summary"
                placeholder="أدخل ملخص المقالة"
                className="arabic-text min-h-[100px]"
                {...register("summary")}
              />
              {errors.summary && (
                <p className="text-sm text-red-600 arabic-text">
                  {errors.summary.message}
                </p>
              )}
            </div>

            {/* الفئة */}
            <div className="space-y-2">
              <Label htmlFor="category" className="arabic-text">
                الفئة *
              </Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger className="arabic-text">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="سياسة">سياسة</SelectItem>
                  <SelectItem value="اقتصاد">اقتصاد</SelectItem>
                  <SelectItem value="رياضة">رياضة</SelectItem>
                  <SelectItem value="تكنولوجيا">تكنولوجيا</SelectItem>
                  <SelectItem value="عالمية">عالمية</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 arabic-text">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* الصورة الرئيسية */}
            <div className="space-y-2">
              <Label htmlFor="featuredImage" className="arabic-text">
                الصورة الرئيسية *
              </Label>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Input
                  id="featuredImage"
                  placeholder="رابط الصورة الرئيسية"
                  className="arabic-text"
                  {...register("featuredImage")}
                />
                <Button type="button" variant="outline" size="sm">
                  رفع صورة
                </Button>
              </div>
              {errors.featuredImage && (
                <p className="text-sm text-red-600 arabic-text">
                  {errors.featuredImage.message}
                </p>
              )}
            </div>

            {/* محرر المحتوى */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="arabic-text">محتوى المقالة *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? "تحرير" : "معاينة"}
                </Button>
              </div>

              {previewMode ? (
                <div
                  className="border rounded-lg p-4 min-h-[400px] bg-white dark:bg-gray-800 arabic-text"
                  dangerouslySetInnerHTML={{ __html: content || "" }}
                />
              ) : (
                <TinyMCEEditor
                  value={content || ""}
                  onChange={(value) => setValue("content", value)}
                  placeholder="اكتب محتوى المقالة هنا..."
                />
              )}

              {errors.content && (
                <p className="text-sm text-red-600 arabic-text">
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex gap-3 space-x-reverse">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                >
                  حفظ كمسودة
                </Button>

                <Button
                  type="button"
                  onClick={handleSubmitForReview}
                  disabled={isLoading}
                >
                  إرسال للمراجعة
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
