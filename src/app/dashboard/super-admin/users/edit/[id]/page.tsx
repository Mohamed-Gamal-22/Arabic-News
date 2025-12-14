"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  getUserById,
  updateUser,
  getCategoriesWithToken,
  ApiCategory,
} from "@/lib/superAdminApi";
import { ApiUser } from "@/lib/api";

// Schema للتحقق من صحة البيانات - الحقول اختيارية للتعديل الجزئي
const updateUserSchema = z.object({
  Id: z.string(),
  email: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal(""))
    .or(z.undefined()),
  displayName: z.string().optional(),
  phoneNumber: z.string().optional(),
  nationalId: z.string().optional(),
  userName: z.string().optional(),
  fullName: z.string().optional(),
  roles: z.array(z.string()).optional(),
  CategoryIds: z.array(z.number()).optional(),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export default function EditUserPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState<ApiUser | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  // جلب بيانات المستخدم عند تحميل الصفحة
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.accessToken || !userId) return;

      try {
        setLoadingData(true);
        setLoadingCategories(true);
        setError("");

        const [userData, categoriesData] = await Promise.all([
          getUserById(session.accessToken, userId),
          getCategoriesWithToken(session.accessToken),
        ]);

        console.log("البيانات المسترجعة:", userData);
        console.log("FullName:", userData?.fullName);
        console.log("DisplayName:", userData?.displayName);
        console.log("UserName:", userData?.userName);
        console.log("Email:", userData?.email);
        console.log("PhoneNumber:", userData?.phoneNumber);
        console.log("NationalId:", userData?.nationalId);
        console.log("CategoryIds:", userData?.categoryIds);
        console.log("Categories data:", categoriesData);

        // حفظ البيانات في state لعرضها
        setUserData(userData);
        setCategories(categoriesData || []);

        // تحديد التصنيفات المختارة من بيانات المستخدم
        if (userData?.categoryIds && Array.isArray(userData.categoryIds)) {
          setSelectedCategoryIds(userData.categoryIds);
          setValue("CategoryIds", userData.categoryIds);
        } else if (
          userData?.categoryIds &&
          Array.isArray(userData.CategoryIds)
        ) {
          setSelectedCategoryIds(userData.CategoryIds);
          setValue("CategoryIds", userData.CategoryIds);
        }

        console.log("تم حفظ البيانات للعرض");
      } catch (error: unknown) {
        console.error("خطأ في جلب بيانات المستخدم:", error);
        setError(
          error instanceof Error
            ? error.message
            : "لم نتمكن من جلب بيانات المستخدم"
        );
        setShowErrorModal(true);
      } finally {
        setLoadingData(false);
        setLoadingCategories(false);
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, userId, reset]);

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!session?.accessToken) {
      setError("ليس لديك صلاحية للوصول");
      setShowErrorModal(true);
      return;
    }

    if (!userData?.id) {
      setError("لم يتم تحميل بيانات المستخدم بعد");
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("البيانات من النموذج:", data);

      // فحص إذا كان المستخدم أدخل أي بيانات للتحديث
      const hasChanges =
        data.fullName ||
        data.displayName ||
        data.userName ||
        data.email ||
        data.phoneNumber ||
        data.nationalId ||
        data.roles ||
        data.CategoryIds;

      if (!hasChanges) {
        setError("لم تقم بإدخال أي بيانات للتحديث");
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }

      // استخدام البيانات الحالية للمستخدم إذا لم يتم ملء حقل
      const updateData = {
        Id: userData.id,
        fullName: data.fullName || userData.fullName || "",
        displayName: data.displayName || userData.displayName || "",
        userName: data.userName || userData.userName || "",
        email:
          data.email && data.email.trim() !== ""
            ? data.email
            : userData.email || "",
        phoneNumber: data.phoneNumber || userData.phoneNumber || "",
        nationalId: data.nationalId || userData.nationalId || "",
        roles: data.roles || userData.roles || [],
        CategoryIds:
          selectedCategoryIds.length > 0
            ? selectedCategoryIds
            : userData.categoryIds || [],
      };

      console.log("البيانات المرسلة للتحديث:", updateData);

      await updateUser(session.accessToken, updateData);
      setSuccess("تم تحديث المستخدم بنجاح!");
      setShowSuccessModal(true);

      // إعادة جلب البيانات المحدثة
      try {
        const updatedUserData = await getUserById(session.accessToken, userId);
        setUserData(updatedUserData);
      } catch (refreshError: unknown) {
        console.error("خطأ في إعادة جلب البيانات:", refreshError);
        // لا نعرض خطأ هنا لأن التحديث نجح بالفعل
      }

      // إعادة تعيين النموذج
      reset();
    } catch (error: unknown) {
      console.error("خطأ في تحديث المستخدم:", error);
      setError(
        error instanceof Error ? error.message : "لم نتمكن من تحديث المستخدم"
      );
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // عرض حالة التحميل
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 arabic-text">
            جاري تحميل بيانات المستخدم...
          </p>
        </div>
      </div>
    );
  }

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
                تعديل المستخدم
              </h1>
            </div>
            <div className="flex items-center gap-6 space-x-reverse">
              <Button
                onClick={() => router.push("/dashboard/super-admin?tab=users")}
                className="bg-blue-600 hover:bg-blue-700 text-white arabic-text"
              >
                العودة للقائمة الرئيسية
              </Button>
              <Button
                onClick={async () => {
                  await signOut({ callbackUrl: "/" });
                }}
                className="bg-red-600 hover:bg-red-700 text-white arabic-text"
              >
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold arabic-heading">
              تعديل بيانات المستخدم
            </CardTitle>
            <CardDescription className="arabic-text">
              قم بتعديل البيانات المطلوبة
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Loading State */}
            {isLoading && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 arabic-text text-center">
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>جاري تحديث المستخدم...</span>
                </div>
              </div>
            )}

            {/* عرض البيانات الحالية */}
            {userData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 arabic-text">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 arabic-heading">
                  البيانات الحالية للمستخدم
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">
                      الاسم الكامل:
                    </span>
                    <p className="text-gray-900">
                      {userData.fullName || "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      الاسم المعروض:
                    </span>
                    <p className="text-gray-900">
                      {userData.displayName || "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      اسم المستخدم:
                    </span>
                    <p className="text-gray-900">
                      {userData.userName || "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      البريد الإلكتروني:
                    </span>
                    <p className="text-gray-900">
                      {userData.email || "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      رقم الهاتف:
                    </span>
                    <p className="text-gray-900">
                      {userData.phoneNumber || "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      الرقم القومي:
                    </span>
                    <p className="text-gray-900">
                      {userData.nationalId || "غير محدد"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* نص توضيحي */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 arabic-text">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-yellow-600">💡</span>
                <p className="text-yellow-800">
                  املأ فقط الحقول التي تريد تعديلها. الحقول الفارغة ستحتفظ
                  بالبيانات الحالية.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* حقل مخفي للـ ID */}
              <input
                type="hidden"
                {...register("Id")}
                value={userData?.id || ""}
              />

              {/* الاسم الكامل */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="arabic-text">
                  الاسم الكامل
                </Label>
                <Input
                  id="fullName"
                  placeholder="أدخل الاسم الكامل"
                  className="arabic-text"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* الاسم المعروض */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="arabic-text">
                  الاسم المعروض
                </Label>
                <Input
                  id="displayName"
                  placeholder="أدخل الاسم المعروض"
                  className="arabic-text"
                  {...register("displayName")}
                />
                {errors.displayName && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.displayName.message}
                  </p>
                )}
              </div>

              {/* اسم المستخدم */}
              <div className="space-y-2">
                <Label htmlFor="userName" className="arabic-text">
                  اسم المستخدم
                </Label>
                <Input
                  id="userName"
                  placeholder="أدخل اسم المستخدم (إنجليزي فقط)"
                  className="arabic-text"
                  {...register("userName")}
                />
                {errors.userName && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.userName.message}
                  </p>
                )}
              </div>

              {/* البريد الإلكتروني */}
              <div className="space-y-2">
                <Label htmlFor="email" className="arabic-text">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="أدخل البريد الإلكتروني"
                  className="arabic-text"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* رقم الهاتف */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="arabic-text">
                  رقم الهاتف
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="أدخل رقم الهاتف"
                  className="arabic-text"
                  {...register("phoneNumber")}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* الرقم القومي */}
              <div className="space-y-2">
                <Label htmlFor="nationalId" className="arabic-text">
                  الرقم القومي
                </Label>
                <Input
                  id="nationalId"
                  placeholder="أدخل الرقم القومي"
                  className="arabic-text"
                  {...register("nationalId")}
                />
                {errors.nationalId && (
                  <p className="text-sm text-red-600 arabic-text">
                    {errors.nationalId.message}
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
                        (cat: { id: number }) => cat.id === categoryId
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
                    {categories.map((category: ApiCategory) => {
                      const isSelected = selectedCategoryIds.includes(
                        category.id
                      );
                      // تحديد نوع التصنيف (رئيسي أو فرعي)
                      const isSubCategory = category.parentId !== null;
                      const parentCategory = isSubCategory
                        ? categories.find(
                            (cat: { id: number }) =>
                              cat.id === category.parentId
                          )
                        : null;

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              const newIds = selectedCategoryIds.filter(
                                (id) => id !== (category as ApiCategory).id
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
                  onClick={() =>
                    router.push("/dashboard/super-admin?tab=users")
                  }
                  className="flex-1"
                  disabled={isLoading}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري التحديث...</span>
                    </div>
                  ) : (
                    "تحديث المستخدم"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
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
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
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
            <Button variant="outline" onClick={() => setShowErrorModal(false)}>
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
