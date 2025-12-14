"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createUser, getCategoriesWithToken } from "@/lib/superAdminApi";
import BackToDashboardButton from "@/components/BackToDashboardButton";

// Schema للتحقق من صحة البيانات
const createUserSchema = z.object({
  Email: z.string().email("البريد الإلكتروني غير صحيح"),
  DisplayName: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين"),
  PhoneNumber: z.string().min(10, "رقم الهاتف يجب أن يكون على الأقل 10 أرقام"),
  NationalId: z.string().min(5, "الرقم القومي يجب أن يكون على الأقل 5 أرقام"),
  Password: z.string().min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف"),
  UserName: z
    .string()
    .min(3, "اسم المستخدم يجب أن يكون على الأقل 3 أحرف")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "اسم المستخدم يجب أن يكون إنجليزي فقط (أحرف وأرقام و _ و -)"
    ),
  FullName: z.string().min(2, "الاسم الكامل يجب أن يكون على الأقل حرفين"),
  Role: z.string().min(1, "يجب اختيار دور"),
  CategoryIds: z.array(z.number()).min(1, "يجب اختيار تصنيف واحد على الأقل"),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  // جلب التصنيفات عند تحميل الصفحة
  useEffect(() => {
    const fetchCategories = async () => {
      if (!session?.accessToken) return;

      try {
        setLoadingCategories(true);
        const categoriesData = await getCategoriesWithToken(
          session.accessToken
        );
        // جلب كل التصنيفات (الرئيسية والفرعية)
        setCategories(categoriesData);
      } catch (error: unknown) {
        console.error("خطأ في جلب التصنيفات:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [session]);

  const onSubmit = async (data: CreateUserFormData) => {
    if (!session?.accessToken) {
      setError("ليس لديك صلاحية للوصول");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");
    setShowAlert(false);

    try {
      const result = await createUser(session.accessToken, {
        Email: data.Email,
        DisplayName: data.DisplayName,
        PhoneNumber: data.PhoneNumber,
        NationalId: data.NationalId,
        Password: data.Password,
        UserName: data.UserName,
        FullName: data.FullName,
        Roles: [data.Role],
        CategoryIds: selectedCategoryIds,
      });

      setSuccess("تم إضافة المستخدم بنجاح!");
      setShowAlert(true);
    } catch (error: unknown) {
      console.error("خطأ في إنشاء المستخدم:", error);
      setError(error.message || "حدث خطأ في إضافة المستخدم");
      setShowAlert(true);
      // لا يوجد إعادة توجيه في حالة الخطأ
    } finally {
      setIsLoading(false);
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
                إضافة مستخدم جديد
              </h1>
            </div>
            <div className="flex items-center gap-2 space-x-reverse">
              <BackToDashboardButton fallbackPath="/dashboard/super-admin?tab=users" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold arabic-heading">
              إضافة مستخدم جديد
            </CardTitle>
            <CardDescription className="arabic-text">
              أدخل بيانات المستخدم الجديد
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Loading State */}
            {isLoading && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 arabic-text text-center">
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>جاري إضافة المستخدم...</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* الاسم الكامل */}
              <div className="space-y-2">
                <Label htmlFor="FullName" className="arabic-text">
                  الاسم الكامل *
                </Label>
                <Input
                  id="FullName"
                  placeholder="أدخل الاسم الكامل"
                  className="arabic-text"
                  {...register("FullName")}
                />
                {errors.FullName && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.FullName.message}
                  </p>
                )}
              </div>

              {/* الاسم المعروض */}
              <div className="space-y-2">
                <Label htmlFor="DisplayName" className="arabic-text">
                  الاسم المعروض *
                </Label>
                <Input
                  id="DisplayName"
                  placeholder="أدخل الاسم المعروض"
                  className="arabic-text"
                  {...register("DisplayName")}
                />
                {errors.DisplayName && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.DisplayName.message}
                  </p>
                )}
              </div>

              {/* اسم المستخدم */}
              <div className="space-y-2">
                <Label htmlFor="UserName" className="arabic-text">
                  اسم المستخدم *
                </Label>
                <Input
                  id="UserName"
                  placeholder="أدخل اسم المستخدم (إنجليزي فقط)"
                  className="arabic-text"
                  {...register("UserName")}
                />
                {errors.UserName && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.UserName.message}
                  </p>
                )}
              </div>

              {/* البريد الإلكتروني */}
              <div className="space-y-2">
                <Label htmlFor="Email" className="arabic-text">
                  البريد الإلكتروني *
                </Label>
                <Input
                  id="Email"
                  type="email"
                  placeholder="أدخل البريد الإلكتروني"
                  className="arabic-text"
                  {...register("Email")}
                />
                {errors.Email && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.Email.message}
                  </p>
                )}
              </div>

              {/* كلمة المرور */}
              <div className="space-y-2">
                <Label htmlFor="Password" className="arabic-text">
                  كلمة المرور *
                </Label>
                <Input
                  id="Password"
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  className="arabic-text"
                  {...register("Password")}
                />
                {errors.Password && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.Password.message}
                  </p>
                )}
              </div>

              {/* رقم الهاتف */}
              <div className="space-y-2">
                <Label htmlFor="PhoneNumber" className="arabic-text">
                  رقم الهاتف *
                </Label>
                <Input
                  id="PhoneNumber"
                  placeholder="أدخل رقم الهاتف"
                  className="arabic-text"
                  {...register("PhoneNumber")}
                />
                {errors.PhoneNumber && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.PhoneNumber.message}
                  </p>
                )}
              </div>

              {/* الرقم القومي */}
              <div className="space-y-2">
                <Label htmlFor="NationalId" className="arabic-text">
                  الرقم القومي *
                </Label>
                <Input
                  id="NationalId"
                  placeholder="أدخل الرقم القومي"
                  className="arabic-text"
                  {...register("NationalId")}
                />
                {errors.NationalId && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.NationalId.message}
                  </p>
                )}
              </div>

              {/* الأدوار */}
              <div className="space-y-2">
                <Label htmlFor="Role" className="arabic-text">
                  الدور *
                </Label>
                <Select onValueChange={(value) => setValue("Role", value)}>
                  <SelectTrigger className="arabic-text">
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">كاتب (User)</SelectItem>
                    <SelectItem value="Admin">أدمن (Admin)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.Role && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.Role.message}
                  </p>
                )}
              </div>

              {/* التصنيفات */}
              <div className="space-y-2">
                <Label htmlFor="CategoryIds" className="arabic-text">
                  التصنيفات *
                </Label>

                {/* عرض التصنيفات المختارة كـ Tags */}
                {selectedCategoryIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    {selectedCategoryIds.map((categoryId) => {
                      const category = categories.find(
                        (cat: any) => cat.id === categoryId
                      );
                      if (!category) return null;

                      return (
                        <div
                          key={categoryId}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm arabic-text"
                        >
                          <span>{category.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newIds = selectedCategoryIds.filter(
                                (id) => id !== categoryId
                              );
                              setSelectedCategoryIds(newIds);
                              setValue("CategoryIds", newIds, {
                                shouldValidate: true,
                              });
                            }}
                            className="hover:bg-blue-200 rounded-full p-1 transition-colors"
                            aria-label={`إزالة ${category.name}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* عرض التصنيفات كـ Clickable Cards */}
                {loadingCategories ? (
                  <div className="text-sm text-gray-500 arabic-text">
                    جاري تحميل التصنيفات...
                  </div>
                ) : categories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                    {categories.map((category: any) => {
                      const isSelected = selectedCategoryIds.includes(
                        category.id
                      );
                      // تحديد نوع التصنيف (رئيسي أو فرعي)
                      const isSubCategory = category.parentId !== null;
                      const parentCategory = isSubCategory
                        ? categories.find(
                            (cat: any) => cat.id === category.parentId
                          )
                        : null;

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              const newIds = selectedCategoryIds.filter(
                                (id) => id !== category.id
                              );
                              setSelectedCategoryIds(newIds);
                              setValue("CategoryIds", newIds, {
                                shouldValidate: true,
                              });
                            } else {
                              const newIds = [
                                ...selectedCategoryIds,
                                category.id,
                              ];
                              setSelectedCategoryIds(newIds);
                              setValue("CategoryIds", newIds, {
                                shouldValidate: true,
                              });
                            }
                          }}
                          className={`text-right p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? "bg-blue-50 border-blue-500 shadow-sm"
                              : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between space-x-2 space-x-reverse">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 arabic-text">
                                {isSubCategory && parentCategory && (
                                  <span className="text-xs text-gray-500 font-normal">
                                    {parentCategory.name} /{" "}
                                  </span>
                                )}
                                {category.name}
                              </div>
                              {category.description && (
                                <div className="text-xs text-gray-500 mt-1 arabic-text line-clamp-2">
                                  {category.description}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <div className="shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 arabic-text border border-gray-300 rounded-lg p-4">
                    لا توجد تصنيفات متاحة
                  </div>
                )}
                {errors.CategoryIds && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.CategoryIds.message}
                  </p>
                )}
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex space-x-4 space-x-reverse pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/super-admin")}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري الإضافة...</span>
                    </div>
                  ) : (
                    "إضافة المستخدم"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Success Modal */}
      <Dialog open={showAlert && !!success} onOpenChange={setShowAlert}>
        <DialogContent className="arabic-text">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 space-x-reverse text-green-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>تم بنجاح!</span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-lg">
              {success}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 space-x-reverse mt-4">
            <Button
              onClick={() => router.push("/dashboard/super-admin?tab=users")}
            >
              تم
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showAlert && !!error} onOpenChange={setShowAlert}>
        <DialogContent className="arabic-text">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 space-x-reverse text-red-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>حدث خطأ!</span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-lg">
              {error}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 space-x-reverse mt-4">
            <Button variant="outline" onClick={() => setShowAlert(false)}>
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
