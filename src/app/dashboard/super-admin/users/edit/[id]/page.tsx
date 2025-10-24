"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import { getUserById, updateUser } from "@/lib/superAdminApi";

// Schema للتحقق من صحة البيانات - الحقول اختيارية للتعديل الجزئي
const updateUserSchema = z.object({
  Id: z.string(),
  Email: z.string().optional(),
  DisplayName: z.string().optional(),
  PhoneNumber: z.string().optional(),
  NationalId: z.string().optional(),
  UserName: z.string().optional(),
  FullName: z.string().optional(),
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
  const [userData, setUserData] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

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
        setError("");

        const userData = await getUserById(session.accessToken, userId);
        console.log("البيانات المسترجعة:", userData);
        console.log("FullName:", userData?.fullName);
        console.log("DisplayName:", userData?.displayName);
        console.log("UserName:", userData?.userName);
        console.log("Email:", userData?.email);

        // حفظ البيانات في state لعرضها
        setUserData(userData);

        console.log("تم حفظ البيانات للعرض");
      } catch (error: any) {
        console.error("خطأ في جلب بيانات المستخدم:", error);
        setError(error.message || "لم نتمكن من جلب بيانات المستخدم");
        setShowErrorModal(true);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserData();
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
        data.FullName ||
        data.DisplayName ||
        data.UserName ||
        data.Email ||
        data.PhoneNumber ||
        data.NationalId;

      if (!hasChanges) {
        setError("لم تقم بإدخال أي بيانات للتحديث");
        setShowErrorModal(true);
        setIsLoading(false);
        return;
      }

      // استخدام البيانات الحالية للمستخدم إذا لم يتم ملء حقل
      const updateData = {
        Id: userData.id,
        FullName: data.FullName || userData.fullName || "",
        DisplayName: data.DisplayName || userData.displayName || "",
        UserName: data.UserName || userData.userName || "",
        Email: data.Email || userData.email || "",
        PhoneNumber: data.PhoneNumber || userData.phoneNumber || "",
        NationalId: data.NationalId || userData.nationalId || "",
      };

      console.log("البيانات المرسلة للتحديث:", updateData);

      await updateUser(session.accessToken, updateData);
      setSuccess("تم تحديث المستخدم بنجاح!");
      setShowSuccessModal(true);

      // إعادة جلب البيانات المحدثة
      try {
        const updatedUserData = await getUserById(session.accessToken, userId);
        setUserData(updatedUserData);
      } catch (refreshError: any) {
        console.error("خطأ في إعادة جلب البيانات:", refreshError);
        // لا نعرض خطأ هنا لأن التحديث نجح بالفعل
      }

      // إعادة تعيين النموذج
      reset();
    } catch (error: any) {
      console.error("خطأ في تحديث المستخدم:", error);
      setError(error.message || "لم نتمكن من تحديث المستخدم");
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
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/super-admin")}
            >
              العودة للداشبورد
            </Button>
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
                <Label htmlFor="FullName" className="arabic-text">
                  الاسم الكامل
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
                  الاسم المعروض
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
                  اسم المستخدم
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
                  البريد الإلكتروني
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

              {/* رقم الهاتف */}
              <div className="space-y-2">
                <Label htmlFor="PhoneNumber" className="arabic-text">
                  رقم الهاتف
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
                  الرقم القومي
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

              {/* أزرار الإجراءات */}
              <div className="flex space-x-4 space-x-reverse pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/super-admin")}
                  className="flex-1"
                >
                  العودة للداشبورد
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
            <DialogTitle className="flex items-center space-x-2 space-x-reverse text-green-600">
              <span>✅</span>
              <span>تم بنجاح!</span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-lg">
              {success}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 space-x-reverse mt-4">
            <Button onClick={() => setShowSuccessModal(false)}>إغلاق</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="arabic-text">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 space-x-reverse text-red-600">
              <span>❌</span>
              <span>حدث خطأ!</span>
            </DialogTitle>
            <DialogDescription className="arabic-text text-lg">
              {error}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 space-x-reverse mt-4">
            <Button variant="outline" onClick={() => setShowErrorModal(false)}>
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
