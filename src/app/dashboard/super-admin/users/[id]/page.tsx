"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserById } from "@/lib/superAdminApi";
import { ApiUser } from "@/lib/api";

export default function UserDetailsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [userData, setUserData] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // جلب بيانات المستخدم عند تحميل الصفحة
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.accessToken || !userId) return;

      try {
        setLoading(true);
        setError("");

        const userData = await getUserById(session.accessToken, userId);
        console.log("بيانات المستخدم:", userData);

        setUserData(userData);
      } catch (error: unknown) {
        console.error("خطأ في جلب بيانات المستخدم:", error);
        setError(
          error instanceof Error
            ? error.message
            : "لم نتمكن من جلب بيانات المستخدم"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, userId]);

  const getRoleColor = (roles: string[]) => {
    if (!roles || roles.length === 0) return "bg-gray-100 text-gray-800";

    if (roles.includes("SuperAdmin")) {
      return "bg-purple-100 text-purple-800";
    } else if (roles.includes("Admin")) {
      return "bg-green-100 text-green-800";
    } else if (roles.includes("User")) {
      return "bg-blue-100 text-blue-800";
    } else {
      return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleText = (roles: string[]) => {
    if (!roles || roles.length === 0) return "غير معروف";

    if (roles.includes("SuperAdmin")) {
      return "سوبر أدمن";
    } else if (roles.includes("Admin")) {
      return "أدمن";
    } else if (roles.includes("User")) {
      return "كاتب";
    } else {
      return "غير معروف";
    }
  };

  // عرض حالة التحميل
  if (loading) {
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

  // عرض رسالة الخطأ
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600 arabic-heading">
              خطأ في تحميل البيانات
            </CardTitle>
            <CardDescription className="arabic-text">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/dashboard/super-admin?tab=users")}
              className="w-full"
            >
              العودة لقائمة المستخدمين
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // عرض رسالة عدم وجود بيانات
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="arabic-heading">المستخدم غير موجود</CardTitle>
            <CardDescription className="arabic-text">
              لم يتم العثور على بيانات المستخدم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/dashboard/super-admin?tab=users")}
              className="w-full"
            >
              العودة لقائمة المستخدمين
            </Button>
          </CardContent>
        </Card>
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
                تفاصيل المستخدم
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* بطاقة تفاصيل المستخدم */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-row-reverse">
              <div>
                <CardTitle className="arabic-heading text-right">
                  {userData.displayName || userData.fullName || "غير محدد"}
                </CardTitle>
                <CardDescription className="arabic-text">
                  معلومات المستخدم التفصيلية
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 space-x-reverse">
                <Button
                  onClick={() =>
                    router.push(
                      `/dashboard/super-admin/users/edit/${userData.id}`
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white arabic-text"
                  size="sm"
                >
                  تعديل
                </Button>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                    userData.roles || []
                  )}`}
                >
                  {getRoleText(userData.roles || [])}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* المعلومات الأساسية */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 arabic-heading border-b pb-2">
                  المعلومات الأساسية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 arabic-text">
                      اسم المستخدم
                    </p>
                    <p className="text-base text-gray-900 dark:text-white arabic-text">
                      {userData.userName || "غير محدد"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 arabic-text">
                      الاسم الكامل
                    </p>
                    <p className="text-base text-gray-900 dark:text-white arabic-text">
                      {userData.fullName || "غير محدد"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 arabic-text">
                      الاسم المعروض
                    </p>
                    <p className="text-base text-gray-900 dark:text-white arabic-text">
                      {userData.displayName || "غير محدد"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 arabic-text">
                      البريد الإلكتروني
                    </p>
                    <p className="text-base text-gray-900 dark:text-white arabic-text">
                      {userData.email || "غير محدد"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 arabic-text">
                      رقم الهاتف
                    </p>
                    <p className="text-base text-gray-900 dark:text-white arabic-text">
                      {userData.phoneNumber || "غير محدد"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 arabic-text">
                      الرقم القومي
                    </p>
                    <p className="text-base text-gray-900 dark:text-white arabic-text">
                      {userData.nationalId || "غير محدد"}
                    </p>
                  </div>
                  {userData.imageUrl && (
                    <div className="space-y-1 md:col-span-2">
                      <p className="text-sm font-medium text-gray-500 arabic-text">
                        رابط الصورة
                      </p>
                      <p className="text-base text-gray-900 dark:text-white arabic-text break-all">
                        {userData.imageUrl}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* الأدوار والصلاحيات */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 arabic-heading border-b pb-2">
                  الأدوار والصلاحيات
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userData.roles && userData.roles.length > 0 ? (
                    userData.roles.map((role: string) => (
                      <span
                        key={role}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                          [role]
                        )}`}
                      >
                        {getRoleText([role])}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 arabic-text">
                      لا توجد أدوار محددة
                    </span>
                  )}
                </div>
              </div>

              {/* التصنيفات */}
              {userData.categories && userData.categories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 arabic-heading border-b pb-2">
                    التصنيفات المرتبطة
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.categories.map(
                      (category: {
                        id: number;
                        name: string;
                        slug: string;
                      }) => (
                        <span
                          key={category.id}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm arabic-text"
                        >
                          {category.name}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* معرفات التصنيفات */}
              {userData.categoryIds && userData.categoryIds.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 arabic-heading border-b pb-2">
                    معرفات التصنيفات
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.categoryIds.map((categoryId: number) => (
                      <span
                        key={categoryId}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {categoryId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
